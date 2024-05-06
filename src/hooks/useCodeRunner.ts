import { useEffect } from 'react';

import { IrohRunner } from '@/lib/iroh';
import { IrohRuntimeEvent } from '@/types';
import { useAppDispatch } from '@/lib/store/hooks';
import { mutateObserver } from '@/lib/store/sagas';
import { State, StateValue } from '@/lib/store/types';

interface UseCodeRunnerProps {
	editorRef?: any;
}

type UseCodeRunnerReturn = [() => void, () => void];

type EventNameToObserverEntryType = {
	[key: string]: keyof State;
};

type Operation = 'add' | 'pop';

interface IrohProps {
	[key: string]: {
		getElement: () => IrohRuntimeEvent;
		operationName: Operation;
	};
}

const EVENT_NAME_TO_OBSERVER_ENTRY_TYPE: EventNameToObserverEntryType = {
	log: 'console',
};

export const useCodeRunner = ({
	editorRef,
}: UseCodeRunnerProps): UseCodeRunnerReturn => {
	const dispatch = useAppDispatch();

	let iroh: IrohRunner | null = null;

	const KEYBOARD_KEY_TO_IROH_PROPS: IrohProps = {
		ArrowUp: {
			getElement: () => iroh?.getPrevQueueElement(),
			operationName: 'pop',
		},
		ArrowDown: {
			getElement: () => iroh?.getNextQueueElement(),
			operationName: 'add',
		},
	};

	const updateCodeSelection = (event: IrohRuntimeEvent) => {
		if (!event || !editorRef) return;
		const eventLocation = event.data.getLocation();
		editorRef.setSelection({
			startLineNumber: eventLocation.start.line,
			startColumn: eventLocation.start.column + 1,
			endLineNumber: eventLocation.end.line,
			endColumn: eventLocation.end.column + 1,
		});
	};

	const keyboardListener = (e: KeyboardEvent) => {
		if (!iroh) return;
		const key = e.key;
		const irohProps = KEYBOARD_KEY_TO_IROH_PROPS[key];
		const irohRuntimeEvent = irohProps.getElement();
		console.log('irohRuntimeEvent', irohRuntimeEvent);
		if (irohRuntimeEvent) {
			updateCodeSelection(irohRuntimeEvent);
			updateObserverState(irohRuntimeEvent, irohProps.operationName);
		} else {
			console.log('execution completed');
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
		operation: Operation
	) => {
		const payloadType =
			EVENT_NAME_TO_OBSERVER_ENTRY_TYPE[runtimeEvent.data.name];
		if (!payloadType) return;

		const actionPayload = getActionEventPayload(runtimeEvent, operation);
		dispatch(
			mutateObserver({
				...actionPayload,
				type: payloadType,
				operation,
			})
		);
	};

	const getActionEventPayload = (
		runtimeEvent: IrohRuntimeEvent,
		operation: Operation
	): { content: StateValue } | null => {
		if (operation === 'pop') return null;
		const res = {
			content: {
				position: runtimeEvent.data.getLocation(),
				textContent: runtimeEvent.textContent,
				eventsQueueIndex: iroh!.getCurrentQueueElementIndex(),
			},
		};

		return res;
	};

	useEffect(() => {
		return () => resetRunner();
	}, []);

	return [runCode, resetRunner];
};
