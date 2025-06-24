import { ButtonLight } from '@/components/ButtonLight';
import { ergebnisDatumGleich, getDates, getMindeststandard, sortRowErgebnisseByDate, type Diagnostik, type Row } from '@thesis/diagnostik';
import Chart from 'chart.js/auto'
import {
  BoxPlotController,
  BoxAndWiskers,
  ViolinController,
  Violin,
} from '@sgratzl/chartjs-chart-boxplot';
import { CategoryScale } from 'chart.js';
import { useEffect, useState } from 'react';
import { download } from './util';
import { Filter } from './Filter';

// Register new controllers and elements
Chart.register(BoxPlotController, BoxAndWiskers, ViolinController, Violin, CategoryScale);

export const BoxPlot = ({ data: initialData, diagnostik }: { data: Row[], diagnostik: Diagnostik }) => {

    const mindeststandard = getMindeststandard(diagnostik)
    const [data, setData] = useState(initialData)
    
    if (!mindeststandard) {
        return;
    }

    const id = 'boxplot'

    const sortedData = sortRowErgebnisseByDate(data)
    const dates = getDates(sortedData)
    const transformedData = dates.map((date) => {
        let values = [] as number[]
        for (const schueler of data) {
            const result = schueler.ergebnisse.find(ergebnis => ergebnisDatumGleich(ergebnis, date))
            if (result) {
                values.push(parseInt(result.ergebnis))
            }
        }
        return values
    })

    useEffect(() => {

        let chart = Chart.getChart(id); 
        if (chart != undefined) {
            chart.destroy();
        }
        const ctx = (document.getElementById(id) as HTMLCanvasElement).getContext('2d');
        
        if (ctx) {
            new Chart(ctx, {
                type: 'boxplot',
                data: {
                    labels: [...dates],
                    datasets: [
                        {
                            label: 'Boxplot',
                            data: transformedData
                        },
                    ],
                },
                options: {
                    responsive: true,
                    scales: {
                    y: {
                        min: diagnostik.untereGrenze,
                        max: diagnostik.obereGrenze,
                        ticks: {
                            stepSize: 10
                        },
                        title: {
                            display: true,
                            text: 'Ergebnis'
                        }
                    }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
                
            });
        }
    }, [data])
    return <>
        <Filter 
            initialData={initialData} 
            data={data} 
            setData={setData} 
            diagnostik={diagnostik}
        />
        <canvas id={id} className='max-w-full xl:max-h-[576px] px-8'></canvas>
        <div className='flex justify-start my-8'>
            <ButtonLight onClick={() => download(id)} className='max-w-[360px]'>
                Download
            </ButtonLight>
            <div className='grow'/>
        </div>
    </>
}