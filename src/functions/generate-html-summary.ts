import { Submission } from '../types';
import { generateAISummary } from './generate-ai-summary';

export async function generateHTMLSummary({
	submission: { title, href, score, commentsAmount, commentsLink, markdown },
	env,
}: {
	submission: Submission;
	env: Env;
}) {
	if (!title || !href || !score || !commentsAmount || !commentsLink) {
		return `
<p>An article is missing a field: title: ${title}, href: ${href}, score: ${score},
commentsAmount: ${commentsAmount}, commentsLink: ${commentsLink}.</p>`;
	}

	const titleLine = `
<h2 style="font-size: 16px;">
	<a href="${href}">${title}</a>
	&nbsp;
	<span style="font-size: 12px;">(${new URL(href).hostname})</span>
</h2>
<p><b>${score}</b>, <a href="${commentsLink}">${commentsAmount}</a></p>`;

	if (!markdown) {
		return `
${titleLine}
<p>could not get the markdown for this article</p>`;
	}

	const summary = await generateAISummary({ href, markdown, env });

	if (summary === null) {
		return `
${titleLine}
<p>could not generate a summary for this article</p>`;
	}

	return `
${titleLine}
<p>${summary}</p>`;
}
