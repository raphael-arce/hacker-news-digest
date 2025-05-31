export type Story = {
	title?: string | null;
	href?: string | null;
	points?: string | null;
	commentsAmount?: string | null;
	commentsLink?: string | null;
	markdown?: string | null;
};

export type AlgoliaHit = {
	title: string;
	url?: string;
	points: string;
	num_comments: string;
	story_id: string;
};

export type AlgoliaResponse = {
	hits: AlgoliaHit[];
};

export type CfMarkdownApiResponse = {
	success: boolean;
	result: string;
};
