import { configureStore, Tuple } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';

import rootSaga from './sagas';
import observerReducer from './observerSlice';

const sagaMiddleware = createSagaMiddleware();

export const makeStore = () => {
	const store = configureStore({
		reducer: observerReducer,
		middleware: () => new Tuple(sagaMiddleware, logger),
	});
	sagaMiddleware.run(rootSaga);
	return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
