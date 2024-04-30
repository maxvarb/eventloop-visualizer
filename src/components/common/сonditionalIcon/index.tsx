'use client';

import { Path } from '@/components/common';
import { AnimatePresence, motion } from 'framer-motion';

interface ConditionalIconProps {
	isCondition: boolean;
	firstPath: string;
	secondPath: string;
	className?: string;
}

export const ConditionalIcon = ({
	isCondition,
	firstPath,
	secondPath,
	className,
}: ConditionalIconProps) => {
	return (
		<motion.svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			className={className}
		>
			<AnimatePresence>
				{isCondition && (
					<Path
						d={firstPath}
						key={1}
						initial={{ y: 30, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: -30, opacity: 0 }}
						stroke="#043904"
					></Path>
				)}
				{!isCondition && (
					<Path
						d={secondPath}
						key={2}
						initial={{ y: 30, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: -30, opacity: 0 }}
						stroke="#043904"
					></Path>
				)}
			</AnimatePresence>
		</motion.svg>
	);
};
