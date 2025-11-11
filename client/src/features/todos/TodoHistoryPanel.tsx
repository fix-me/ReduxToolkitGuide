import { useGetHistoryQuery } from "../../services/todosApi";
import {
	Alert,
	Chip,
	List,
	ListItem,
	ListItemText,
	Paper,
	Typography,
	Stack
} from "@mui/material";

export function TodoHistoryPanel({ todoId }: { todoId: string | null }) {
	const { data, isFetching } = useGetHistoryQuery(todoId as string, {
		skip: !todoId
	});

	if (!todoId) return <Alert severity="info">Select a todo to see the WeakMap history</Alert>;
	if (isFetching) return <Typography>loading history…</Typography>;
	if (!data) return <Typography>no history</Typography>;

	return (
		<Paper variant="outlined" sx={{ p: 2 }}>
			<Typography variant="subtitle2" gutterBottom>Status</Typography>
			<Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
				<Typography variant="body2" component="span">flagged:</Typography>
				<Chip size="small" label={data.flagged ? "yes" : "no"} color={data.flagged ? "warning" : "default"} />
			</Stack>
			<Typography variant="body2" sx={{ mb: 2 }}>
				last changed: {data.meta?.lastTouched ? new Date(data.meta.lastTouched).toLocaleString() : "-"}
			</Typography>
			<Typography variant="subtitle2" gutterBottom>History</Typography>
			<List dense>
				{data.history.map((h, idx) => (
					<ListItem key={idx} disableGutters>
						<ListItemText
							primaryTypographyProps={{ variant: "body2" }}
							primary={`${new Date(h.ts).toLocaleTimeString()} – ${h.action}`}
						/>
					</ListItem>
				))}
			</List>
		</Paper>
	);
}


