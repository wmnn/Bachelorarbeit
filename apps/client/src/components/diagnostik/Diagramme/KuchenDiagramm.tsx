import { ButtonLight } from '@/components/ButtonLight';
import { getDates, getMindeststandard, getMindeststandardResults, type Diagnostik, type Row } from '@thesis/diagnostik';
import Chart from 'chart.js/auto'
import { useEffect, useState } from 'react';
import { download } from './util';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from './Filter';

export const KuchenDiagramm = ({ data: initialData, diagnostik }: { data: Row[], diagnostik: Diagnostik }) => {

    const mindeststandard = getMindeststandard(diagnostik)
    if (!mindeststandard) {
        return;
    }

    const [data, setData] = useState(initialData)
    const dates = getDates(data)
    const [date, setDate] = useState(dates[dates.length - 1] ?? '');
    const id = 'pie'

    useEffect(() => {

        const {
            mindeststandardErreicht,
            mindeststandardNichtErreicht
        } = getMindeststandardResults(Number(mindeststandard), data, date)

        let chart = Chart.getChart(id); 
        if (chart != undefined) {
            chart.destroy();
        }
        const ctx = (document.getElementById(id) as HTMLCanvasElement).getContext('2d');
        if (ctx) {
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: [
                        `Mindeststandard erreicht ${(mindeststandardErreicht * 100 / (mindeststandardErreicht + mindeststandardNichtErreicht)).toFixed(2)}%`,
                        `Mindeststandard nicht erreicht ${(mindeststandardNichtErreicht * 100 / (mindeststandardErreicht + mindeststandardNichtErreicht)).toFixed(2)}%`,
                    ],
                    datasets: [{
                        label: `Anzahl`,
                        data: [mindeststandardErreicht, mindeststandardNichtErreicht],
                        backgroundColor: [
                            'rgb(0, 147, 12)',
                            'rgb(245, 56, 100)',
                        ],
                        hoverOffset: 4
                    }]
                }
            });
        }
    }, [date, data, initialData])
    return <>
        <h1>Kuchendiagramm der letzten Auswertung</h1>
        <Select 
            value={`${date}`}
            onValueChange={async (date: string) => {
                setDate(date)
            }}
        >
            <SelectTrigger className="xl:w-[200px] w-min">
                <SelectValue placeholder="Kein Datum verfügbar"/>
            </SelectTrigger>
            <SelectContent>
                {
                    dates.map((date) => {
                        return <SelectItem key={date} value={`${date}`}>
                            {date}                    
                        </SelectItem>                 
                    })
                }
            </SelectContent>
        </Select>    
        <Filter initialData={initialData} data={data} setData={setData} diagnostik={diagnostik} />

        <canvas id={id} className='max-w-full xl:max-h-[576px] px-8'></canvas>
        <div className='flex justify-start my-8'>
            <ButtonLight onClick={() => download(id)} className='max-w-[360px]'>
                Download
            </ButtonLight>
            <div className='grow'/>
        </div>
    </>
}