export interface EventSourcePosition {
	start: {
		line: number;
		column: number;
	};
	end: {
		line: number;
		column: number;
	};
}

export interface StateValue {
	position: EventSourcePosition;
	textContent: string;
	eventsQueueIndex: number;
}

export interface State {
	console: StateValue[];
	microtasks: StateValue[];
	macrotasks: StateValue[];
	webApis: StateValue[];
}

export interface ActionPayload {
	type: keyof State;
	content: StateValue;
}
