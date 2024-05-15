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
	textContent: string;
	id: string;
}

export interface State {
	console: StateValue[];
	microtasks: StateValue[];
	macrotasks: StateValue[];
	webApis: StateValue[];
	callStack: StateValue[];
}

export type StateKey = keyof State;

export interface BaseActionPayload {
	type: keyof State;
}

export interface PushEntryActionPayload extends BaseActionPayload {
	content: StateValue;
}

export type PopEntryActionPayload = BaseActionPayload;

export interface RemoveEntryActionPayload extends BaseActionPayload {
	id: string;
}

export type StoreMutationOperation = 'push' | 'pop' | 'remove';
