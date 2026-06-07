import prisma from '@/lib/prisma';
import { type Tour } from '@/app/types';
import TOURS from '@/app/definitions/definitions';
import { getTicketSales } from '@/app/report/loadSales';

const isTarget = (dateAt: Date): boolean => {
  // 日付を比較するのためにUTCの0:00:00に変換して比較する
  const nextDay = new Date(dateAt);
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setUTCHours(0, 0, 0, 0);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today <= nextDay;
};

export const postSalesData = async (
  eventCode: string
): Promise<{ sent: number; failed: number }> => {
  const tour: Tour | undefined = TOURS.find((t) => t.event_code === eventCode);
  if (!tour) {
    console.warn(`Tour with ID ${eventCode} not found`);
    return Promise.resolve({ sent: 0, failed: 0 });
  }
  if (tour.concerts.every((concert) => !isTarget(new Date(concert.date_at)))) {
    console.log(`Tour ${tour.event_code} is a past event, skipping`);
    return Promise.resolve({ sent: 0, failed: 0 });
  }
  const spreadsheets = await prisma.spreadsheets.findMany({
    where: {
      event_code: eventCode,
      ciel_id: process.env.CIEL_ID,
    },
  });
  if (spreadsheets.length === 0) {
    console.warn(`No spreadsheets found for tour ${eventCode}`);
    return Promise.resolve({ sent: 0, failed: 0 });
  }
  const data = await Promise.all(
    tour.concerts.map(async (concert) => ({
      concert_name: concert.short_name,
      sales: await getTicketSales(tour, concert),
    }))
  );
  const contents = {
    api_key: process.env.SPREADSHEETS_API_KEY,
    date: new Date().toISOString(),
    data: { tour_name: tour.short_name, concerts: data },
  };
  let sent = 0;
  let failed = 0;
  spreadsheets.forEach(async (sheet): Promise<void> => {
    console.log(`Sending data to sheet ${sheet.url} for tour ${tour.event_code}`);
    let isSuccess = true;
    fetch(sheet.url, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contents),
    }).catch((error) => {
      console.error(`Error sending data to sheet ${sheet.url}:`, error);
      isSuccess = false;
    });
    if (isSuccess) {
      sent++;
    } else {
      failed++;
    }
  });
  return { sent, failed };
};
