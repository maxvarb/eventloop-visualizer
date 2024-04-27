import { IrohRunner } from '@/lib/iroh';
import { IrohRuntimeEvent } from '@/types';
import { useEffect } from 'react';

interface UseCodeRunnerProps {
	code: string;
	textarea?: HTMLTextAreaElement;
}

type UseCodeRunnerReturn = [() => void];

export const useCodeRunner = ({
	code,
	textarea,
}: UseCodeRunnerProps): UseCodeRunnerReturn => {
	const iroh = new IrohRunner(code);

	const updateCodeSelection = (event: IrohRuntimeEvent) => {
		if (!event) return;
		const eventLocation = event.getLocation();
		console.log('eventLocation', eventLocation);
		console.log('textarea', textarea);
		textarea!.focus();
		textarea!.setSelectionRange(
			eventLocation.start.column,
			eventLocation.end.column
		);
	};

	const keyboardListener = (e: KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			const irohRuntimeEvent = iroh.getNext();
			updateCodeSelection(irohRuntimeEvent);
		} else if (e.key === 'ArrowUp') {
			const irohRuntimeEvent = iroh.getPrev();
			updateCodeSelection(irohRuntimeEvent);
		}
	};

	const runCode = () => {
		eval(iroh.stage.script);
		console.log(
			iroh.getQueue().forEach((el) => console.log(el.getLocation()))
		);
		if (textarea) {
			window.addEventListener('keydown', keyboardListener);
		}
	};

	useEffect(() => {
		return () => window.removeEventListener('keydown', keyboardListener);
	});

	return [runCode];
};
