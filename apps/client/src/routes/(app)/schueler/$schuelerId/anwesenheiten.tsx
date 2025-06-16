import { getColor } from '@/components/anwesenheitsstatus/util';
import { Tooltip } from '@/components/Tooltip';
import { SchuelerNav } from '@/layout/SchuelerNav';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'
import { Anwesenheiten, AnwesenheitenLabels, AnwesenheitTyp, getAnwesenheiten } from '@thesis/anwesenheiten';
import { getSchuljahr, type Schuljahr } from '@thesis/schule';
import { useState } from 'react';

export const Route = createFileRoute(
  '/(app)/schueler/$schuelerId/anwesenheiten',
)({
  component: RouteComponent,
})

function RouteComponent() {

  const { schuelerId } = Route.useParams();
  const [schuljahr, setSchuljar] = useState<Schuljahr>(getSchuljahr(new Date()));

  const { isPending, data: schultagAnwesenheiten } = useQuery({
      queryKey: ['sadnkajsd', schuelerId, schuljahr, AnwesenheitTyp.UNTERRICHT],
      queryFn: ({ queryKey }) => {
      const [_key, schuelerId, schuljahr, typ] = queryKey as [string, string, Schuljahr, AnwesenheitTyp];
          return getAnwesenheiten(parseInt(schuelerId), schuljahr as Schuljahr, typ);
      },
      initialData: undefined,
      staleTime: 0
  });

  const { isPending: isPending2, data: ganztagAnwesenheiten } = useQuery({
      queryKey: ['sadnkajsdsad', schuelerId, schuljahr, AnwesenheitTyp.GANZTAG],
      queryFn: ({ queryKey }) => {
      const [_key, schuelerId, schuljahr, typ] = queryKey as [string, string, Schuljahr, AnwesenheitTyp];
          return getAnwesenheiten(parseInt(schuelerId), schuljahr as Schuljahr, typ);
      },
      initialData: undefined,
      staleTime: 0
  });

  if (isPending || isPending2) {
    return <p>...Loading</p>
  }
  if (!schultagAnwesenheiten || !ganztagAnwesenheiten) {
    return <p>Fehler</p>
  }

  return <div className='w-full'>
    <SchuelerNav schuelerId={schuelerId} />
    <div className='flex flex-col'>

      <h2>Unterricht</h2>
      <AnwesenheitenGrid data={schultagAnwesenheiten} schuljahr={schuljahr} />

      <h2>Ganztag</h2>
      <AnwesenheitenGrid data={ganztagAnwesenheiten} schuljahr={schuljahr} />
    </div>
    
    </div>
}

const AnwesenheitenGrid = ({ data, schuljahr }: { data: any[], schuljahr: Schuljahr }) => {
  const dateMap = new Map<string, number>();
  data.forEach(entry => {
    const date = new Date(entry.datum).toISOString().split('T')[0];
    dateMap.set(date, entry.status);
  });

  const today = new Date();
  const [startYearStr,] = schuljahr.split('/');
  const startYear = parseInt(startYearStr);
  const startDate = new Date(`${2000 + startYear}-08-01`);

  const allRelevantDays: string[] = [];
  const tempDate = new Date(startDate);

  while (tempDate <= today) {
    const dayOfWeek = tempDate.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      allRelevantDays.push(tempDate.toISOString().split('T')[0]);
    }
    tempDate.setDate(tempDate.getDate() + 1);
  }

  const weeks: (string | null)[][] = [];
  let currentWeek: (string | null)[] = [];

  if (allRelevantDays.length > 0) {
    const firstRelevantDate = new Date(allRelevantDays[0]);
    let firstDayInFirstWeek = firstRelevantDate.getDay();
    const firstDayOfWeekIndex = (firstDayInFirstWeek === 0) ? 6 : firstDayInFirstWeek - 1;

    for (let i = 0; i < firstDayOfWeekIndex; i++) {
        currentWeek.push(null);
    }

    allRelevantDays.forEach(day => {
        currentWeek.push(day);
        if (currentWeek.length === 5) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    if (currentWeek.length > 0) {
        while (currentWeek.length < 5) {
            currentWeek.push(null);
        }
        weeks.push(currentWeek);
    }
  }


  return (
    <div className="flex gap-1">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((day, di) => {
            const status = day ? dateMap.get(day) : undefined;
            const bgColor = day ? (getColor(status as Anwesenheiten) ?? 'bg-gray-300') : 'bg-transparent';
            const tooltipContent = day ? (
                <div>
                    {day}{`, `}
                    {status !== undefined ? AnwesenheitenLabels[status as Anwesenheiten] : 'Keine Daten'}
                </div>
            ) : null;

            return (
              <Tooltip content={tooltipContent} key={di}>
                <div
                  className={`w-4 h-4 rounded-sm ${bgColor}`}
                />
              </Tooltip>
            );
          })}
        </div>
      ))}
    </div>
  );
};