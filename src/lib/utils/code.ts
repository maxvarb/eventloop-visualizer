import { IrohRuntimeEventLocation } from '@/types';

export const getSubstring = (
	str: string,
	position: IrohRuntimeEventLocation
): string => {
	const lines = str.split('\n');
	const startLine = position.start.line - 1;
	const startColumn = position.start.column - 1;
	const endLine = position.end.line - 1;
	const endColumn = position.end.column - 1;

	if (startLine === endLine) {
		return lines[startLine].substring(startColumn, endColumn + 1).trim();
	} else {
		const firstLine = lines[startLine].substring(startColumn);
		const middleLines = lines.slice(startLine + 1, endLine);
		const lastLine = lines[endLine].substring(0, endColumn + 1);

		return [firstLine, ...middleLines, lastLine].join('\n').trim();
	}
};

// Promise.resolve(10).then(function(res) {
//     console.log(res);
// })

// new Promise(function (res, rej) {
//     res(12);
// }).then(function (val) {
//     console.log(val)
// })

// const a = 5;
// console.log(23);
// function abc() {
// console.log(321)
// }
// abc()
