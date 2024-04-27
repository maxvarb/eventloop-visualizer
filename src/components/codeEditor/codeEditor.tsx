'use client';

import { useState } from 'react';

import Editor from 'react-simple-code-editor';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

import './editorTheme.css';

hljs.registerLanguage('javascript', javascript);

interface CodeEditorProps {
	className?: string;
}

export const CodeEditor = ({ className }: CodeEditorProps) => {
	const [code, setCode] = useState(
		`function add(a, b) {\n  return a + b;\n}`
	);

	return (
		<div className={className}>
			<div className="relative bg-[#1a1e22] text-white w-[calc(100%_-_60px)] overflow-hidden m-[30px] rounded-md">
				<div className="h-10 bg-[rgb(231_231_231_/_6%)] relative">
					<div className="flex items-center justify-center absolute -translate-y-2/4 left-2.5 top-2/4">
						<div className="w-2.5 h-2.5 mx-[5px] my-0 rounded-[50px] bg-[#ff5656]"></div>
						<div className="w-2.5 h-2.5 mx-[5px] my-0 rounded-[50px] bg-[#ffbc6a]"></div>
						<div className="w-2.5 h-2.5 mx-[5px] my-0 rounded-[50px] bg-[#67f772]"></div>
					</div>
				</div>
				<div className="h-[calc(100%_-_60px)] overflow-y-auto p-2.5">
					<Editor
						value={code}
						onValueChange={(code) => setCode(code)}
						highlight={(code) =>
							hljs.highlight(code, { language: 'javascript' })
								.value
						}
						padding={10}
						style={{
							fontFamily: '"Fira code", "Fira Mono", monospace',
							fontSize: 12,
						}}
					/>
				</div>
			</div>
		</div>
	);
};
