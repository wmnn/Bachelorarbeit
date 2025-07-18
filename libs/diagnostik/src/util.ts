import {type Diagnostik, type Ergebnis, type Farbbereich, type Row } from './models'

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

export function getMindeststandard(diagnostik: Diagnostik): undefined | string {
  const { farbbereiche } = diagnostik
  sortFarbbereiche(farbbereiche ?? [])
  if (farbbereiche == undefined || farbbereiche.length == 0) {
      return;
  }
  return Number(parseFloat(`${farbbereiche[farbbereiche?.length - 1].obereGrenze}`)).toFixed(2)
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
export function getMindeststandardResults(mindeststandard: number, data: Row[], datum: string) {
        let mindeststandardErreicht = 0
        let mindeststandardNichtErreicht = 0

        for (const schueler of data) {
            const ergebnisAmDatum = schueler.ergebnisse.find(ergebnis => ergebnisDatumGleich(ergebnis, datum))

            if (!ergebnisAmDatum) {
                continue;
            }

            const ergebnis = Number(ergebnisAmDatum.ergebnis);
            if (
                ergebnis >= mindeststandard
            ) {
                mindeststandardErreicht += 1;
            } else {
                mindeststandardNichtErreicht += 1;
            }
        }
        return {
            mindeststandardErreicht,
            mindeststandardNichtErreicht
        }
}

export function ergebnisDatumGleich(ergebnis: Ergebnis, datum: string) {
  if (!ergebnis.datum?.includes('T')) {
      return ergebnis.datum == datum
  }
  return new Date(ergebnis.datum).toISOString().split('T')[0] == new Date(datum).toISOString().split('T')[0]
}
export function sortErgebnisse(ergebnisse: Ergebnis[]): Ergebnis[] {
  return ergebnisse.sort((a, b) => {
    const dateA = a.datum ? new Date(a.datum).getTime() : 0;
    const dateB = b.datum ? new Date(b.datum).getTime() : 0;
    return dateB - dateA;
  });
}