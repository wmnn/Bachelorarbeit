import {type Farbbereich } from './models'

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