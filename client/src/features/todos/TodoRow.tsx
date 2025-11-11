import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { Todo } from "./types";
import {
	Checkbox,
	Chip,
	IconButton,
	Tooltip,
	ListItem,
	ListItemIcon,
	ListItemText,
	Stack,
	Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import HistoryIcon from "@mui/icons-material/History";
import LabelIcon from "@mui/icons-material/Label";
import FlagIcon from "@mui/icons-material/Flag";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	useAddTagMutation,
	useDeleteTodoMutation,
	useFlagTodoMutation,
	useUnflagTodoMutation,
	useGetHistoryQuery,
	useToggleTodoMutation
} from "../../services/todosApi";
import { selectSelectedTodoId, selectTodo } from "./uiSlice";

export function TodoRow({ t }: { t: Todo }) {
	const dispatch = useDispatch();
	const selectedTodoId = useSelector((s: RootState) => selectSelectedTodoId(s));
	const isSelected = selectedTodoId === t.id;
	const [toggleTodo] = useToggleTodoMutation();
	const [addTag] = useAddTagMutation();
	const [deleteTodo] = useDeleteTodoMutation();
	const [flagTodo] = useFlagTodoMutation();
	const [unflagTodo] = useUnflagTodoMutation();
	const { data: history } = useGetHistoryQuery(t.id);
	const flagged = Boolean(history?.flagged);

	return (
		<ListItem
			alignItems="flex-start"
			sx={(theme) => ({
				position: "relative",
				"&::before": {
					content: '""',
					position: "absolute",
					left: 0,
					top: 0,
					bottom: 0,
					width: 4,
					backgroundColor: flagged ? theme.palette.warning.main : "transparent",
					borderRadius: 1
				},
				bgcolor: flagged ? alpha(theme.palette.warning.main, 0.08) : undefined,
				columnGap: 1,
				"&:hover": {
					bgcolor: flagged ? alpha(theme.palette.warning.main, 0.16) : theme.palette.action.hover,
					"&::before": {
						backgroundColor: flagged ? theme.palette.warning.main : undefined
					}
				},
				"&:not(:last-of-type)": {
					borderBottom: 1,
					borderColor: theme.palette.divider
				}
			})}
		>
			<ListItemIcon sx={{ alignSelf: "flex-start", mt: 0.5 }}>
				<Checkbox edge="start" checked={t.done} onChange={() => toggleTodo(t.id)} />
			</ListItemIcon>
			<ListItemText
				sx={{ minWidth: 0, mr: 1, flex: "1 1 auto" }}
				primary={
					<Typography
						sx={{
							textDecoration: t.done ? "line-through" : "none",
							wordBreak: "break-word"
						}}
					>
						{t.title}
					</Typography>
				}
				secondary={
					(flagged || (t.tags && t.tags.length > 0)) ? (
						<Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: "wrap", rowGap: 0.5 }}>
							{flagged ? <Chip key="__flagged" size="small" color="warning" label="flagged" /> : null}
							{t.tags?.map(tag => (
								<Chip key={tag} size="small" label={tag} />
							))}
						</Stack>
					) : undefined
				}
				slotProps={{
					primary: { component: "div" },
					secondary: { component: "div" }
				}}
			/>
			<Stack
				direction={{ xs: "column", sm: "row" }}
				spacing={{ xs: 0.25, sm: 0.5 }}
				sx={{ alignSelf: "flex-start", ml: { xs: 0.5, sm: 0 } }}
			>
				<Tooltip title="View history">
					<IconButton
						edge="end"
						aria-label="history"
						onClick={() => dispatch(selectTodo(t.id))}
						color={isSelected ? "primary" : "default"}
						aria-pressed={isSelected}
						size="small"
						sx={{ bgcolor: isSelected ? "action.selected" : undefined }}
					>
						<HistoryIcon />
					</IconButton>
				</Tooltip>
				<Tooltip title="Add tag">
					<IconButton
						edge="end"
						aria-label="add tag"
						onClick={() => {
							const tag = window.prompt("tag?");
							if (tag) addTag({ id: t.id, tag });
						}}
						size="small"
					>
						<LabelIcon />
					</IconButton>
				</Tooltip>
				<Tooltip title={flagged ? "Remove flag" : "Flag"}>
					<IconButton
						edge="end"
						aria-label="flag"
						onClick={() => (flagged ? unflagTodo(t.id) : flagTodo(t.id))}
						color={flagged ? "warning" as const : "default" as const}
						size="small"
					>
						<FlagIcon />
					</IconButton>
				</Tooltip>
				<Tooltip title="Delete">
					<IconButton
						edge="end"
						aria-label="delete"
						onClick={() => {
							if (window.confirm("Delete todo?")) deleteTodo(t.id);
							if (selectedTodoId === t.id) dispatch(selectTodo(null));
						}}
						size="small"
					>
						<DeleteIcon />
					</IconButton>
				</Tooltip>
			</Stack>
		</ListItem>
	);
}


