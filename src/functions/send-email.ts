import { Resend } from 'resend';
import { UTCDate } from '@date-fns/utc';
import { formatDate } from 'date-fns';

export async function sendEmail({ date, body, env }: { date: UTCDate; body: string; env: Env }) {
	const resend = new Resend(env.RESEND_API_KEY);

	/**
	 * Format patterns definition:
	 * EEEE: Day of Week (Monday, Tuesday, Wednesday...)
	 * do: Day of Month (1st, 2nd, 3rd...)
	 * LLLL: Month (January, February, March...)
	 * yyyy: Year (2025, 2026, 2027...)
	 */
	const formattedDate = formatDate(date, "EEEE do 'of' LLLL yyyy");

	const email = `
<h1 style="font-size:16px;">${formattedDate}</h2>
${body}
`;

	const { error } = await resend.emails.send({
		from: env.SENDER,
		to: [env.RECEIVERS],
		subject: 'Hacker News Digest',
		html: email,
	});

	if (error) {
		console.error(`Error sending the email with resend:`, error);
	}
}
