// import Cloudflare from 'cloudflare';
import type { Submission } from '../types';
import { createScrapes } from './create-scrapes';

export async function scrapeSubmissions(env: Env) {
	const submissionAnchorsSelector = '.titleline > a';
	const submissionScoresSelector = 'span.score';
	const submissionCommentsAnchorSelector = '.subline > a:not(.hnuser)';

	// const scrapes = await createScrapes({
	// 	submissionAnchorsSelector,
	// 	submissionScoresSelector,
	// 	submissionCommentsAnchorSelector,
	// 	env,
	// });

	const scrapes = await createScrapes({
		submissionAnchorsSelector,
		submissionScoresSelector,
		submissionCommentsAnchorSelector,
	});

	console.log(scrapes);

	if (scrapes === null) {
		return [];
	}

	const { submissionAnchors, submissionScores, submissionComments } = scrapes;

	/**
	 * old_createScrapes
	 */
	/**
	 * The typing provided by Cloudflare is wrong. It currently (24.05.2025) returns a `Array<Results>`, but the return is typed as `Results`.
	 */
	// const submissionAnchors = scrapes.filter((scrape) => scrape.selector === submissionAnchorsSelector)[0]
	// 	.results as unknown as Cloudflare.BrowserRendering.Scrape.ScrapeCreateResponse.ScrapeCreateResponseItem.Results[];
	// const submissionScores = scrapes.filter((scrape) => scrape.selector === submissionScoresSelector)[0]
	// 	.results as unknown as Cloudflare.BrowserRendering.Scrape.ScrapeCreateResponse.ScrapeCreateResponseItem.Results[];
	// const submissionComments = scrapes.filter((scrape) => scrape.selector === submissionCommentsAnchorSelector)[0]
	// 	.results as unknown as Cloudflare.BrowserRendering.Scrape.ScrapeCreateResponse.ScrapeCreateResponseItem.Results[];

	const submissions: Submission[] = [];

	const limit = getLimit(submissionAnchors, env);

	for (let i = 0; i < limit; i++) {
		/**
		 * old_createScrapes
		 */
		// const submissionHref = absolutizeUrl(submissionAnchors[i].attributes.find((attribute) => attribute.name === 'href')?.value);
		// const commentsHref = submissionComments[i].attributes.find((attribute) => attribute.name === 'href')?.value;
		// const commentsLink = `https://news.ycombinator.com/${commentsHref}`;
		// submissions.push({
		// 	title: submissionAnchors[i].text,
		// 	href: submissionHref,
		// 	score: submissionScores[i].text,
		// 	commentsAmount: submissionComments[i].text,
		// 	commentsLink,
		// });

		const title = submissionAnchors[i].children?.[0]?.data;
		const href = absolutizeUrl(submissionAnchors[i].attribs?.href);
		const score = submissionScores[i].children?.[0]?.data;
		const commentsLink = absolutizeUrl(submissionComments[i].attribs?.href);
		const commentsAmount = submissionComments[i].children?.[0]?.data;

		submissions.push({
			title,
			href,
			score,
			commentsLink,
			commentsAmount,
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

function getLimit(submissionAnchors: Array<unknown>, env: Env) {
	const parsedEnvLimit = Number(env.LIMIT);

	if (submissionAnchors.length > parsedEnvLimit) {
		return parsedEnvLimit;
	}

	return submissionAnchors.length;
}
