import Cloudflare from 'cloudflare';
import { format, subDays } from 'date-fns';
import { CfScrapeApiResponse } from '../types';

export async function createScrapes({
	submissionAnchorsSelector,
	submissionScoresSelector,
	submissionCommentsAnchorSelector,
	env,
}: {
	submissionAnchorsSelector: string;
	submissionScoresSelector: string;
	submissionCommentsAnchorSelector: string;
	env: Env;
}): Promise<Cloudflare.BrowserRendering.Scrape.ScrapeCreateResponse | null> {
	const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
	const url = `https://news.ycombinator.com/front?day=${yesterday}`;

	const headers = new Headers();

	headers.append('Authorization', `Bearer ${env.CLOUDFLARE_API_TOKEN}`);
	headers.append('Content-Type', 'application/json');

	try {
		const start = performance.now();

		const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/browser-rendering/scrape`, {
			headers,
			method: 'POST',
			body: JSON.stringify({
				url,
				elements: [
					{ selector: 'title' },
					{ selector: submissionAnchorsSelector },
					{ selector: submissionScoresSelector },
					{ selector: submissionCommentsAnchorSelector },
				],
			}),
		});

		const end = performance.now();
		const timing = end - start;

		console.log(`creating scrapes took: ${timing} ms`);

		const json = (await response.json()) as CfScrapeApiResponse;

		console.log('scrape response:', JSON.stringify(json, null, 2));

		if (!json.success) {
			throw new Error('Cloudflare api response was not successful.');
		}

		return json.result;
	} catch (error) {
		console.error(error);
		return null;
	}
}
