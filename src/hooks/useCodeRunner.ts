import { useEffect } from 'react';

import { IrohRunner } from '@/lib/iroh';
import { IrohRuntimeEvent } from '@/types';
import { resetEditorSelection, setEditorSelection } from '@/lib/utils';

import { useStepper } from './useStepper';

interface UseCodeRunnerProps {
	editorRef?: any;
}

type UseCodeRunnerReturn = [() => void, () => void];

interface IrohProps {
	[key: string]: () => IrohRuntimeEvent;
}

export const useCodeRunner = ({
	editorRef,
}: UseCodeRunnerProps): UseCodeRunnerReturn => {
	const [executeRuntimeEvents] = useStepper();

	let iroh: IrohRunner | null = null;

	const KEYBOARD_KEY_TO_GET_QUEUE_ELEMENT: IrohProps = {
		ArrowUp: () => iroh?.getPrevQueueElement(),
		ArrowDown: () => iroh?.getNextQueueElement(),
	};

	const updateCodeSelection = (event: IrohRuntimeEvent) => {
		if (!event || !editorRef) return;
		const eventLocation = event.data.getLocation();
		setEditorSelection(editorRef, eventLocation);
	};

	const keyboardListener = (e: KeyboardEvent) => {
		if (!iroh) return;
		const queue = getIrohQueue(e.key);
		if (queue === null) return;

		const visibleRuntimeEvent = queue[queue.length - 1];
		if (visibleRuntimeEvent) {
			updateCodeSelection(visibleRuntimeEvent);
			executeRuntimeEvents(queue);
		} else {
			console.log('execution completed');
		}
	};

	const getIrohQueue = (key: string) => {
		const getNextElement = KEYBOARD_KEY_TO_GET_QUEUE_ELEMENT[key];
		if (!getNextElement) return null;

		const elementsQueue = [];
		let irohRuntimeEvent = getNextElement();
		while (irohRuntimeEvent?.isIgnored) {
			elementsQueue.push(irohRuntimeEvent);
			irohRuntimeEvent = getNextElement();
		}

		return [...elementsQueue, irohRuntimeEvent];
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
		resetEditorSelection(editorRef);
	};

	useEffect(() => {
		return () => resetRunner();
	}, []);

	return [runCode, resetRunner];
};
