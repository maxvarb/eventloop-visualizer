import { IrohRuntimeEventData } from '@/types';

export const isEventConsoleLog = (e: IrohRuntimeEventData) => {
	return (
		(e.object === console && e.callee === 'log') || e.object === console.log
	);
};

export const isEventStaticPromiseMethod = (e: IrohRuntimeEventData) => {
	return (
		(e.object === Promise &&
			(e.callee === 'resolve' || e.callee === 'reject')) ||
		e.object === Promise.resolve ||
		e.object === Promise.reject
	);
};
