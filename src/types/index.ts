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
}

export interface IrohRuntimeEvent {
	data: IrohRuntimeEventData;
	textContent: string[];
}
