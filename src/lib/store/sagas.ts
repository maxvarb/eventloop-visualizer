import { all, put, takeLatest } from 'redux-saga/effects';
import { createAction, PayloadAction } from '@reduxjs/toolkit';

import { addEntry, popEntry } from './observerSlice';
import { AddEntryActionPayload, PopEntryActionPayload } from './types';

const OPERATION_NAME_TO_ACTION = {
	add: addEntry,
	pop: popEntry,
};

export type MutateObserverAction = PopEntryActionPayload &
	AddEntryActionPayload & {
		operation: keyof typeof OPERATION_NAME_TO_ACTION;
	};

function* mutateObserverQueue(action: PayloadAction<MutateObserverAction>) {
	const { payload } = action;
	const operation = OPERATION_NAME_TO_ACTION[payload.operation];
	yield put(operation({ ...payload }));
}

function* watchObserverMutation() {
	yield takeLatest(MUTATE_OBSERVER, mutateObserverQueue);
}

export default function* rootSaga() {
	yield all([watchObserverMutation()]);
}

export const MUTATE_OBSERVER = 'observer/mutate';
export const mutateObserver =
	createAction<MutateObserverAction>(MUTATE_OBSERVER);
