import {type Farbbereich } from './models'

export function sortFarbbereiche(farbbereiche: Farbbereich[]): Farbbereich[] {
    return farbbereiche.sort((a, b) => {
        if (a.obereGrenze === undefined) return -1;
        if (b.obereGrenze === undefined) return 1;
        return b.obereGrenze - a.obereGrenze;
    });
}