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
	position?: EventSourcePosition;
	textContent?: string;
	eventsQueueIndex?: number;
}

export interface State {
	console: StateValue[];
	microtasks: StateValue[];
	macrotasks: StateValue[];
	webApis: StateValue[];
}

interface ActionPayload {
	type: keyof State;
}

export type PopEntryActionPayload = ActionPayload;

export interface AddEntryActionPayload extends ActionPayload {
	content: StateValue;
}
