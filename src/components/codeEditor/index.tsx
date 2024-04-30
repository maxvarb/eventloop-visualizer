'use client';

import { useEffect, useRef, useState } from 'react';

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import { Editor, useMonaco } from '@monaco-editor/react';

import { useCodeRunner } from '@/hooks/useCodeRunner';
import { cn } from '@/lib/utils';

import { Button, ConditionalIcon } from '../common';
import './editorStyles.css';
import { AnimatePresence } from 'framer-motion';
import { RefreshIcon } from '../common/icons';

hljs.registerLanguage('javascript', javascript);

interface CodeEditorProps {
	className?: string;
}

const PLAY_ICON_PATH =
	'M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z';
const PAUSE_ICON_PATH = 'M15.75 5.25v13.5m-7.5-13.5v13.5';
const STOP_ICON_PATH =
	'M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z';
const REFRESH_ICON_PATH =
	'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99';

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
		setIsPlay(!isPlay);
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

	const [isPlay, setIsPlay] = useState(true);

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
						{isPlay && (
							<Button
								variant="button-icon"
								colorVariant="error"
								className="mx-[5px]"
							>
								<RefreshIcon className="w-4 h-4" />
							</Button>
						)}
						<Button
							variant="button-icon"
							colorVariant={isPlay ? 'success' : 'error'}
							className="mx-[5px]"
							onClick={handleStartEvalClick}
						>
							<ConditionalIcon
								isCondition={isPlay}
								firstPath={PLAY_ICON_PATH}
								secondPath={STOP_ICON_PATH}
								className="w-4 h-4"
							/>
						</Button>
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
