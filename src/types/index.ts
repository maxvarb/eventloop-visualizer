interface IrohRuntimeEventLocation {
	start: {
		line: number;
		column: number;
	};
	end: {
		line: number;
		column: number;
	};
}

export interface IrohRuntimeEvent {
	getLocation: () => IrohRuntimeEventLocation;
	name: string;
}
