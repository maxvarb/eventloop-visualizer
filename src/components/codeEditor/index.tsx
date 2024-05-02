'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

import './editorStyles.css';
import { EditorButtons } from '../editorButtons';
import { Monaco } from '../monaco';

interface CodeEditorProps {
	className?: string;
}

export const CodeEditor = ({ className }: CodeEditorProps) => {
	const [editorInstance, setEditorInstance] = useState<any | null>(null);

	return (
		<div
			className={cn(
				'w-full h-full relative bg-[#1a1e22] text-white overflow-hidden rounded-lg',
				className
			)}
		>
			<div className="h-10 bg-[rgb(231_231_231_/_6%)] relative">
				<div className="absolute -translate-y-2/4 left-2.5 top-2/4">
					<EditorButtons editorRef={editorInstance} />
				</div>
			</div>
			<div className="h-[calc(100%_-_60px)] overflow-y-auto px-2.5 py-1">
				<Monaco onEditorLoad={(monaco) => setEditorInstance(monaco)} />
			</div>
		</div>
	);
};
