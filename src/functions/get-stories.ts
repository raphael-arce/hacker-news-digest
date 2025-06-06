import { UTCDate } from '@date-fns/utc';
import type { AlgoliaHit, AlgoliaResponse, Story } from '../types';
import { startOfDay, endOfDay, getUnixTime } from 'date-fns';

export async function getStories({ date, env }: { date: UTCDate; env: Env }): Promise<Story[]> {
	const startOfDate = startOfDay(date);
	const endOfDate = endOfDay(date);

	const url = `https://hn.algolia.com/api/v1/search?hitsPerPage=${env.LIMIT}&filters=created_at_i>=${getUnixTime(startOfDate)} AND created_at_i<${getUnixTime(endOfDate)}`;

	console.log(url);

	let results: AlgoliaResponse;
	try {
		const response = await fetch(url, {
			signal: AbortSignal.timeout(10_000),
		});

		results = (await response.json()) as AlgoliaResponse;

		if (!results?.hits) {
			throw new Error(`No hits in algolia results: ${JSON.stringify(results)}`);
		}
	} catch (error) {
		console.error('Failed to fetch stories:', error);
		return [];
	}

	const stories: Story[] = [];

	for (let i = 0; i < results.hits.length; i++) {
		const title = results.hits[i].title;
		const url = absolutizeUrl(results.hits[i]);
		const points = results.hits[i].points;
		const commentsUrl = getStoryUrl(results.hits[i]);
		const commentsAmount = results.hits[i].num_comments;

		stories.push({
			title,
			url: url,
			points,
			commentsUrl,
			commentsAmount,
		});
	}

	return stories;
}

function absolutizeUrl({ url, story_id }: AlgoliaHit) {
	if (!url) {
		return getStoryUrl({ story_id });
	}

	return url;
}

function getStoryUrl({ story_id }: Partial<AlgoliaHit>) {
	return `https://news.ycombinator.com/item?id=${story_id}`;
}
