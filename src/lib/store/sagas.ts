import { all, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';

import { addEntry, popEntry } from './observerSlice';
import { AddEntryActionPayload, PopEntryActionPayload } from './types';

const OPERATION_NAME_TO_ACTION = {
	add: addEntry,
	pop: popEntry,
};

type MutateObserverAction = PopEntryActionPayload &
	AddEntryActionPayload & {
		operation: keyof typeof OPERATION_NAME_TO_ACTION;
	};

function* mutateObserver(action: PayloadAction<MutateObserverAction>) {
	const { payload } = action;
	const operation = OPERATION_NAME_TO_ACTION[payload.operation];
	yield put(operation({ ...payload }));
}

function* watchObserverMutation() {
	yield takeLatest(
		['ADD_OBSERVER_ENTRY', 'POP_OBSERVER_ENTRY'],
		mutateObserver
	);
}

export default function* rootSaga() {
	yield all([watchObserverMutation()]);
}
