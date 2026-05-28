import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import TOURS from '@/app/definitions/definitions';
import { summaryMessage } from '@/app/messages/notificationMessage';

const isAuthorized = (request: NextRequest): boolean => {
  const isGuarded = process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === undefined;
  if (!isGuarded) {
    return true;
  }
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return false;
  }
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
};

const execute = async (): Promise<string> => {
  let messagesSent = 0;
  for (const tour of TOURS) {
    const taskIds = await prisma.asana_tasks
      .findMany({ where: { event_code: tour.event_code } })
      .then((relations) => relations.map((r) => r.task_id))
      .catch((error) => {
        console.error(`Error fetching task IDs for event code ${tour.event_code}:`, error);
        return [];
      });
    if (taskIds.length > 0) {
      const message: string = await summaryMessage(tour.event_code);
      for (const taskId of taskIds) {
        try {
          fetch('/api/asana/comment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              taskGid: taskId,
              message,
            }),
          });
        } catch (error) {
          console.error(`Error pushing message for task ID ${taskId}:`, error);
        }
      }
      messagesSent += taskIds.length;
    }
  }
  console.log(`[cron] post-asana: ${messagesSent} messages sent`);
  return `[cron] post-asana: ${messagesSent} messages sent`;
};

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  console.log('[cron] post-asana started');
  try {
    const result = await execute();
    console.log('[cron] post-asana finished');
    return NextResponse.json({ ok: true, job: 'post-asana', result }, { status: 200 });
  } catch (error) {
    console.error('Error in post-asana:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to post Asana comments' },
      { status: 500 }
    );
  }
}
