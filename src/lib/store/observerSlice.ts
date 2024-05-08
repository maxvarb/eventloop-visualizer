import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
	PopEntryActionPayload,
	PushEntryActionPayload,
	RemoveEntryActionPayload,
	State,
} from './types';

const initialState: State = {
	console: [],
	microtasks: [],
	macrotasks: [],
	webApis: [],
	callStack: [],
};

const observerSlice = createSlice({
	name: 'observer',
	initialState: initialState,
	reducers: {
		pushEntry: (state, action: PayloadAction<PushEntryActionPayload>) => {
			const { type, content } = action.payload;
			state[type].push(content);
		},
		popEntry: (state, action: PayloadAction<PopEntryActionPayload>) => {
			const { type } = action.payload;
			state[type].pop();
		},
		removeEntry: (
			state,
			action: PayloadAction<RemoveEntryActionPayload>
		) => {
			const { type, id } = action.payload;
			state[type] = state[type].filter((entry) => entry.id !== id);
		},
		cleanUp: (state) => {
			state = initialState;
		},
	},
});

export const { pushEntry, popEntry, removeEntry, cleanUp } =
	observerSlice.actions;
export default observerSlice.reducer;
