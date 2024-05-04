interface ConsoleOutputLineProps {
	textContent: string;
}

export const ConsoleOutputLine = ({ textContent }: ConsoleOutputLineProps) => {
	return (
		<div className="w-full py-1">
			{`>>`} {textContent}
		</div>
	);
};
