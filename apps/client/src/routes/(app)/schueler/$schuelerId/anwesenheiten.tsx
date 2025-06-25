import { AnwesenheitsstatusDialog } from '@/components/anwesenheitsstatus/AnwesenheitsstatusDialog';
import { useAnwesenheiten } from '@/components/anwesenheitsstatus/useUnterrichtAnwesenheiten';
import { getColor } from '@/components/anwesenheitsstatus/util';
import { ButtonLight } from '@/components/ButtonLight';
import { Tooltip } from '@/components/Tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SchuelerNav } from '@/layout/SchuelerNav';
import { createFileRoute } from '@tanstack/react-router'
import { ANWESENHEITEN, Anwesenheiten, AnwesenheitenLabels, AnwesenheitTyp, AnwesenheitTypLabel, type AnwesenheitResponseData } from '@thesis/anwesenheiten';
import { getSchuljahr, type Schuljahr } from '@thesis/schule';
import { useEffect, useState } from 'react';

export const Route = createFileRoute(
  '/(app)/schueler/$schuelerId/anwesenheiten',
)({
  component: RouteComponent,
})

function RouteComponent() {

  const { schuelerId } = Route.useParams();
  return <div className='w-full'>
    <SchuelerNav schuelerId={schuelerId} />
    <div className='flex flex-col px-8 w-full'>
      <AnwesenheitenDisplay typ={AnwesenheitTyp.UNTERRICHT} schuelerId={schuelerId} />
      <AnwesenheitenDisplay typ={AnwesenheitTyp.GANZTAG} schuelerId={schuelerId} />
    </div>
  </div>
}

enum FilterOption {
  SCHULJAHR,
  MONAT,
  WOCHE
}

const AnwesenheitenFilter = ({ 
  setFilteredAnwesenheiten, 
  anwesenheiten,
  selectedFilter,
  setSelectedFilter
}: { 
    setFilteredAnwesenheiten: any, 
    anwesenheiten: AnwesenheitResponseData[],
    selectedFilter: any,
    setSelectedFilter: any
}) => {
  
  return <Select 
      value={`${selectedFilter}`}
      onValueChange={async (val) => {
          const status = parseInt(val) as FilterOption
          setSelectedFilter(status)
          if (status == FilterOption.SCHULJAHR) {
            setFilteredAnwesenheiten(anwesenheiten)
          } else if (status == FilterOption.MONAT) {
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);

            const filtered = anwesenheiten.filter(anwesenheit => {
              const date = new Date(anwesenheit.datum);
              return date >= thirtyDaysAgo && date <= today;
            });
            setFilteredAnwesenheiten(filtered)
          } else {
            const today = new Date();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(today.getDate() - 7);

            const filtered = anwesenheiten.filter(anwesenheit => {
              const date = new Date(anwesenheit.datum);
              return date >= sevenDaysAgo && date <= today;
            });
            setFilteredAnwesenheiten(filtered)
          }
      }}
  >
    <SelectTrigger className="xl:w-[200px] w-min">
        <SelectValue placeholder="Keine Option ausgewählt."/>
    </SelectTrigger>
    <SelectContent>
        <SelectItem value={`${FilterOption.SCHULJAHR}`}>
          Schuljahr
        </SelectItem> 
        <SelectItem value={`${FilterOption.MONAT}`}>
          Monat
        </SelectItem> 
        <SelectItem value={`${FilterOption.WOCHE}`}>
          Woche
        </SelectItem>                 
    </SelectContent>
  </Select>  


}

const AnwesenheitenDisplay = ({ typ, schuelerId }: { typ: AnwesenheitTyp, schuelerId: string }) => {

  const [isDialogShown, setIsDialogShown] = useState(false)
  const [schuljahr, _] = useState<Schuljahr>(getSchuljahr(new Date()));
  const { query } = useAnwesenheiten(parseInt(schuelerId), typ)
  const [selectedFilter, setSelectedFilter] = useState(FilterOption.SCHULJAHR)

  let anwesenheiten = query.data;
  const [filteredAnwesenheiten, setFilteredAnwesenheiten] = useState<undefined | AnwesenheitResponseData[]>(anwesenheiten)

  useEffect(() => {
    anwesenheiten = query.data
    setFilteredAnwesenheiten(anwesenheiten)
  }, [query.data])

  if (query.isPending) {
    return <p>...Loading</p>
  }
  
  if (!anwesenheiten || !filteredAnwesenheiten) {
    return <p>Fehler</p>
  }

  const exportData = () => {
    const jsonString = JSON.stringify(anwesenheiten?.map(anwesenheit => ({
      datum: anwesenheit.datum.split('T')[0],
      typ: AnwesenheitTypLabel[anwesenheit.typ],
      status: AnwesenheitenLabels[anwesenheit.status]
    })), null, 2); // pretty-printed
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "anwesenheiten.json";
    a.click();

    URL.revokeObjectURL(url); 
  };

  return <div className='w-full'>

    {
      isDialogShown && <AnwesenheitsstatusDialog 
        closeDialog={() => setIsDialogShown(false)} 
        schuelerId={parseInt(schuelerId)}
        initial={ANWESENHEITEN[0]}
        typ={typ}
      />
    }
    <h2>{typ == AnwesenheitTyp.UNTERRICHT ? 'Unterricht' : 'Ganztag'}</h2>
    <div className='flex gap-2 justify-between w-full'>
      <ButtonLight 
      className='max-w-[360px]'
      onClick={() => { 
        setIsDialogShown(true)
      }}>
        Aktualisieren
      </ButtonLight>
      <div>
        <AnwesenheitenFilter 
          anwesenheiten={anwesenheiten} 
          setFilteredAnwesenheiten={setFilteredAnwesenheiten} 
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />  
      </div>
      
    </div>
    <ButtonLight className='max-w-[360px] my-4' onClick={() => exportData()}>
      Export
    </ButtonLight>
    

    <DataDisplay 
      data={filteredAnwesenheiten}
    />
    <AnwesenheitenGrid 
      data={filteredAnwesenheiten} 
      schuljahr={schuljahr} 
      selectedFilter={selectedFilter}
    />

  </div>
}

const DataDisplay = ({ data }: { data: any }) => {

  function count(data: any, status: Anwesenheiten) {
    return data.filter((item: any) => item.status === status).length
  }

  return <div className='flex flex-col my-2'>
    <div className='flex gap-2'>
      <p>Anwesend:</p>
      <p>{count(data, Anwesenheiten.ANWESEND)}</p>
    </div>
    <div className='flex gap-2'>
      <p>Verspätet:</p>
      <p>{count(data, Anwesenheiten.VERSPAETET)}</p>
    </div>
    <div className='flex gap-2'>
      <p>Fehlt unentschuldigt:</p>
      <p>{count(data, Anwesenheiten.FEHLT_UNENTSCHULDIGT)}</p>
    </div>
    <div className='flex gap-2'>
      <p>Fehlt entschuldigt:</p>
      <p>{count(data, Anwesenheiten.FEHLT_ENTSCHULDIGT)}</p>
    </div>
  </div>
}

const AnwesenheitenGrid = ({ 
  data, 
  schuljahr,
  selectedFilter
}: { 
  data: any[], 
  schuljahr: Schuljahr,
  selectedFilter: FilterOption
}) => {
  const dateMap = new Map<string, number>();
  data.forEach(entry => {
    const date = new Date(entry.datum).toISOString().split('T')[0];
    dateMap.set(date, entry.status);
  });

  const today = new Date();
  const [startYearStr,] = schuljahr.split('/');
  const startYear = parseInt(startYearStr);
  let startDate = new Date(`${2000 + startYear}-08-01`);
  if (selectedFilter == FilterOption.MONAT) {
    startDate = new Date();
    startDate.setDate(today.getDate() - 30);
  } else if (selectedFilter == FilterOption.WOCHE) {
    startDate = new Date();
    startDate.setDate(today.getDate() - 7);
  }

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
    <div className="gap-1 flex overflow-x-scroll">
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
                  className={`w-[12px] h-[12px] xl:w-[16px] xl:h-[16px] rounded-sm ${bgColor}`}
                />
              </Tooltip>
            );
          })}
        </div>
      ))}
    </div>
  );
};