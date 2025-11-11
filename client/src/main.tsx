import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { store } from "./store";
import { TodoApp } from "./features/todos/TodoApp";

const container = document.getElementById("root")!;
const theme = createTheme({
	palette: {
		mode: "light"
	}
});
createRoot(container).render(
	<StrictMode>
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<TodoApp />
			</ThemeProvider>
		</Provider>
	</StrictMode>
);


