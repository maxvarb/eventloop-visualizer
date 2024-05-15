import { BlockWrapper } from '@/components/common';
import { BLOCKS } from '@/lib/config';

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-20">
			<div className="z-10 w-full max-w-7xl items-center justify-between font-mono text-sm lg:flex">
				<div className="grid grid-rows-5 grid-cols-6 gap-5 w-full h-[750px]">
					{BLOCKS.map((block, index) => (
						<BlockWrapper key={index} {...block.wrapperProps}>
							{block.component}
						</BlockWrapper>
					))}
				</div>
			</div>
		</main>
	);
}
