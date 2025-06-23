import { getDates, getMindeststandard, getMindeststandardResults, type Diagnostik, type Row } from '@thesis/diagnostik';
import Chart from 'chart.js/auto'
import { useEffect } from 'react';

export const KuchenDiagramm = ({ data, diagnostik }: { data: Row[], diagnostik: Diagnostik }) => {

    const mindeststandard = getMindeststandard(diagnostik)
    if (!mindeststandard) {
        return;
    }

    const dates = getDates(data)
    const {
        mindeststandardErreicht,
        mindeststandardNichtErreicht
     } = getMindeststandardResults(mindeststandard, data, dates[dates.length - 1])

    const id = 'pie'

    useEffect(() => {

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
                        `Mindeststandard erreicht ${(mindeststandardErreicht / (mindeststandardErreicht + mindeststandardNichtErreicht)).toFixed(2)}%`,
                        `Mindeststandard nicht erreicht ${(mindeststandardNichtErreicht / (mindeststandardErreicht + mindeststandardNichtErreicht)).toFixed(2)}%`,
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
    }, [])
    return <>
        <canvas id={id} className='max-w-full xl:max-h-[576px] px-8'></canvas>
    </>
}