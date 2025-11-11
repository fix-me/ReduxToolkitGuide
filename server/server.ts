import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";

type Todo = { id: string; title: string; done: boolean; tags?: string[] };
type TodosState = { entities: Record<string, Todo>; order: string[] };

const initialState: TodosState = {
	entities: {},
	order: []
};

const prefills: Array<Omit<Todo, "id">> = [
	{
		title: "Tip: Use Map when keys are not strings (e.g. complex IDs). For string keys, an object is fine.",
		done: false,
		tags: ["tip", "map"]
	},
	{
		title: "Tip: Use WeakMap as a side cache — store history without persisting.",
		done: false,
		tags: ["tip", "weakmap", "history"]
	},
	{
		title: "Tip: Use Set for fast membership; persist as an array in the store.",
		done: false,
		tags: ["tip", "set"]
	},
	{
		title: "Tip: Keep state serializable (only plain objects/arrays, no classes/Map/Set).",
		done: false,
		tags: ["tip", "serializable"]
	},
	{
		title: "Tip: Try actions — toggle, add tags, flag; view history.",
		done: false,
		tags: ["demo"]
	}
];

const state: TodosState = structuredClone(initialState);

function bootstrap(): void {
	if (state.order.length) return;
	for (const p of prefills) {
		const id = randomUUID();
		state.entities[id] = { id, ...p };
		state.order.push(id);
	}
}

function addTodo(title: string): string {
	const id = randomUUID();
	state.entities[id] = { id, title, done: false };
	state.order.unshift(id);
	return id;
}

function toggleTodo(id: string): void {
	const t = state.entities[id];
	if (t) t.done = !t.done;
}

function deleteTodo(id: string): void {
	delete state.entities[id];
	state.order = state.order.filter((x) => x !== id);
}

function addTag(id: string, tag: string): void {
	const t = state.entities[id];
	if (!t) return;
	if (!t.tags) t.tags = [];
	if (!t.tags.includes(tag)) t.tags.push(tag);
}

function selectAll(): Todo[] {
	return state.order.map((id) => state.entities[id]);
}

function selectById(id: string): Todo | undefined {
	return state.entities[id];
}

const flaggedTodos = new Set<string>();
const todoMeta = new Map<string, { lastTouched: number }>();
type ChangeEntry = { ts: number; action: string };
const todoHistory = new WeakMap<Todo, ChangeEntry[]>();

bootstrap();

const app = express();
app.use(cors());
app.use(express.json());

function recordHistory(todo: Todo | undefined, action: string) {
	if (!todo) return;
	const arr = todoHistory.get(todo) ?? [];
	arr.push({ ts: Date.now(), action });
	todoHistory.set(todo, arr);
	todoMeta.set(todo.id, { lastTouched: Date.now() });
}

app.get("/todos", (_req, res) => {
	const list = selectAll();
	res.json(list);
});

app.get("/todos/:id", (req, res) => {
	const todo = selectById(req.params.id);
	if (!todo) return res.status(404).json({ error: "not found" });
	res.json(todo);
});

app.post("/todos", (req, res) => {
	const title = req.body?.title;
	if (!title) return res.status(400).json({ error: "title required" });
	const id = addTodo(title);
	const created = selectById(id);
	recordHistory(created, "addTodo");
	res.status(201).json(created);
});

app.post("/todos/:id/toggle", (req, res) => {
	const id = req.params.id;
	const before = selectById(id);
	if (!before) return res.status(404).json({ error: "not found" });
	toggleTodo(id);
	const after = selectById(id);
	recordHistory(after, "toggleTodo");
	res.json(after);
});

app.post("/todos/:id/tag", (req, res) => {
	const id = req.params.id;
	const tag = req.body?.tag;
	if (!tag) return res.status(400).json({ error: "tag required" });
	const exists = selectById(id);
	if (!exists) return res.status(404).json({ error: "not found" });
	addTag(id, tag);
	const after = selectById(id);
	recordHistory(after, "addTag:" + tag);
	res.json(after);
});

app.post("/todos/:id/flag", (req, res) => {
	const id = req.params.id;
	const exists = selectById(id);
	if (!exists) return res.status(404).json({ error: "not found" });
	flaggedTodos.add(id);
	recordHistory(exists, "flag");
	res.json({ ok: true });
});

app.delete("/todos/:id/flag", (req, res) => {
	const id = req.params.id;
	const exists = selectById(id);
	if (!exists) return res.status(404).json({ error: "not found" });
	flaggedTodos.delete(id);
	recordHistory(exists, "unflag");
	res.status(204).send();
});

app.delete("/todos/:id", (req, res) => {
	const id = req.params.id;
	const exists = selectById(id);
	if (!exists) return res.status(404).json({ error: "not found" });
	recordHistory(exists, "deleteTodo");
	deleteTodo(id);
	res.status(204).send();
});

app.get("/todos/:id/history", (req, res) => {
	const todo = selectById(req.params.id);
	if (!todo) return res.status(404).json({ error: "not found" });
	const history = todoHistory.get(todo) ?? [];
	const meta = todoMeta.get(todo.id) ?? null;
	const flagged = flaggedTodos.has(todo.id);
	res.json({ history, meta, flagged });
});

const port = 4000;
app.listen(port, () => {
	console.log("server on http://localhost:" + port);
});
