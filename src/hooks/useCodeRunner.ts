import { MutableRefObject, useEffect } from 'react';

import { IrohRunner } from '@/lib/iroh';
import { IrohRuntimeEvent } from '@/types';

interface UseCodeRunnerProps {
	code: string;
	editorRef?: MutableRefObject<any>;
}

type UseCodeRunnerReturn = [() => void];

export const useCodeRunner = ({
	code,
	editorRef,
}: UseCodeRunnerProps): UseCodeRunnerReturn => {
	const iroh = new IrohRunner(code);

	const updateCodeSelection = (event: IrohRuntimeEvent) => {
		if (!event || !editorRef) return;
		const eventLocation = event.getLocation();
		editorRef.current.setSelection({
			startLineNumber: eventLocation.start.line,
			startColumn: eventLocation.start.column + 1,
			endLineNumber: eventLocation.end.line,
			endColumn: eventLocation.end.column + 1,
		});
	};

	const keyboardListener = (e: KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			const irohRuntimeEvent = iroh.getNext();
			irohRuntimeEvent && updateCodeSelection(irohRuntimeEvent);
		} else if (e.key === 'ArrowUp') {
			const irohRuntimeEvent = iroh.getPrev();
			irohRuntimeEvent && updateCodeSelection(irohRuntimeEvent);
		}
	};

	const runCode = () => {
		console.log('eval');
		eval(iroh.stage.script);
		if (editorRef) {
			window.addEventListener('keydown', keyboardListener);
		}
	};

	useEffect(() => {
		return () => window.removeEventListener('keydown', keyboardListener);
	});

	return [runCode];
};
