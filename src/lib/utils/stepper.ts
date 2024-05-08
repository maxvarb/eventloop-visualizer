import { v4 as uuid } from 'uuid';

import { isEventConsoleLog } from './iroh';

import { IrohRuntimeEvent, Step } from '@/types';

export const createEventSteps = (events: IrohRuntimeEvent[]) => {
	const steps: Step[] = [];
	for (const event of events) {
		console.log(
			'event',
			event.data.type,
			event.data.object,
			event.data.name
		);
		switch (event.data.type) {
			case 2: {
				// function call
				steps.push({
					id: uuid(),
					initiator: 'callStack',
					action: 'push',
					textContent: event.textContent,
					delayAfter: 2000,
				});
				if (isEventConsoleLog(event.data)) {
					steps.push({
						id: uuid(),
						initiator: 'console',
						action: 'push',
						textContent: event.data.arguments.join(' '),
						delayAfter: 0,
					});
				}
			}
			case 3: // function return
				steps.push({
					id: uuid(),
					initiator: 'callStack',
					action: 'pop',
					delayAfter: 2000,
				});
			default:
			// noop.
		}
	}

	return steps;
};
