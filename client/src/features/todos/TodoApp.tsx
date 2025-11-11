import { useState } from "react";
import type React from "react";
import {
	useAddTagMutation,
	useAddTodoMutation,
	useDeleteTodoMutation,
	useFlagTodoMutation,
	useGetTodosQuery,
	useToggleTodoMutation
} from "../../services/todosApi";
import { TodoHistoryPanel } from "./TodoHistoryPanel";
import type { Todo } from "./types";
import { useDispatch, useSelector } from "react-redux";
import { selectSelectedTodoId, selectTodo } from "./uiSlice";
import type { RootState } from "../../store";
import {
	Box,
	Button,
	Checkbox,
	Chip,
	Container,
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Paper,
	Stack,
	TextField,
	Typography
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import LabelIcon from "@mui/icons-material/Label";
import FlagIcon from "@mui/icons-material/Flag";
import DeleteIcon from "@mui/icons-material/Delete";

export function TodoApp() {
	const { data: todos, isLoading, isError } = useGetTodosQuery();
	const [addTodo] = useAddTodoMutation();
	const [toggleTodo] = useToggleTodoMutation();
	const [addTag] = useAddTagMutation();
	const [deleteTodo] = useDeleteTodoMutation();
	const [flagTodo] = useFlagTodoMutation();

	const [title, setTitle] = useState("");
	const dispatch = useDispatch();
	const selectedTodoId = useSelector((s: RootState) => selectSelectedTodoId(s));

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
			<Stack direction="row" spacing={3} alignItems="flex-start">
				<Box sx={{ flex: 1 }}>
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
						<List dense>
							{todos?.map((t: Todo) => (
								<ListItem
									key={t.id}
									secondaryAction={
										<Stack direction="row" spacing={0.5}>
											<IconButton edge="end" aria-label="history" onClick={() => dispatch(selectTodo(t.id))}>
												<HistoryIcon />
											</IconButton>
											<IconButton
												edge="end"
												aria-label="add tag"
												onClick={() => {
													const tag = window.prompt("tag?");
													if (tag) addTag({ id: t.id, tag });
												}}
											>
												<LabelIcon />
											</IconButton>
											<IconButton edge="end" aria-label="flag" onClick={() => flagTodo(t.id)}>
												<FlagIcon />
											</IconButton>
											<IconButton
												edge="end"
												aria-label="delete"
												onClick={() => {
													if (window.confirm("delete todo?")) deleteTodo(t.id);
													if (selectedTodoId === t.id) dispatch(selectTodo(null));
												}}
											>
												<DeleteIcon />
											</IconButton>
										</Stack>
									}
								>
									<ListItemIcon>
										<Checkbox edge="start" checked={t.done} onChange={() => toggleTodo(t.id)} />
									</ListItemIcon>
									<ListItemText
										primary={
											<Typography sx={{ textDecoration: t.done ? "line-through" : "none" }}>
												{t.title}
											</Typography>
										}
										secondary={
											t.tags?.length ? (
												<Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
													{t.tags.map(tag => (
														<Chip key={tag} size="small" label={tag} />
													))}
												</Stack>
											) : undefined
										}
									/>
								</ListItem>
							))}
						</List>
					</Paper>
				</Box>
				<Box sx={{ width: 360 }}>
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


