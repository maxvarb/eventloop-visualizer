import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import { Editor, useMonaco } from '@monaco-editor/react';

import { useEffect } from 'react';

hljs.registerLanguage('javascript', javascript);

interface MonacoProps {
	onEditorLoad: (editor: any) => void;
}

const CODE = `console.log(1);

setTimeout(function () {
    console.log(2);
}, 0);

Promise.resolve()
    .then(function () {
        console.log(3);
    })
    .then(function () {
        console.log(4);
    });

const myPromise = new Promise(function(resolve, reject) {
	setTimeout(function() {
		resolve("foo");
	}, 300);
});`;

export const Monaco = ({ onEditorLoad }: MonacoProps) => {
	const monaco = useMonaco();

	useEffect(() => {
		if (monaco) {
			import('monaco-themes/themes/Monokai Bright.json')
				.then((data) => {
					monaco.editor.defineTheme('monokai-bright', data as any);
				})
				.then((_) => monaco.editor.setTheme('monokai-bright'));
		}
	}, [monaco]);

	return (
		<Editor
			defaultLanguage="javascript"
			defaultValue={CODE}
			options={{
				language: 'javascript',
				lineNumbersMinChars: 0,
				roundedSelection: false,
				scrollBeyondLastLine: false,
				readOnly: false,
				minimap: {
					enabled: false,
				},
				theme: 'monokai-bright',
				hover: {
					enabled: false,
				},
				quickSuggestions: false,
			}}
			onMount={onEditorLoad}
		></Editor>
	);
};
