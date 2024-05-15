'use client';

import { ReactNode, useMemo } from 'react';

import { AnimatePresence, motion, Variants } from 'framer-motion';

import { useAppSelector } from '@/lib/store/hooks';
import { StateKey } from '@/lib/store/types';
import { cn } from '@/lib/utils';

type EventsPanelType = 'stack' | 'queue';

interface EventsPanelProps {
	entityName: StateKey;
	type: EventsPanelType;
	RenderElement?: ReactNode;
	className?: string;
}

const variants: Variants = {
	'hidden-stack': {
		opacity: 0,
		y: -350,
	},
	'hidden-queue': {
		opacity: 0,
		x: 450,
	},
	visible: {
		opacity: 1,
		y: 0,
		x: 0,
		transition: { duration: 0.3 },
	},
};

const TYPE_TO_CLASSNAME: Record<EventsPanelType, string> = {
	stack: 'flex-col-reverse',
	queue: 'flex-row',
};

export const EventsPanel = ({
	entityName,
	type,
	RenderElement,
	className,
}: EventsPanelProps) => {
	const state = useAppSelector((store) => store[entityName]);

	const logs = useMemo(() => {
		return state.map((state) => state.textContent);
	}, [state]);

	return (
		<div
			className={cn(
				'w-full h-full flex gap-2 scrollbar-thumb-rounded-full overflow-auto scrollbar-none',
				TYPE_TO_CLASSNAME[type],
				className
			)}
		>
			<AnimatePresence initial={false}>
				{logs.map((log) => (
					<motion.div
						variants={variants}
						initial={`hidden-${type}`}
						animate="visible"
						exit={`hidden-${type}`}
						key={log}
					>
						{RenderElement ? (
							RenderElement
						) : (
							<div className="w-full h-auto px-4 py-2 rounded-md bg-[#1e2327]">
								{log}
							</div>
						)}
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
};
