import { Submission } from '../types';
import { generateAISummary } from './generate-ai-summary';

export async function generateHTMLSummary({
	submission: { title, href, score, commentsAmount, commentsLink, markdown },
	ordinal,
	env,
}: {
	submission: Submission;
	ordinal: number;
	env: Env;
}) {
	if (!title || !href || !score || !commentsAmount || !commentsLink) {
		return `
<p><i>An article is missing a field: title: ${title}, href: ${href}, score: ${score},
commentsAmount: ${commentsAmount}, commentsLink: ${commentsLink}.</i></p>`;
	}

	const titleLine = `
<h2 style="font-size: 16px;">
	<a href="${href}">${ordinal}. ${title}</a>
	&nbsp;
	<span style="font-size: 12px;">(${new URL(href).hostname})</span>
</h2>
<p><b>${score}</b>, <a href="${commentsLink}">${commentsAmount}</a></p>`;

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
