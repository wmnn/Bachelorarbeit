import { ButtonLight } from '@/components/ButtonLight';
import { getDates, getMindeststandard, getMindeststandardResults, sortRowErgebnisseByDate, type Diagnostik, type Row } from '@thesis/diagnostik';
import Chart from 'chart.js/auto'
import { useEffect, useState } from 'react';
import { download } from './util';
import { Filter } from './Filter';

export const KlassenBalkenDiagramm = ({ data: initialData, diagnostik }: { data: Row[], diagnostik: Diagnostik }) => {

    const mindeststandard = getMindeststandard(diagnostik)
    const [data, setData] = useState(initialData)

    if (!mindeststandard) {
        return;
    }

    const id = 'balkendiagramm'

    useEffect(() => {

        let chart = Chart.getChart(id); 
        if (chart != undefined) {
            chart.destroy();
        }
        const ctx = (document.getElementById(id) as HTMLCanvasElement).getContext('2d');
        const sortedData = sortRowErgebnisseByDate(data)
        const dates = getDates(sortedData)
        const mindeststandardErreicht = dates.map(date => getMindeststandardResults(Number(mindeststandard), data, date).mindeststandardErreicht)
        const mindeststandardNichtErreicht = dates.map(date => getMindeststandardResults(Number(mindeststandard), data, date).mindeststandardNichtErreicht)

        const labels = [...dates]
        const datasets = [
            {
                label: 'Mindeststandard nicht erreicht',
                data: mindeststandardNichtErreicht,
                backgroundColor: 'rgb(245, 51, 51)'
            },
            {
                label: 'Mindeststandard erreicht',
                data: mindeststandardErreicht,
                    backgroundColor: 'rgb(0, 124, 19)'
            },
        ]
        
        if (ctx) {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Anzahl der Schüler, die den Mindeststandard erreicht haben'
                        },
                    },
                    responsive: true,
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true
                        }
                    }
                }

            });
        }
    }, [data])
    return <>
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