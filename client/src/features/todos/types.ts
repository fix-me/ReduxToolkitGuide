export type Todo = {
	id: string;
	title: string;
	done: boolean;
	tags?: string[];
};

export type ChangeEntry = {
	ts: number;
	action: string;
};

export type HistoryResponse = {
	flagged: boolean;
	history: ChangeEntry[];
	meta: { lastTouched: number } | null;
};


