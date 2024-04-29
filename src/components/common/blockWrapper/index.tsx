import { cn } from '@/lib/utils';

interface BlockWrapperProps {
	className?: string;
	children: React.ReactNode;
	label?: string;
	colSpan: number;
	rowSpan: number;
	noPadding?: boolean;
}

export const BlockWrapper = ({
	className,
	children,
	colSpan,
	rowSpan,
	noPadding,
	label,
}: BlockWrapperProps) => {
	return (
		<div
			className={cn(
				className,
				!noPadding && 'p-2.5',
				`col-span-${colSpan} row-span-${rowSpan}`,
				'rounded-lg bg-[#23292e] text-white shadow-[10px_10px_12px_0px_rgba(0,0,0,0.67)]'
			)}
		>
			{children}
		</div>
	);
};
