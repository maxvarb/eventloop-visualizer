import { all, put, takeLatest } from 'redux-saga/effects';
import { createAction, PayloadAction } from '@reduxjs/toolkit';

import { addEntry, popEntry } from './observerSlice';
import { ActionPayload } from './types';

const OPERATION_NAME_TO_ACTION = {
	add: addEntry,
	pop: popEntry,
};

export type MutateObserverAction = ActionPayload & {
	operation: keyof typeof OPERATION_NAME_TO_ACTION;
};

function* mutateObserverQueue(action: PayloadAction<MutateObserverAction>) {
	const { payload } = action;
	if (payload.operation === 'add') {
		yield put(addEntry({ ...payload } as Required<ActionPayload>));
	} else {
		yield put(popEntry({ ...payload }));
	}
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
