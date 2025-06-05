import { generateText } from 'ai';
import { createMistral } from '@ai-sdk/mistral';

export async function generateAISummary({ url, markdown, env }: { url: string; markdown: string; env: Env }) {
	const modelName = env.MISTRAL_MODEL_NAME;
	const model = createMistral({
		apiKey: env.MISTRAL_API_KEY,
	})(modelName);

	const prompt = `
Summarize the following markdown article in MAX 160 CHARACTERS and MAX 3 SENTENCES.
Avoid using a reporting verb, you can directly state the action or information from the author.
Answer with JUST TEXT, DO NOT RETURN MARKDOWN:
${markdown}`;

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

		return text;
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
