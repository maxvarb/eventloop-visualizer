import { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';

import { IrohRuntimeEvent, Step } from '@/types';

import {
	isEventConsoleLog,
	isEventSetTimeout,
	isEventStaticPromiseMethod,
} from './iroh';
import { StateValue } from '../store/types';
import { getSetTimoutDelay } from './code';
import { pushEntry, removeEntry } from '../store/observerSlice';

export const createEventSteps = (
	events: IrohRuntimeEvent[],
	macrotasks: StateValue[],
	dispatch: Dispatch<UnknownAction>
) => {
	const steps: Step[] = [];
	for (const event of events) {
		switch (event.data.type) {
			case 2: {
				// function call
				if (isEventSetTimeout(event.data)) {
					createSetTimoutFlow(steps, event, dispatch);
					break;
				}
				steps.push({
					id: uuid(),
					initiator: 'callStack',
					action: 'push',
					textContent: event.textContent,
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

				break;
			}
			case 3: {
				// function return
				if (isEventSetTimeout(event.data)) {
					break;
				}
				steps.push({
					id: uuid(),
					initiator: 'callStack',
					action: 'pop',
				});
				break;
			}
			case 4: {
				// function enter
				const functionOwner = macrotasks.find((el) =>
					el.textContent.includes(event.textContent)
				);
				if (functionOwner) {
					steps.push({
						id: functionOwner.id,
						initiator: 'macrotasks',
						action: 'remove',
					});
					steps.push({
						id: uuid(),
						initiator: 'callStack',
						action: 'push',
						textContent: event.textContent,
					});
				}
			}
			case 24: {
				// OP_NEW
				if (isEventStaticPromiseMethod(event.data)) {
					steps.push({
						id: uuid(),
						initiator: 'microtasks',
						action: 'push',
						textContent: event.textContent,
					});
				}
				break;
			}

			default:
			// noop.
		}
	}

	console.log('steps', steps);
	return steps;
};

const createSetTimoutFlow = (
	steps: Step[],
	event: IrohRuntimeEvent,
	dispatch: Dispatch<UnknownAction>
) => {
	const setTimeoutId = uuid();
	steps.push({
		id: setTimeoutId,
		initiator: 'webApis',
		action: 'push',
		textContent: event.textContent,
	});
	const delay = getSetTimoutDelay(event.textContent);
	setTimeout(
		() => {
			dispatch(
				removeEntry({
					type: 'webApis',
					id: setTimeoutId,
				})
			);
			dispatch(
				pushEntry({
					type: 'macrotasks',
					content: {
						id: uuid(),
						textContent: event.textContent,
					},
				})
			);
		},
		Math.max(delay, 2000)
	);
};
