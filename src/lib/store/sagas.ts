import { all, put, takeLatest } from 'redux-saga/effects';

import { addEntry } from './observerSlice';
import { ActionPayload } from './types';

function* addObserverEntry(action: ActionPayload) {
	yield put(addEntry({ ...action }));
}

function* watchObserverMutation() {
	yield takeLatest('ADD_OBSERVER_ENTRY', addObserverEntry);
}

export default function* rootSaga() {
	yield all([watchObserverMutation()]);
}
