import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { HistoryResponse, Todo } from "../features/todos/types";

export const todosApi = createApi({
	reducerPath: "todosApi",
	baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:4000" }),
	tagTypes: ["History", "Todos"],
	endpoints: builder => ({
		getTodos: builder.query<Todo[], void>({
			query: () => "/todos",
			providesTags: result =>
				result
					? [
							...result.map(t => ({ type: "Todos" as const, id: t.id })),
							{ type: "Todos" as const, id: "LIST" }
					  ]
					: [{ type: "Todos" as const, id: "LIST" }]
		}),
		addTodo: builder.mutation<Todo, string>({
			query: title => ({ url: "/todos", method: "POST", body: { title } }),
			invalidatesTags: [{ type: "Todos", id: "LIST" }]
		}),
		toggleTodo: builder.mutation<Todo, string>({
			query: id => ({ url: `/todos/${id}/toggle`, method: "POST" }),
			invalidatesTags: (r, e, id) => [
				{ type: "Todos", id },
				{ type: "Todos", id: "LIST" },
				{ type: "History", id }
			]
		}),
		addTag: builder.mutation<Todo, { id: string; tag: string }>({
			query: ({ id, tag }) => ({ url: `/todos/${id}/tag`, method: "POST", body: { tag } }),
			invalidatesTags: (r, e, { id }) => [{ type: "Todos", id }, { type: "History", id }]
		}),
		flagTodo: builder.mutation<{ ok: true }, string>({
			query: id => ({ url: `/todos/${id}/flag`, method: "POST" }),
			invalidatesTags: (r, e, id) => [{ type: "History", id }]
		}),
		deleteTodo: builder.mutation<void, string>({
			query: id => ({ url: `/todos/${id}`, method: "DELETE" }),
			invalidatesTags: (r, e, id) => [
				{ type: "Todos", id },
				{ type: "Todos", id: "LIST" },
				{ type: "History", id }
			]
		}),
		getHistory: builder.query<HistoryResponse, string>({
			query: id => `/todos/${id}/history`,
			providesTags: (r, e, id) => [{ type: "History", id }]
		})
	})
});

export const {
	useAddTodoMutation,
	useAddTagMutation,
	useDeleteTodoMutation,
	useFlagTodoMutation,
	useGetHistoryQuery,
	useGetTodosQuery,
	useToggleTodoMutation
} = todosApi;


