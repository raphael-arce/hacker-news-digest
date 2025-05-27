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

		console.log(`submission_${i}: extracting markdown for ${submission.href}...`);
		submission.markdown = await extractMarkdown({ url: submission.href, env });

		console.log(`submission_${i}: generating summary for ${submission.href}...`);
		const summary = await generateHTMLSummary({ index: i, submission, env });

		summaries.push(summary);
	}

	if (summaries.length === 0) {
		return '<p><i>There was an error and no summaries could be generated<i/></p>';
	}

	return summaries.join('<hr />');
}
