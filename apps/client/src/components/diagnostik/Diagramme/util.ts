import { Erhebungszeitraum, type Row } from "@thesis/diagnostik";
import { FILES_ENDPOINT } from "../../../../../../libs/config/config";

export const download = (id: string) => {
    const canvas = document.getElementById(id) as HTMLCanvasElement | null;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${id}.png`;
    link.href = canvas.toDataURL();
    link.click();
};

export const downloadDateien = async (diagnostikId: string, files: string[]) => {
    for (const fileName of files) {
        try {
            const res = await fetch(`${FILES_ENDPOINT}/diagnostik/${diagnostikId}/${fileName}`);
            if (!res.ok) {
                continue;
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(`Error downloading ${fileName}:`, err);
        }
    }
};
export const filterErgebnisse = (rows: Row[], erhebungszeitraum: Erhebungszeitraum, maxDate: string | undefined, minDate: string | undefined) => {

    let filtered = rows

    if (minDate !== undefined) {
        if (erhebungszeitraum === Erhebungszeitraum.TAG) {
            filtered = filtered.map(row => ({
                ...row,
                ergebnisse: row.ergebnisse.filter(ergebnis => {
                    if (ergebnis.datum === undefined) return false;
                    return new Date(ergebnis.datum) >= new Date(minDate);
                })
            }));
        } else if (erhebungszeitraum === Erhebungszeitraum.KALENDERWOCHE) {
            filtered = filtered.map(row => ({
                ...row,
                ergebnisse: row.ergebnisse.filter(ergebnis => {
                    if (ergebnis.datum === undefined) return false;
                    return ergebnis.datum >= minDate;
                })
            }));
        }
    }

    if (maxDate !== undefined) {

        if (erhebungszeitraum === Erhebungszeitraum.TAG) {
            filtered = filtered.map(row => ({
                ...row,
                ergebnisse: row.ergebnisse.filter(ergebnis => {
                    if (ergebnis.datum === undefined) return false;
                    return new Date(ergebnis.datum) <= new Date(maxDate);
                })
            }));
        } else if (erhebungszeitraum === Erhebungszeitraum.KALENDERWOCHE) {
            filtered = filtered.map(row => ({
                ...row,
                ergebnisse: row.ergebnisse.filter(ergebnis => {
                    if (ergebnis.datum === undefined) return false;
                    return ergebnis.datum <= maxDate;
                })
            }));
        }
    }

    return filtered satisfies Row[] 
}