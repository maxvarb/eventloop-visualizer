import { IrohRuntimeEventLocation } from '@/types';

export const getSubstring = (
	str: string,
	position: IrohRuntimeEventLocation
): string => {
	const { start, end } = position;
	const lines = str.split('\n');
	const startIndex = lines[start.line - 1].indexOf(
		lines[start.line - 1][start.column]
	);
	const endIndex = lines[end.line - 1].indexOf(
		lines[end.line - 1][end.column]
	);

	if (startIndex === -1 || endIndex === -1) {
		return '';
	}

	const substringLines = lines.slice(start.line - 1, end.line);

	substringLines[0] = substringLines[0].slice(startIndex);
	substringLines[substringLines.length - 1] = substringLines[
		substringLines.length - 1
	].slice(0, endIndex + 1);

	return substringLines.join('\n').trim();
};
