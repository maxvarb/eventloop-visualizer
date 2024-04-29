import { cn } from '@/lib/utils';
import { BlockLabel } from './blockLabel';

interface BlockWrapperProps {
	className?: string;
	children: React.ReactNode;
	label?: string;
	noPadding?: boolean;
}

export const BlockWrapper = ({
	className,
	children,
	noPadding,
	label,
}: BlockWrapperProps) => {
	return (
		<div
			className={cn(
				className,
				!noPadding && 'p-2.5',
				'relative rounded-lg bg-[#23292e] text-white shadow-[10px_10px_12px_0px_rgba(0,0,0,0.67)]'
			)}
		>
			{label && <BlockLabel label={label} />}
			{children}
		</div>
	);
};
