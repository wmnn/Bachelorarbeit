import {type Farbbereich } from './models'

export function sortFarbbereiche(farbbereiche: Farbbereich[]): Farbbereich[] {
    return farbbereiche.sort((a, b) => {
        const aVal = a.obereGrenze === '' || a.obereGrenze === undefined ? null : parseFloat(a.obereGrenze as any);
        const bVal = b.obereGrenze === '' || b.obereGrenze === undefined ? null : parseFloat(b.obereGrenze as any);

        if (aVal === null && bVal === null) return 0;
        if (aVal === null) return -1; // a comes first
        if (bVal === null) return 1;  // b comes first

        return bVal - aVal; // Descending
    });
}