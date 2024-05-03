import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AddEntryActionPayload, PopEntryActionPayload, State } from './types';

const initialState: State = {
	console: [],
	microtasks: [],
	macrotasks: [],
	webApis: [],
};

const observerSlice = createSlice({
	name: 'observer',
	initialState: initialState,
	reducers: {
		addEntry: (state, action: PayloadAction<AddEntryActionPayload>) => {
			const { type, content } = action.payload;
			state[type].push(content);
		},
		popEntry: (state, action: PayloadAction<PopEntryActionPayload>) => {
			const { type } = action.payload;
			state[type].pop();
		},
		cleanUp: (state) => {
			state = initialState;
		},
	},
});

export const { addEntry, popEntry, cleanUp } = observerSlice.actions;
export default observerSlice.reducer;
