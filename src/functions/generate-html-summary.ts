import { Story } from '../types';
import { escapeHtmlMarkup } from './escape-html-markup';
import { generateAISummary } from './generate-ai-summary';

export async function generateHTMLSummary({
	story: { title, url, points, commentsAmount, commentsUrl, markdown },
	ordinal,
	env,
}: {
	story: Story;
	ordinal: number;
	env: Env;
}) {
	if (!title || !url || !points || !commentsAmount || !commentsUrl) {
		return `
<p><i>An article is missing a field: title: ${title}, url: ${url}, points: ${points},
commentsAmount: ${commentsAmount}, commentsUrl: ${commentsUrl}.</i></p>`;
	}

	const titleLine = `
<h2 style="font-size: 16px;">
	${ordinal}. <a href="${url}"> ${escapeHtmlMarkup(title)}</a>
	<span style="font-size: 12px;">(${new URL(url).hostname})</span>
</h2>
<p><b>${points} points</b>, <a href="${commentsUrl}">${commentsAmount} comments</a></p>`;

	if (!markdown) {
		return `
${titleLine}
<p><i>could not get the markdown for this article</i></p>`;
	}

	const summary = await generateAISummary({ url, markdown, env });

	if (summary === null) {
		return `
${titleLine}
<p><i>could not generate a summary for this article</i></p>`;
	}

	return `
${titleLine}
<p>${summary}</p>`;
}
