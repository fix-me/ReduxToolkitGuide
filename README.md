## ReduxToolkitGuide

Vite + React + TypeScript client with Redux Toolkit and RTK Query, and an Express server with a plain in-memory data store. The server keeps the persisted state serializable and uses side-car in-memory structures (`Set`, `Map`, `WeakMap`) for derived metadata and change history.

### Requirements
- Node >= 18
- Windows cmd examples below (adjust if using a different shell)

### Project structure
```text
root/
  server/
    package.json
    tsconfig.json
    server.ts
  client/
    package.json
    vite.config.ts
    tsconfig.json
    index.html
    src/
      main.tsx
      store.ts
      services/todosApi.ts
      features/todos/
        TodoApp.tsx
        TodoHistoryPanel.tsx
        types.ts
  README.md
```

### Install
```cmd
cd server
npm install
cd ..\client
npm install
```

### Run (two terminals)
- Server (http://localhost:4000):
```cmd
cd server
npm run dev
```
- Client (http://localhost:5173):
```cmd
cd client
npm run dev
```

### Data model
```ts
type Todo = { id: string; title: string; done: boolean; tags?: string[] };
```

### Server (Express)
- Source of truth: plain in-memory state (no Redux Toolkit).
- Persisted state is serializable: plain objects/arrays.
- Side-cars:
  - `Set<string>` flagged todo ids (membership demo)
  - `Map<string, { lastTouched: number }>` metadata per todo
  - `WeakMap<Todo, Array<{ ts: number; action: string }>>` change history keyed by the actual todo object
- Reducer-like ops update state; routes serialize side-car data for clients.

#### Endpoints
- GET `/todos` → Todo[]
- GET `/todos/:id` → Todo
- POST `/todos` body: `{ title: string }` → Todo (201)
- POST `/todos/:id/toggle` → Todo
- POST `/todos/:id/tag` body: `{ tag: string }` → Todo
- POST `/todos/:id/flag` → `{ ok: true }`
- DELETE `/todos/:id` → 204
- GET `/todos/:id/history` → `{ history, meta, flagged }`

### Client (Vite + React + RTK Query + MUI)
- `createApi` service for CRUD and history:
  - `getTodos`, `addTodo`, `toggleTodo`, `addTag`, `flagTodo`, `deleteTodo`, `getHistory`
- UI built with Material UI:
  - `TodoApp` lists todos, supports add/toggle/tag/flag/delete and selects a todo for history
  - `TodoHistoryPanel` shows side-car history, flagged, and lastTouched

#### Demo: createSlice with reducers and selectors
A small UI slice demonstrates `createSlice` reducers and `selectors:` usage without touching server state:

- File: `client/src/features/todos/uiSlice.ts`
  - Reducers: `selectTodo`, `setFilter`
  - Selectors: `selectSelectedTodoId`, `selectFilter`
- Store wiring: `client/src/store.ts` adds `todosUi` reducer
- Usage in component (`TodoApp`):
  - Read: `useSelector(selectSelectedTodoId)`
  - Write: `dispatch(selectTodo(id))`

### Notes on Map/Set/WeakMap usage
- Map: use when keys are not well-represented as plain object keys or when per-item metadata is convenient (here: `todoMeta`).
- WeakMap: use for caches keyed by object identity that should not prevent GC (here: per-todo change history).
- Set: use for fast membership checks (here: `flaggedTodos`); store as array if persisting in Redux state.

### CORS
- Enabled on the server for local development.

### Testing
- No tests included. Add as needed with your preferred runner.

### Troubleshooting
- parse5 control-character-in-input-stream
  - Ensure `client/index.html` is a minimal valid Vite HTML (no hidden control chars). This repo includes:
    ```html
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ReduxToolkitGuide</title>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="/src/main.tsx"></script>
      </body>
    </html>
    ```
- Port in use
  - Change Vite port in `client/vite.config.ts` or stop the conflicting process.
- CORS errors
  - Confirm server runs on `http://localhost:4000` and `cors()` middleware is enabled.


