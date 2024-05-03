import { useEffect } from 'react';

import { IrohRunner } from '@/lib/iroh';
import { IrohRuntimeEvent } from '@/types';
import { useAppDispatch } from '@/lib/store/hooks';

interface UseCodeRunnerProps {
	editorRef?: any;
}

type UseCodeRunnerReturn = [() => void, () => void];

const DIRECTION_TO_ACTION = {
	add: 'ADD_OBSERVER_ENTRY',
	pop: 'POP_OBSERVER_ENTRY',
};

type EventNameToObserverEntryType = {
	[key: string]: string;
};

const EVENT_NAME_TO_OBSERVER_ENTRY_TYPE: EventNameToObserverEntryType = {
	log: 'console',
};

export const useCodeRunner = ({
	editorRef,
}: UseCodeRunnerProps): UseCodeRunnerReturn => {
	const dispatch = useAppDispatch();

	let iroh: IrohRunner | null = null;

	const updateCodeSelection = (event: IrohRuntimeEvent) => {
		if (!event || !editorRef) return;
		const eventLocation = event.getLocation();
		editorRef.setSelection({
			startLineNumber: eventLocation.start.line,
			startColumn: eventLocation.start.column + 1,
			endLineNumber: eventLocation.end.line,
			endColumn: eventLocation.end.column + 1,
		});
	};

	const keyboardListener = (e: KeyboardEvent) => {
		if (!iroh) return;
		if (e.key === 'ArrowDown') {
			const irohRuntimeEvent = iroh.getNext();
			irohRuntimeEvent && updateCodeSelection(irohRuntimeEvent);
			updateObserverState(irohRuntimeEvent, 'add');
		} else if (e.key === 'ArrowUp') {
			const irohRuntimeEvent = iroh.getPrev();
			irohRuntimeEvent && updateCodeSelection(irohRuntimeEvent);
			updateObserverState(irohRuntimeEvent, 'pop');
		}
	};

	const runCode = () => {
		iroh = new IrohRunner(editorRef.getValue());
		eval(iroh.stage.script);
		if (editorRef) {
			document.addEventListener('keydown', keyboardListener);
		}
	};

	const resetRunner = () => {
		document.removeEventListener('keydown', keyboardListener);
		iroh = null;
		editorRef?.setSelection({
			startLineNumber: 0,
			startColumn: 0,
			endLineNumber: 0,
			endColumn: 0,
		});
	};

	const updateObserverState = (
		runtimeEvent: IrohRuntimeEvent,
		operation: 'add' | 'pop'
	) => {
		if (!iroh) return;
		const type = DIRECTION_TO_ACTION[operation];
		const payloadType =
			EVENT_NAME_TO_OBSERVER_ENTRY_TYPE[runtimeEvent.name];
		if (!payloadType) return;

		const actionPayload =
			operation === 'add'
				? {
						content: {
							position: runtimeEvent.getLocation(),
							textContent: 'hello world',
							eventsQueueIndex: iroh.getCurrentIndex(),
						},
					}
				: {};

		dispatch({
			type,
			payload: { ...actionPayload, type: payloadType, operation },
		});
	};

	useEffect(() => {
		return () => resetRunner();
	}, []);

	return [runCode, resetRunner];
};
