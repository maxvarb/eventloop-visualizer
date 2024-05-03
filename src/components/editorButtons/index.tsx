import { memo, useContext, useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { useCodeRunner } from '@/hooks/useCodeRunner';

import { Button, ConditionalIcon } from '../common';
import { RefreshIcon } from '../common/icons';

interface EditorButtonsProps {
	editorRef: any;
}

const PLAY_ICON_PATH =
	'M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z';
const STOP_ICON_PATH =
	'M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z';

export const EditorButtons = ({ editorRef }: EditorButtonsProps) => {
	const [isExecuteMode, setIsExecuteMode] = useState(false);
	const [runCode, resetRunner] = useCodeRunner({ editorRef });

	const handleStartEvalClick = () => {
		isExecuteMode ? resetRunner() : runCode();
		setIsExecuteMode(!isExecuteMode);
	};

	return (
		<motion.div className="flex items-center justify-center" layout>
			{!isExecuteMode && (
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
				colorVariant={isExecuteMode ? 'error' : 'success'}
				className="mx-[5px]"
				onClick={handleStartEvalClick}
			>
				<ConditionalIcon
					isCondition={isExecuteMode}
					firstPath={STOP_ICON_PATH}
					secondPath={PLAY_ICON_PATH}
					className="w-4 h-4"
				/>
			</Button>
		</motion.div>
	);
};
