import { useEffect, useRef } from 'react';

import { useDispatch } from 'react-redux';

import { mutateObserver } from '@/lib/store/sagas';
import { IrohRuntimeEvent, Step } from '@/types';
import { createEventSteps, timer } from '@/lib/utils';
import { useAppSelector } from '@/lib/store/hooks';

export const useStepper = () => {
	const dispatch = useDispatch();
	const macrotasks = useAppSelector((store) => store.macrotasks);
	const updatedMacrotasks = useRef(macrotasks);

	const executeRuntimeEvents = async (events: IrohRuntimeEvent[]) => {
		const steps = createEventSteps(
			events,
			updatedMacrotasks.current,
			dispatch
		);
		for (const step of steps) {
			const actionPayloadContent = getActionPayloadContent(step);
			dispatch(
				mutateObserver({
					type: step.initiator,
					operation: step.action,
					...actionPayloadContent,
				})
			);
			await timer(step.delayAfter || 2000);
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
		} else if (step.action === 'remove') {
			return {
				id: step.id,
			};
		}

		return {};
	};

	useEffect(() => {
		updatedMacrotasks.current = macrotasks;
	}, [macrotasks]);

	return [executeRuntimeEvents];
};
