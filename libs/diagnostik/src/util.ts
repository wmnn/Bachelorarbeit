import {type Diagnostik, type Farbbereich, type Row } from './models'

export function sortFarbbereiche(farbbereiche: Farbbereich[]): Farbbereich[] {
  return farbbereiche.sort((a, b) => {
    const parseGrenze = (val: string | number | undefined): number | null => {
        if (val === '' || val === undefined) return null;
        if (typeof val === 'number') return val;
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
    };

    const aVal = parseGrenze(a.obereGrenze);
    const bVal = parseGrenze(b.obereGrenze);

    if (aVal === null && bVal === null) return 0;
    if (aVal === null) return -1;
    if (bVal === null) return 1;

    return bVal - aVal;
  });
}

export function getMindeststandard(diagnostik: Diagnostik): undefined | number {
  const { farbbereiche } = diagnostik
  sortFarbbereiche(farbbereiche ?? [])
  if (farbbereiche == undefined || farbbereiche.length == 0) {
      return;
  }
  return parseInt(`${farbbereiche[farbbereiche?.length - 1].obereGrenze}`)
}

/**
 * Funktion um ein Array zu erhalten, welches jedes Datum enthält
 * @param data row data
 * @returns 
 */
export function getDates(data: Row[]): string[] {
  return Array.from(data.reduce((prev, acc) => {
    for (const ergebnis of acc.ergebnisse) {
      let datum = ergebnis.datum ?? ''
      if (datum.includes('T')) {
        datum = datum.split('T')[0]
      }
      prev.add(datum)
    }
    return prev
  }, new Set([] as string[])))
}

export function sortRowErgebnisseByDate(rows: Row[]): Row[] {
  return rows.map(row => ({
    ...row,
    ergebnisse: [...row.ergebnisse].sort((a, b) => {
      const dateA = new Date(a.datum ?? '').getTime();
      const dateB = new Date(b.datum ?? '').getTime();
      return dateA - dateB;
    })
  }));
}