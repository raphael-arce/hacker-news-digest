import { Story } from '../types';
import { extractMarkdown } from './extract-markdown';
import { generateHTMLSummary } from './generate-html-summary';

export async function generateSummaries({ stories, env }: { stories: Story[]; env: Env }) {
	let summaries: string[] = [];

	/**
	 * The API has a rate limit of 1/sec. To keep it simple, we just do it sequentially.
	 */
	for (let i = 0; i < stories.length; i++) {
		const ordinal = i + 1;
		const story = stories[i];

		console.log(`submission_${ordinal}: extracting markdown for ${story.url}...`);
		story.markdown = await extractMarkdown({ url: story.url, env });

		console.log(`submission_${ordinal}: generating summary for ${story.url}...`);
		const summary = await generateHTMLSummary({ ordinal, story, env });

		summaries.push(summary);
	}

	if (summaries.length === 0) {
		return '<p><i>There was an error and no summaries could be generated<i/></p>';
	}

	return summaries.join('<hr />');
}
