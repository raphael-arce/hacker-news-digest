import { CfMarkdownApiResponse } from '../types';

export async function extractMarkdown({ url, env }: { url?: string | null; env: Env }) {
	if (!url) {
		return null;
	}

	const headers = new Headers();

	headers.append('Authorization', `Bearer ${env.CLOUDFLARE_API_TOKEN}`);
	headers.append('Content-Type', 'application/json');

	try {
		const start = performance.now();

		const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/browser-rendering/markdown`, {
			headers,
			method: 'POST',
			body: JSON.stringify({ url }),
		});

		const end = performance.now();
		const timing = end - start;

		console.log(`extracting markdown took: ${timing} ms`);

		const json = (await response.json()) as CfMarkdownApiResponse;

		if (!json.success) {
			throw new Error('Cloudflare api response was not successful.');
		}

		return json.result;
	} catch (error) {
		console.error(`Error getting the markdown for ${url}:`, error);
		return null;
	}
}
