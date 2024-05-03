import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import rootSaga from './sagas';
import observerReducer from './observerSlice';

const sagaMiddleware = createSagaMiddleware();

export const makeStore = () => {
	const store = configureStore({
		reducer: observerReducer,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().concat(sagaMiddleware),
	});
	sagaMiddleware.run(rootSaga);
	return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
