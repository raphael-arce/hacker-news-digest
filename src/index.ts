import { scrapeSubmissions } from './functions/scrape-submissions';
import { generateSummaries } from './functions/generate-summaries';
import { sendEmail } from './functions/send-email';

export default {
	async fetch(req, env): Promise<Response> {
		return new Response(`go to ${req.url}__scheduled to test the cron job`);
	},

	async scheduled(event, env, ctx): Promise<void> {
		console.log('start');

		const submissions = await scrapeSubmissions(env);

		const summaries = await generateSummaries({ submissions, env });

		await sendEmail({ summaries, env });

		console.log('end');
	},
} satisfies ExportedHandler<Env>;
