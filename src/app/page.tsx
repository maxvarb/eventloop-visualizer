import { CodeEditor } from '@/components/';
import { BlockWrapper } from '@/components/common';

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div className="z-10 w-full max-w-7xl items-center justify-between font-mono text-sm lg:flex">
				<div className="grid grid-rows-5 grid-cols-4 gap-5 w-full h-[700px]">
					<BlockWrapper
						label="Code"
						noPadding
						className="col-span-2 row-span-3"
					>
						<CodeEditor />
					</BlockWrapper>
					<BlockWrapper
						className="col-span-1 row-span-3"
						label="Call Stack"
					>
						1
					</BlockWrapper>
					<BlockWrapper
						className="col-span-1 row-span-3"
						label="Web APIs"
					>
						2
					</BlockWrapper>
					<BlockWrapper
						className="col-span-2 row-span-2"
						label="Console"
					>
						3
					</BlockWrapper>
					<BlockWrapper
						className="col-span-2 row-span-1"
						label="Microtasks Queue"
					>
						4
					</BlockWrapper>
					<BlockWrapper
						className="col-span-2 row-span-1"
						label="Macrotasks Queue"
					>
						5
					</BlockWrapper>
				</div>
			</div>
		</main>
	);
}
