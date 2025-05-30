import { scrapeSubmissions } from './functions/scrape-submissions';
import { generateSummaries } from './functions/generate-summaries';
import { sendEmail } from './functions/send-email';
import { getElements } from './functions/raw-scrape';

export default {
	async fetch(req, env): Promise<Response> {
		const start = performance.now();

		console.log('start');

		const submissions = await scrapeSubmissions(env);

		console.log(submissions);

		const summaries = await generateSummaries({ submissions, env });

		await sendEmail({ summaries, env });

		const end = performance.now();
		const timing = end - start;
		console.log(`end, took: ${timing} ms`);

		return new Response(`success`);
	},

	async scheduled(event, env, ctx): Promise<void> {
		const start = performance.now();

		console.log('start');

		const submissions = await scrapeSubmissions(env);

		console.log(submissions);

		const summaries = await generateSummaries({ submissions, env });

		await sendEmail({ summaries, env });

		const end = performance.now();
		const timing = end - start;
		console.log(`end, took: ${timing} ms`);
	},
} satisfies ExportedHandler<Env>;
