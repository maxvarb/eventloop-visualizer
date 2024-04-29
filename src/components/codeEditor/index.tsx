'use client';

import { useEffect, useRef, useState } from 'react';

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

import { useCodeRunner } from '@/hooks/useCodeRunner';

import './editorStyles.css';
import { Editor, useMonaco } from '@monaco-editor/react';
import { cn } from '@/lib/utils';

hljs.registerLanguage('javascript', javascript);

interface CodeEditorProps {
	className?: string;
}

export const CodeEditor = ({ className }: CodeEditorProps) => {
	const editorRef = useRef<any | null>(null);
	const monaco = useMonaco();

	const [code, setCode] = useState<string>(
		`console.log(1);

		setTimeout(function () {
		  console.log(2);
		}, 0);
		
		Promise.resolve()
		  .then(function () {
			console.log(3);
		  })
		  .then(function () {
			console.log(4);
		  });`
	);

	const handleStartEvalClick = () => {
		runCode();
	};

	const [runCode] = useCodeRunner({ code, editorRef });

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
		<>
			<div
				className={cn(
					'w-full h-full relative bg-[#1a1e22] text-white overflow-hidden rounded-lg',
					className
				)}
			>
				<div className="h-10 bg-[rgb(231_231_231_/_6%)] relative">
					<div className="flex items-center justify-center absolute -translate-y-2/4 left-2.5 top-2/4">
						<div className="w-2.5 h-2.5 mx-[5px] my-0 rounded-[50px] bg-[#ff5656]"></div>
						<div className="w-2.5 h-2.5 mx-[5px] my-0 rounded-[50px] bg-[#ffbc6a]"></div>
						<div
							className="w-2.5 h-2.5 mx-[5px] my-0 rounded-[50px] bg-[#67f772]"
							onClick={handleStartEvalClick}
						></div>
					</div>
				</div>
				<div className="h-[calc(100%_-_60px)] overflow-y-auto px-2.5 py-1">
					<Editor
						onChange={(newValue) => setCode(newValue || '')}
						defaultLanguage="javascript"
						defaultValue={code}
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
						onMount={(editor) => {
							editorRef.current = editor;
						}}
					></Editor>
				</div>
			</div>
		</>
	);
};
