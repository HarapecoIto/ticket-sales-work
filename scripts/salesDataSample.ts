import prisma from '@/lib/prisma.js';
import { Project, parseProject } from '@/app/types.v2.js';
import { getSalesData } from '@/app/report/report.v2.js';

const main = async () => {
  const records = await prisma.projects.findMany({
    select: { meta_info: true },
  });
  if (records.length === 0) {
    console.log('No project found.');
    return;
  }
  const projects: Project[] = records
    .map((record) => parseProject(record.meta_info))
    .filter((p): p is Project => !!p);
  projects.sort((a: Project, b: Project) => {
    const lastConcertA = a.concerts[a.concerts.length - 1];
    const lastConcertB = b.concerts[b.concerts.length - 1];
    if (lastConcertA.start_datetime == lastConcertB.start_datetime) {
      return 0;
    }
    return lastConcertA.start_datetime > lastConcertB.start_datetime ? 1 : -1;
  });

  for (const project of projects) {
    const lastConcert = project.concerts[project.concerts.length - 1];
    if (lastConcert.start_datetime < new Date()) {
      continue;
    }
    const sales = await getSalesData(project);
    console.log(JSON.stringify(sales, null, 2) + '\n');
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
