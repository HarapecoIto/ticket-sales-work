import type { VercelRequest, VercelResponse } from '@vercel/node';

const isAuthorized = (request: VercelRequest): boolean => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return true;
  }

  const authHeader = request.headers.authorization;
  return authHeader === `Bearer ${cronSecret}`;
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET') {
    return response.status(405).json({ ok: false, message: 'Method Not Allowed' });
  }

  if (!isAuthorized(request)) {
    return response.status(401).json({ ok: false, message: 'Unauthorized' });
  }

  console.log('[cron] copy-to-sheet started');

  // TODO: Copy aggregated data to spreadsheet.

  return response.status(200).json({ ok: true, job: 'copy-to-sheet' });
}
