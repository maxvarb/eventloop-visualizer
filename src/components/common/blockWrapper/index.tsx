'use client';

import { motion, Variants } from 'framer-motion';
import { forwardRef, Ref } from 'react';

import { cn } from '@/lib/utils';

import { BlockLabel } from './blockLabel';

interface BlockWrapperProps {
	className?: string;
	children: React.ReactNode;
	label?: string;
	noPadding?: boolean;
	appearanceIndex: number;
}

const variants: Variants = {
	initial: {
		opacity: 0,
		y: 50,
	},
	animate: (i) => ({
		opacity: 1,
		y: 0,
		transition: { duration: 0.2, delay: i * 0.2 },
	}),
};

export const BlockWrapper = forwardRef<HTMLDivElement, BlockWrapperProps>(
	(
		{
			className,
			children,
			noPadding,
			label,
			appearanceIndex,
		}: BlockWrapperProps,
		ref: Ref<HTMLDivElement>
	) => {
		return (
			<motion.div
				ref={ref}
				className={cn(
					className,
					!noPadding && 'pt-6 pb-2.5 px-2.5',
					'relative rounded-lg bg-primary text-white shadow-3xl'
				)}
				variants={variants}
				initial="initial"
				animate="animate"
				custom={appearanceIndex}
			>
				{label && <BlockLabel label={label} />}
				<div className="w-full h-full overflow-auto scrollbar-thumb-rounded-full scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400">
					{children}
				</div>
			</motion.div>
		);
	}
);

export const MotionBlockWrapper = motion(BlockWrapper);
