import { CodeEditor } from '@/components/';
import { BlockWrapper } from '@/components/common';

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div className="z-10 w-full max-w-7xl items-center justify-between font-mono text-sm lg:flex">
				<div className="grid grid-rows-5 grid-cols-4 gap-4 w-full h-[700px]">
					<BlockWrapper colSpan={2} rowSpan={3} noPadding>
						<CodeEditor />
					</BlockWrapper>
					<BlockWrapper colSpan={1} rowSpan={3}>
						1
					</BlockWrapper>
					<BlockWrapper colSpan={1} rowSpan={3}>
						2
					</BlockWrapper>
					<BlockWrapper colSpan={2} rowSpan={2}>
						3
					</BlockWrapper>
					<BlockWrapper colSpan={2} rowSpan={1}>
						4
					</BlockWrapper>
					<BlockWrapper colSpan={2} rowSpan={1}>
						5
					</BlockWrapper>
				</div>
			</div>
		</main>
	);
}
