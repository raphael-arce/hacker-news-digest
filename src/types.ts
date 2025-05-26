import Cloudflare from 'cloudflare';

export type Submission = {
	title?: string | null;
	href?: string | null;
	score?: string | null;
	commentsAmount?: string | null;
	commentsLink?: string | null;
	markdown?: string | null;
};

export type CfScrapeApiResponse = {
	success: boolean;
	result: Cloudflare.BrowserRendering.Scrape.ScrapeCreateResponse;
};

export type CfMarkdownApiResponse = {
	success: boolean;
	result: string;
};
