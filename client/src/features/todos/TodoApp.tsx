import {
	Box,
	Button,
	Container,
	Divider,
	List,
	Paper,
	Stack,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Typography
} from "@mui/material";
import type React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	useAddTodoMutation,
	useGetTodosQuery
} from "../../services/todosApi";
import type { RootState } from "../../store";
import { TodoHistoryPanel } from "./TodoHistoryPanel";
import { TodoRow } from "./TodoRow";
import type { Todo } from "./types";
import { selectFilter, selectSelectedTodoId, setFilter } from "./uiSlice";

export function TodoApp() {
	const { data: todos, isLoading, isError } = useGetTodosQuery();
	const [addTodo] = useAddTodoMutation();

	const [title, setTitle] = useState("");
	const dispatch = useDispatch();
	const selectedTodoId = useSelector((s: RootState) => selectSelectedTodoId(s));
	const filter = useSelector((s: RootState) => selectFilter(s));

	if (isLoading) return <Container maxWidth="md"><Typography>loading…</Typography></Container>;
	if (isError) return <Container maxWidth="md"><Typography color="error">error</Typography></Container>;

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = title.trim();
		if (!trimmed) return;
		await addTodo(trimmed).unwrap();
		setTitle("");
	}

	return (
		<Container maxWidth="lg" sx={{ py: 3 }}>
			<Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="flex-start">
				<Box sx={{ flex: { md: 1 }, width: { xs: "100%", md: "auto" } }}>
					<Typography variant="h4" gutterBottom>
						Todo demo (RTK Query + Express + in-memory)
					</Typography>
					<Box component="form" onSubmit={handleSubmit}>
						<Stack direction="row" spacing={1}>
							<TextField
								fullWidth
								variant="outlined"
								size="small"
								value={title}
								onChange={e => setTitle(e.target.value)}
								placeholder="new todo"
								label="New todo"
							/>
							<Button type="submit" variant="contained">
								Add
							</Button>
						</Stack>
					</Box>

					<Paper variant="outlined" sx={{ mt: 2 }}>
						<Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1.5, pb: 0 }}>
							<ToggleButtonGroup
								value={filter}
								exclusive
								onChange={(_e, val) => val && dispatch(setFilter(val))}
								size="small"
							>
								<ToggleButton value="all">all ({todos?.length ?? 0})</ToggleButton>
								<ToggleButton value="open">
									open ({todos?.filter(t => !t.done).length ?? 0})
								</ToggleButton>
								<ToggleButton value="done">
									done ({todos?.filter(t => t.done).length ?? 0})
								</ToggleButton>
							</ToggleButtonGroup>
						</Stack>
						<List dense>
							{todos
								?.filter((t: Todo) => (filter === "open" ? !t.done : filter === "done" ? t.done : true))
								.map((t: Todo) => (
								<TodoRow key={t.id} t={t} />
							))}
						</List>
					</Paper>
				</Box>
				<Box sx={{ width: { xs: "100%", md: 360 }, mt: { xs: 2, md: 0 } }}>
					<Typography variant="subtitle1" gutterBottom>
						History
					</Typography>
					<Divider sx={{ mb: 1 }} />
					<TodoHistoryPanel todoId={selectedTodoId} />
				</Box>
			</Stack>
		</Container>
	);
}


