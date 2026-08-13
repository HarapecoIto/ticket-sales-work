import prisma from '../lib/prisma.js';
import { getSalesData, createReport } from '@/app/report/report.v2.js';

const main = async () => {
  // 案件情報の取得
  const triggered = await prisma.scraping_triggered.findMany({
    orderBy: {
      triggered_at: 'desc',
    },
    take: 1,
  });
  if (triggered.length === 0) {
    console.log('No triggered records found.');
    return;
  }
  const projectCode = triggered[0].project_code;

  // 売上データの取得
  const salesData = await getSalesData(projectCode);
  console.log('Sales Data:', JSON.stringify(salesData, null, 2));

  // レポートの作成
  const lines: string[] = await createReport(projectCode);
  console.log('Sales Report:\n' + lines.join('\n'));
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
