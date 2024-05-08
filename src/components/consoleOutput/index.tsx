'use client';

import { useAppSelector } from '@/lib/store/hooks';
import { ConsoleOutputLine } from './consoleOutputLine';
import { useMemo } from 'react';

export const ConsoleOutput = () => {
	const consoleState = useAppSelector((store) => store.console);

	const logs = useMemo(() => {
		return consoleState.map((state) => state.textContent);
	}, [consoleState]);

	return (
		<div className="w-full h-full flex flex-col">
			{logs.map((log, index) => (
				<ConsoleOutputLine key={index} textContent={log} />
			))}
		</div>
	);
};
