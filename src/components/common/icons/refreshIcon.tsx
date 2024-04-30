import { motion, SVGMotionProps } from 'framer-motion';
import { Path } from '../path';

export const RefreshIcon = ({ className }: SVGMotionProps<'svg'>) => {
	return (
		<motion.svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			className={className}
		>
			<Path
				d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
				key={2}
				initial={{ y: 30, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: -30, opacity: 0 }}
				stroke="#043904"
			></Path>
		</motion.svg>
	);
};
