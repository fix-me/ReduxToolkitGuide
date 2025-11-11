import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";

// ----- types -----
type Todo = { id: string; title: string; done: boolean; tags?: string[] };
type TodosState = { entities: Record<string, Todo>; order: string[] };

const initialState: TodosState = {
	entities: {},
	order: []
};

// prefill with tips
const prefills: Array<Omit<Todo, "id">> = [
	{ title: "Map: wenn Keys nicht strings sind.", done: false },
	{ title: "WeakMap: seitliche Caches, nicht serialisierbar.", done: false },
	{ title: "Set: schnelle Mitgliedschaft, im Store als Array speichern.", done: false },
	{ title: "Reducer: alles serialisierbar lassen.", done: false }
];

// ----- plain in-memory "store" and ops (no RTK) -----
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

// ----- in-memory auxiliary structures -----
// Set: which todos are currently "flagged" for review (example use of Set)
const flaggedTodos = new Set<string>();
// Map: metadata per todo id (example why Map is nicer than plain object)
const todoMeta = new Map<string, { lastTouched: number }>();
// WeakMap: change history per actual todo object
type ChangeEntry = { ts: number; action: string };
const todoHistory = new WeakMap<Todo, ChangeEntry[]>();

// boot
bootstrap();

const app = express();
app.use(cors());
app.use(express.json());

// helper to record history
function recordHistory(todo: Todo | undefined, action: string) {
	if (!todo) return;
	const arr = todoHistory.get(todo) ?? [];
	arr.push({ ts: Date.now(), action });
	todoHistory.set(todo, arr);
	todoMeta.set(todo.id, { lastTouched: Date.now() });
}

// REST endpoints
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

app.delete("/todos/:id", (req, res) => {
	const id = req.params.id;
	const exists = selectById(id);
	if (!exists) return res.status(404).json({ error: "not found" });
	// record before deletion, as WeakMap uses the object reference
	recordHistory(exists, "deleteTodo");
	deleteTodo(id);
	res.status(204).send();
});

// expose meta and history in a serializable way
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
