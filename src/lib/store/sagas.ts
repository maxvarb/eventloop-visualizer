import { all, put, takeLatest } from 'redux-saga/effects';
import { createAction, PayloadAction } from '@reduxjs/toolkit';

import {
	PopEntryActionPayload,
	PushEntryActionPayload,
	RemoveEntryActionPayload,
	StoreMutationOperation,
} from './types';
import { popEntry, pushEntry, removeEntry } from './observerSlice';

type MutateObserverAction = (
	| PushEntryActionPayload
	| PopEntryActionPayload
	| RemoveEntryActionPayload
) & { operation: StoreMutationOperation };

function* mutateObserverQueue(action: PayloadAction<MutateObserverAction>) {
	const operation = action.payload.operation;
	const payload: unknown = action.payload;
	if (operation === 'push') {
		yield put(pushEntry({ ...(payload as PushEntryActionPayload) }));
	} else if (operation === 'pop') {
		yield put(popEntry({ ...(payload as PopEntryActionPayload) }));
	} else {
		yield put(removeEntry({ ...(payload as RemoveEntryActionPayload) }));
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
