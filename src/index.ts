import { getStories } from './functions/get-stories';
import { generateSummaries } from './functions/generate-summaries';
import { sendEmail } from './functions/send-email';
import { UTCDate } from '@date-fns/utc';
import { subDays } from 'date-fns';

export default {
	async fetch(req, env): Promise<Response> {
		return new Response(`go to ${req.url}__scheduled to test the cron job`);
	},

	async scheduled(event, env, ctx): Promise<void> {
		const start = performance.now();

		console.log('start');

		const today = new UTCDate();
		const yesterday = subDays(today, 1);

		const stories = await getStories({ date: yesterday, env });

		const summaries = await generateSummaries({ stories, env });

		await sendEmail({ date: yesterday, body: summaries, env });

		const end = performance.now();
		const timing = end - start;
		console.log(`end, took: ${timing} ms`);
	},
} satisfies ExportedHandler<Env>;
