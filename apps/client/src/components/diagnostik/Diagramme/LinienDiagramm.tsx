import { useSchuelerStore } from '@/components/schueler/SchuelerStore';
import { useAllSchueler } from '@/components/schueler/useSchueler';
import { getDates, getMindeststandard, type Diagnostik, type Row } from '@thesis/diagnostik';
import Chart from 'chart.js/auto'
import { useEffect } from 'react';

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
        if (ctx) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [...getDates(data)],
                    datasets: data.map(row => {
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
                    })
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
    </>
}