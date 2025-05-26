import { Submission } from '../types';
import { extractMarkdown } from './extract-markdown';
import { generateHTMLSummary } from './generate-html-summary';

export async function generateSummaries({ submissions, env }: { submissions: Submission[]; env: Env }) {
	let summaries: string[] = [];

	/**
	 * The API has a rate limit of 1/sec. To keep it simple, we just do it sequentially.
	 */
	for (let i = 0; i < submissions.length; i++) {
		const submission = submissions[i];

		console.log(`submission_${i}: extracting markdown...`);
		submission.markdown = await extractMarkdown({ url: submission.href, env });

		console.log(`submission_${i}: generating summary...`);
		const summary = await generateHTMLSummary({ submission, env });

		summaries.push(summary);
	}

	if (summaries.length === 0) {
		return '<p>There was an error and no summaries could be generated</p>';
	}

	return summaries.join('<hr />');
}
