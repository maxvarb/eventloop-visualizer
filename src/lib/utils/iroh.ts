import { IrohRuntimeEventData } from '@/types';

export const isEventConsoleLog = (e: IrohRuntimeEventData) => {
	return (
		(e.object === console && e.callee === 'log') || e.object === console.log
	);
};
