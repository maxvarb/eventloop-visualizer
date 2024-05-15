import { CodeEditor, ConsoleOutput } from '@/components';
import { EventsPanel } from '@/components/common';

export const BLOCKS = [
	{
		wrapperProps: {
			appearanceIndex: 1,
			label: 'Code',
			noPadding: true,
			className: 'col-span-2 row-span-3',
		},
		component: <CodeEditor />,
	},
	{
		wrapperProps: {
			appearanceIndex: 1,
			className: 'col-span-2 row-span-3',
			label: 'Call Stack',
		},
		component: (
			<EventsPanel
				entityName="callStack"
				className="flex-col-reverse"
			></EventsPanel>
		),
	},
	{
		wrapperProps: {
			appearanceIndex: 1,
			className: 'col-span-2 row-span-3',
			label: 'Web APIs',
		},
		component: (
			<EventsPanel
				entityName="webApis"
				className="flex-col-reverse"
			></EventsPanel>
		),
	},
	{
		wrapperProps: {
			appearanceIndex: 2,
			className: 'col-span-2 row-span-2',
			label: 'Console',
		},
		component: <ConsoleOutput />,
	},
	{
		wrapperProps: {
			appearanceIndex: 2,
			className: 'col-span-4 row-span-1',
			label: 'Microtasks Queue',
		},
		component: (
			<EventsPanel
				entityName="microtasks"
				className="flex-row"
			></EventsPanel>
		),
	},
	{
		wrapperProps: {
			appearanceIndex: 2,
			className: 'col-span-4 row-span-1',
			label: 'Macrotasks Queue',
		},
		component: (
			<EventsPanel
				entityName="macrotasks"
				className="flex-row"
			></EventsPanel>
		),
	},
];
