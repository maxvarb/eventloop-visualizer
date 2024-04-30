interface BlockLabelProps {
	label: string;
}

export const BlockLabel = ({ label }: BlockLabelProps) => {
	return (
		<div className="z-50 -top-4 horizontal-center bg-secondary px-6 py-1.5 rounded-md border-2 border-light">
			<h1 className="text-white text-md font-semibold break-words whitespace-nowrap">
				{label}
			</h1>
		</div>
	);
};
