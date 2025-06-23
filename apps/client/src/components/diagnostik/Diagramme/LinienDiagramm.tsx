import { ButtonLight } from '@/components/ButtonLight';
import { useSchuelerStore } from '@/components/schueler/SchuelerStore';
import { useAllSchueler } from '@/components/schueler/useSchueler';
import { getDates, getMindeststandard, sortRowErgebnisseByDate, type Diagnostik, type Row } from '@thesis/diagnostik';
import Chart from 'chart.js/auto'
import { useEffect } from 'react';
import { download } from './util';

export const Liniendiagramm = ({ data, diagnostik }: { data: Row[], diagnostik: Diagnostik }) => {

    const mindeststandard = getMindeststandard(diagnostik)
    useAllSchueler()
    const schueler = useSchuelerStore(store => store.schueler)

    if (!mindeststandard) {
        return;
    }

    const id = 'liniendiagramm'

    useEffect(() => {

        let chart = Chart.getChart(id); 
        if (chart != undefined) {
            chart.destroy();
        }
        const ctx = (document.getElementById(id) as HTMLCanvasElement).getContext('2d');
        const sortedData = sortRowErgebnisseByDate(data)

        const labels = [...getDates(sortedData)]
        const datasets = [ ...(sortedData).map(row => {
                const schuelerData = schueler.find(schueler => schueler.id === row.schuelerId)
                let label = `${row.schuelerId}`
                if (schuelerData) {
                    label = `${schuelerData?.vorname} ${schuelerData?.nachname}`
                }

                return {
                    label,
                    fill: false,
                    borderColor: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
                    tension: 0.1,
                    data: row.ergebnisse.map(ergebnis => `${ergebnis.ergebnis}`)
                }
            }), 
            {
                label: 'Mindeststandard',
                fill: false,
                borderColor: 'rgb(0, 0, 0)',
                borderDash: [5, 5],
                tension: 0.1,
                data: Array(labels.length).fill(mindeststandard)
            }
        
        ]
        
        if (ctx) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets
                },
                options: {
                    responsive: true,
                    scales: {
                    y: {
                        min: 0,
                        max: 100,
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
    }, [])
    return <>
        <canvas id={id} className='max-w-full xl:max-h-[576px] px-8'></canvas>
        <div className='flex justify-start my-8'>
            <ButtonLight onClick={() => download(id)} className='max-w-[360px]'>
                Download
            </ButtonLight>
            <div className='grow'/>
        </div>
    </>
}