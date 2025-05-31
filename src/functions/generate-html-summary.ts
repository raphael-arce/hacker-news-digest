import { Story } from '../types';
import { generateAISummary } from './generate-ai-summary';

export async function generateHTMLSummary({
	story: { title, href, points, commentsAmount, commentsLink, markdown },
	ordinal,
	env,
}: {
	story: Story;
	ordinal: number;
	env: Env;
}) {
	if (!title || !href || !points || !commentsAmount || !commentsLink) {
		return `
<p><i>An article is missing a field: title: ${title}, href: ${href}, points: ${points},
commentsAmount: ${commentsAmount}, commentsLink: ${commentsLink}.</i></p>`;
	}

	const titleLine = `
<h2 style="font-size: 16px;">
	${ordinal}. <a href="${href}"> ${title}</a>
	<span style="font-size: 12px;">(${new URL(href).hostname})</span>
</h2>
<p><b>${points} points</b>, <a href="${commentsLink}">${commentsAmount} comments</a></p>`;

	if (!markdown) {
		return `
${titleLine}
<p><i>could not get the markdown for this article</i></p>`;
	}

	const summary = await generateAISummary({ href, markdown, env });

	if (summary === null) {
		return `
${titleLine}
<p><i>could not generate a summary for this article</i></p>`;
	}

	return `
${titleLine}
<p>${summary}</p>`;
}
