import * as htmlparser2 from 'htmlparser2';
import * as CSSselect from 'css-select';
// import Cloudflare from 'cloudflare';
import { format, subDays } from 'date-fns';
import { /* CfScrapeApiResponse, */ SelectAllResult } from '../types';

export async function createScrapes({
	submissionAnchorsSelector,
	submissionScoresSelector,
	submissionCommentsAnchorSelector,
}: {
	submissionAnchorsSelector: string;
	submissionScoresSelector: string;
	submissionCommentsAnchorSelector: string;
}) {
	const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
	const url = `https://news.ycombinator.com/front?day=${yesterday}`;

	const headers = new Headers();

	headers.append('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:139.0) Gecko/20100101 Firefox/139.0');
	headers.append('Accept', '*/*');
	headers.append('Accept-Encoding', 'gzip, deflate, br');
	headers.append('Keep-Alive', 'keep-alive');

	try {
		const start = performance.now();

		const response = await fetch(url);

		const rawHtml = await response.text();
		console.log(response.status);

		console.log('rawHtml', rawHtml);

		const dom = htmlparser2.parseDocument(rawHtml);

		const submissionAnchors = CSSselect.selectAll(submissionAnchorsSelector, dom);
		const submissionScores = CSSselect.selectAll(submissionScoresSelector, dom);
		const submissionComments = CSSselect.selectAll(submissionCommentsAnchorSelector, dom);

		const end = performance.now();
		const timing = end - start;

		console.log(`creating scrapes took: ${timing} ms`);

		return { submissionAnchors, submissionScores, submissionComments } as unknown as {
			submissionAnchors: SelectAllResult[];
			submissionScores: SelectAllResult[];
			submissionComments: SelectAllResult[];
		};
	} catch (error) {
		console.error(error);
		return null;
	}
}

/**
 * deprecated, to be deleted when new works
 */
// export async function old_createScrapes({
// 	submissionAnchorsSelector,
// 	submissionScoresSelector,
// 	submissionCommentsAnchorSelector,
// 	env,
// }: {
// 	submissionAnchorsSelector: string;
// 	submissionScoresSelector: string;
// 	submissionCommentsAnchorSelector: string;
// 	env: Env;
// }): Promise<Cloudflare.BrowserRendering.Scrape.ScrapeCreateResponse | null> {
// 	const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
// 	const url = `https://news.ycombinator.com/front?day=${yesterday}`;

// 	const headers = new Headers();

// 	headers.append('Authorization', `Bearer ${env.CLOUDFLARE_API_TOKEN}`);
// 	headers.append('Content-Type', 'application/json');

// 	try {
// 		const start = performance.now();

// 		const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/browser-rendering/scrape`, {
// 			headers,
// 			method: 'POST',
// 			body: JSON.stringify({
// 				url,
// 				elements: [
// 					{ selector: 'title' },
// 					{ selector: submissionAnchorsSelector },
// 					{ selector: submissionScoresSelector },
// 					{ selector: submissionCommentsAnchorSelector },
// 				],
// 			}),
// 		});

// 		const end = performance.now();
// 		const timing = end - start;

// 		console.log(`creating scrapes took: ${timing} ms`);

// 		const json = (await response.json()) as CfScrapeApiResponse;

// 		console.log('scrape response:', JSON.stringify(json, null, 2));

// 		if (!json.success) {
// 			throw new Error('Cloudflare api response was not successful.');
// 		}

// 		return json.result;
// 	} catch (error) {
// 		console.error(error);
// 		return null;
// 	}
// }
