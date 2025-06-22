import { sortFarbbereiche, type Diagnostik, type Row } from '@thesis/diagnostik';
import Chart from 'chart.js/auto'
import { useEffect } from 'react';

export const KuchenDiagramm = ({ data, diagnostik }: { data: Row[], diagnostik: Diagnostik }) => {

    const { farbbereiche } = diagnostik

    sortFarbbereiche(farbbereiche ?? [])
    if (farbbereiche == undefined || farbbereiche.length == 0) {
        return;
    }
    console.log(farbbereiche)
    const mindeststandard = farbbereiche[farbbereiche?.length - 1]

    let mindeststandardErreicht = 0
    let mindeststandardNichtErreicht = 0

    for (const schueler of data) {
        const letztesErgebnis = schueler.ergebnisse.sort((a, b) => {
            const dateA = a.datum ? new Date(a.datum).getTime() : 0;
            const dateB = b.datum ? new Date(b.datum).getTime() : 0;
            return dateB - dateA;
        })?.[0];
        const ergebnis = Number(letztesErgebnis.ergebnis);
        console.log(letztesErgebnis, mindeststandard)
        if (
            typeof mindeststandard?.obereGrenze === 'number' &&
            ergebnis >= mindeststandard.obereGrenze
        ) {
            mindeststandardErreicht += 1;
        } else {
            mindeststandardNichtErreicht += 1;
        }
    }
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