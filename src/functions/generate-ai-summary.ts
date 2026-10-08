import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { escapeHtmlMarkup } from './escape-html-markup';

const MAX_MARKDOWN_CHARS = 20_000;

export async function generateAISummary({ url, markdown, env }: { url: string; markdown: string; env: Env }) {
	const modelName = env.OPENROUTER_MODEL_NAME;
	const model = createOpenRouter({
		apiKey: env.OPENROUTER_API_KEY,
	})(modelName);

	/**
	 * The beginning of an article is enough for a one-sentence summary,
	 * and some pages (e.g. ASCII art) produce >1M chars of markdown.
	 */
	const truncatedMarkdown = markdown.slice(0, MAX_MARKDOWN_CHARS);

	const prompt = `<article>
${truncatedMarkdown}
</article>

Summarize the article above in ONE sentence of at most 160 characters (hard limit).
Lead with the concrete news or finding, not "The article/author says".
Plain text only, no markdown, no preamble.`;

	try {
		const start = performance.now();

		const { text } = await generateText({
			model,
			prompt,
			abortSignal: AbortSignal.timeout(10_000),
		});

		const end = performance.now();
		const timing = end - start;
		console.log(`generating AI summary took: ${timing} ms`);

		return escapeHtmlMarkup(text);
	} catch (error) {
		console.error(`Error getting AI summary for ${url}:`, error);

		const { message } = error as Error;

		if (message.includes('too large for model')) {
			const pattern = /Prompt contains (\d+) tokens/;
			const [_, amount] = message.match(pattern) ?? ['', 'unknown amount'];
			return `<i>could not generate a summary for this article, too many tokens (${amount})</i>`;
		}

		if (message.includes('The operation was aborted due to timeout')) {
			return `<i>could not generate a summary for this article, timed out (>10seconds)</i>`;
		}

		return null;
	}
}
