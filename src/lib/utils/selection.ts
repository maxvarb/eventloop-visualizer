import { IrohRuntimeEventLocation } from '@/types';

export const setEditorSelection = (
	editorRef: any,
	eventLocation: IrohRuntimeEventLocation
) => {
	editorRef?.setSelection({
		startLineNumber: eventLocation.start.line,
		startColumn: eventLocation.start.column + 1,
		endLineNumber: eventLocation.end.line,
		endColumn: eventLocation.end.column + 1,
	});
};

export const resetEditorSelection = (editorRef: any) => {
	editorRef?.setSelection({
		startLineNumber: 0,
		startColumn: 0,
		endLineNumber: 0,
		endColumn: 0,
	});
};
