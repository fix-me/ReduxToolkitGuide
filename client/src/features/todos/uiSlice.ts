import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UiState = {
	filter: "all" | "open" | "done";
	selectedTodoId: string | null;
};

const initialState: UiState = {
	filter: "all",
	selectedTodoId: null
};

export const uiSlice = createSlice({
	name: "todosUi",
	initialState,
	reducers: {
		selectTodo: (state, action: PayloadAction<string | null>) => {
			state.selectedTodoId = action.payload;
		},
		setFilter: (state, action: PayloadAction<UiState["filter"]>) => {
			state.filter = action.payload;
		}
	},
	selectors: {
		selectFilter: state => state.filter,
		selectSelectedTodoId: state => state.selectedTodoId
	}
});

export const { selectTodo, setFilter } = uiSlice.actions;
export const { selectFilter, selectSelectedTodoId } = uiSlice.selectors;
export const uiReducer = uiSlice.reducer;


