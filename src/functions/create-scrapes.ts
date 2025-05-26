import Cloudflare from 'cloudflare';
import { CfScrapeApiResponse } from '../types';

export async function createScrapes({
	url,
	submissionAnchorsSelector,
	submissionScoresSelector,
	submissionCommentsAnchorSelector,
	env,
}: {
	url: string;
	submissionAnchorsSelector: string;
	submissionScoresSelector: string;
	submissionCommentsAnchorSelector: string;
	env: Env;
}): Promise<Cloudflare.BrowserRendering.Scrape.ScrapeCreateResponse | null> {
	const headers = new Headers();

	headers.append('Authorization', `Bearer ${env.CLOUDFLARE_API_TOKEN}`);
	headers.append('Content-Type', 'application/json');

	try {
		const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/browser-rendering/scrape`, {
			headers,
			method: 'POST',
			body: JSON.stringify({
				url,
				elements: [
					{ selector: submissionAnchorsSelector },
					{ selector: submissionScoresSelector },
					{ selector: submissionCommentsAnchorSelector },
				],
			}),
		});

		const json = (await response.json()) as CfScrapeApiResponse;

		if (!json.success) {
			throw new Error('Cloudflare api response was not successful.');
		}

		return json.result;
	} catch (error) {
		console.error(error);
		return null;
	}
}
