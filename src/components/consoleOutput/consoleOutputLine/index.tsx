interface ConsoleOutputLineProps {
	textContent: string;
}

export const ConsoleOutputLine = ({ textContent }: ConsoleOutputLineProps) => {
	return (
		<code className="w-full py-1">
			{`>>`} {textContent}
		</code>
	);
};
