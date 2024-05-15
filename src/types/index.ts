import { State, StateKey } from '@/lib/store/types';

export interface IrohRuntimeEventLocation {
	start: {
		line: number;
		column: number;
	};
	end: {
		line: number;
		column: number;
	};
}

export interface IrohRuntimeEventData {
	getLocation: () => IrohRuntimeEventLocation;
	name: string;
	object: any;
	callee: string;
	arguments: any[];
	type: number;
	category: number;
}

export interface IrohRuntimeEvent {
	data: IrohRuntimeEventData;
	textContent: string;
	isIgnored: boolean;
}

export interface Step {
	id: string;
	initiator: StateKey;
	action: 'push' | 'pop' | 'remove';
	textContent?: string | number;
	delayAfter?: number;
}
