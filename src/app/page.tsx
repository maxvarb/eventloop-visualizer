import { CodeEditor } from '@/components/';

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div className="z-10 w-full max-w-7xl items-center justify-between font-mono text-sm lg:flex">
				<div className="grid grid-rows-5 grid-cols-4 gap-4 w-full h-[700px]">
					<div className="col-span-2 row-span-3 bg-red-200">
						<CodeEditor className="w-full h-full" />
					</div>
					<div className="col-span-1 row-span-3 bg-red-200"></div>
					<div className="col-span-1 row-span-3 bg-red-200"></div>
					<div className="col-span-2 row-span-2 bg-red-200"></div>
					<div className="col-span-2 row-span-1 bg-red-200"></div>
					<div className="col-span-2 row-span-1 bg-red-200"></div>
				</div>
			</div>
		</main>
	);
}
