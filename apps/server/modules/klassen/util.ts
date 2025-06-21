import { Schueler } from "@thesis/schueler";
import { getHalbjahr, getSchuljahr, getTitle, Klasse, KlassenVersion } from "@thesis/schule";
import { getKlassenStore } from "../../singleton";

export function reduceKlassenversionenToKlassen(rows: any[]): Klasse[] {
    const klassen = rows.reduce((prev: Klasse[], current) => {
        const { klassenstufe, zusatz, schuljahr, halbjahr, klassen_id: klassenId } = current;
        let klasse = prev.find(k => k.id === klassenId);

        if (!klasse) {
            klasse = { id: klassenId, versionen: [] };
            prev.push(klasse);
        }

        if (!klasse.versionen.some(o => o.zusatz === zusatz && o.klassenstufe === klassenstufe)) {
            klasse.versionen.push({
                klassenId,
                klassenstufe,
                zusatz,
                schuljahr,
                halbjahr
            } as KlassenVersion);
        }

        return prev;
    }, []);

    // Add schueler to each version of each class
    for (const row of rows) {
        const { klassen_id: klassenId, klassenstufe, zusatz, schueler_id } = row;
        const klasse = klassen.find(k => k.id === klassenId);
        if (!klasse) continue;

        klasse.versionen.forEach(version => {
            if (version.klassenstufe === klassenstufe && version.zusatz === zusatz) {
                if (!version.schueler) version.schueler = [];
                version.schueler.push(schueler_id);
            }
        });
    }

    return klassen;
}

export async function addCurrentClassToSchueler(schueler: Schueler[]): Promise<Schueler[]> {

    const schuljahr = getSchuljahr(new Date());
    const halbjahr = getHalbjahr(new Date());

    const klassen = await getKlassenStore().getKlassenVonSchueler(schueler, schuljahr, halbjahr)

    return schueler.map((schueler) => {
        const entry = klassen.find(o => o.schuelerId === schueler.id)
        if (!entry) {
            return schueler;
        }
        schueler.derzeitigeKlasse = getTitle(entry.klasse);
        return schueler;
    })  
}