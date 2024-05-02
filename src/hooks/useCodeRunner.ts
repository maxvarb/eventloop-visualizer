import { useEffect } from 'react';

import { IrohRunner } from '@/lib/iroh';
import { IrohRuntimeEvent } from '@/types';

interface UseCodeRunnerProps {
	editorRef?: any;
}

type UseCodeRunnerReturn = [() => void, () => void];

export const useCodeRunner = ({
	editorRef,
}: UseCodeRunnerProps): UseCodeRunnerReturn => {
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
		} else if (e.key === 'ArrowUp') {
			const irohRuntimeEvent = iroh.getPrev();
			irohRuntimeEvent && updateCodeSelection(irohRuntimeEvent);
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

	useEffect(() => {
		return () => resetRunner();
	}, []);

	return [runCode, resetRunner];
};
