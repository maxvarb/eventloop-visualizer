'use client';

import { useAppSelector } from '@/lib/store/hooks';
import { StateKey } from '@/lib/store/types';
import { cn } from '@/lib/utils';
import { ReactNode, useMemo } from 'react';

interface EventsPanelProps {
	entityName: StateKey;
	RenderElement?: ReactNode;
	className?: string;
}

export const EventsPanel = ({
	entityName,
	RenderElement,
	className,
}: EventsPanelProps) => {
	const state = useAppSelector((store) => store[entityName]);

	const logs = useMemo(() => {
		return state.map((state) => state.textContent);
	}, [state]);

	return (
		<div className={cn('w-full h-full flex flex-col-reverse', className)}>
			{logs.map((log) => (
				<div key={log}>
					{RenderElement ? RenderElement : <div>{log}</div>}
				</div>
			))}
		</div>
	);
};
