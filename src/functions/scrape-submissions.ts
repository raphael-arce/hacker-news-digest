import Cloudflare from 'cloudflare';
import { format, subDays } from 'date-fns';
import type { Submission } from '../types';
import { createScrapes } from './create-scrapes';

export async function scrapeSubmissions(env: Env) {
	const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
	const hackerNewsURL = `https://news.ycombinator.com/front?day=${yesterday}`;

	const submissionAnchorsSelector = '.titleline > a';
	const submissionScoresSelector = 'span.score';
	const submissionCommentsAnchorSelector = '.subline > a:not(.hnuser)';

	const scrapes = await createScrapes({
		url: hackerNewsURL,
		submissionAnchorsSelector,
		submissionScoresSelector,
		submissionCommentsAnchorSelector,
		env,
	});

	if (scrapes === null) {
		return [];
	}

	/**
	 * The typing provided by Cloudflare is wrong. It currently (24.05.2025) returns a `Array<Results>`, but the return is typed as `Results`.
	 */
	const submissionAnchors = scrapes.filter((scrape) => scrape.selector === submissionAnchorsSelector)[0]
		.results as unknown as Cloudflare.BrowserRendering.Scrape.ScrapeCreateResponse.ScrapeCreateResponseItem.Results[];
	const submissionScores = scrapes.filter((scrape) => scrape.selector === submissionScoresSelector)[0]
		.results as unknown as Cloudflare.BrowserRendering.Scrape.ScrapeCreateResponse.ScrapeCreateResponseItem.Results[];
	const submissionComments = scrapes.filter((scrape) => scrape.selector === submissionCommentsAnchorSelector)[0]
		.results as unknown as Cloudflare.BrowserRendering.Scrape.ScrapeCreateResponse.ScrapeCreateResponseItem.Results[];

	const submissions: Submission[] = [];

	for (let i = 0; i < Number(env.LIMIT); i++) {
		const submissionHref = absolutizeUrl(submissionAnchors[i].attributes.find((attribute) => attribute.name === 'href')?.value);

		const commentsHref = submissionComments[i].attributes.find((attribute) => attribute.name === 'href')?.value;
		const commentsLink = `https://news.ycombinator.com/${commentsHref}`;

		submissions.push({
			title: submissionAnchors[i].text,
			href: submissionHref,
			score: submissionScores[i].text,
			commentsAmount: submissionComments[i].text,
			commentsLink,
		});
	}

	return submissions;
}

function absolutizeUrl(url: string | undefined) {
	if (!url) {
		return null;
	}

	if (url.startsWith('item?id=')) {
		return `https://news.ycombinator.com/${url}`;
	}

	return url;
}
