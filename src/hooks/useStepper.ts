import { useDispatch } from 'react-redux';

import { mutateObserver } from '@/lib/store/sagas';
import { IrohRuntimeEvent, Step } from '@/types';
import { createEventSteps, timer } from '@/lib/utils';

export const useStepper = () => {
	const dispatch = useDispatch();

	const executeRuntimeEvents = async (events: IrohRuntimeEvent[]) => {
		const steps = createEventSteps(events);
		for (const step of steps) {
			const actionPayloadContent = getActionPayloadContent(step);
			// dispatch(
			// 	mutateObserver({
			// 		type: step.initiator,
			// 		operation: step.action,
			// 		...actionPayloadContent,
			// 	})
			// );
			await timer(step.delayAfter);
		}
	};

	const getActionPayloadContent = (step: Step) => {
		if (step.action === 'push') {
			return {
				content: {
					textContent: step.textContent,
					id: step.id,
				},
			};
		}

		return {};
	};

	return [executeRuntimeEvents];
};
