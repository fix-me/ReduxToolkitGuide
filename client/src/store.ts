import { configureStore } from "@reduxjs/toolkit";
import { todosApi } from "./services/todosApi";
import { uiReducer } from "./features/todos/uiSlice";

export const store = configureStore({
	reducer: {
		[todosApi.reducerPath]: todosApi.reducer,
		todosUi: uiReducer
	},
	middleware: getDefault => getDefault().concat(todosApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


