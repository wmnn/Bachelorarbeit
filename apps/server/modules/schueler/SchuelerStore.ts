import { AnwesenheitTyp } from '@thesis/anwesenheiten';
import { Schueler, SchuelerSimple } from '@thesis/schueler';
import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseMessage, STANDARD_FEHLER } from '../shared/models';
import { addCurrentClassToSchueler } from '../klassen/util';

function handleSchuelerRow(schueler: any): Schueler {
    schueler.verlaesstSchuleAllein = schueler.verlaesst_schule_allein
    schueler.hatSonderpaedagogischeKraft = schueler.hat_sonderpaedagogische_kraft
    schueler.ernährung = schueler.ernaehrung
    delete schueler.verlaesst_schule_allein
    delete schueler.hat_sonderpaedagogische_kraft
    delete schueler.ernaehrung
    return schueler
}

export class SchuelerStore {

    private connection: Pool

    constructor(pool: Pool) {
        this.connection = pool
    }

    async getSchueler(): Promise<SchuelerSimple[]> {
        if (!this.connection) {
            throw new Error('Keine Datenbankverbindung');
        }

        const conn = this.connection;

        let [rows] = await conn.execute<RowDataPacket[]>(`
            SELECT id, vorname, nachname, hat_sonderpaedagogische_kraft, verlaesst_schule_allein, ernaehrung FROM schueler
        `);

        if (!Array.isArray(rows) || rows.length === 0) {
            return [];
        }

        rows = await addCurrentClassToSchueler(rows as Schueler[]) as any

        // Anwesenheiten werden dem Schüler hinzugefügt
        const [anwesenheiten] = await conn.execute<RowDataPacket[]>(`
            SELECT schueler_id, typ, status FROM anwesenheitsstatus a WHERE a.datum = CURDATE()
        `);
        if (Array.isArray(anwesenheiten) && anwesenheiten.length > 0) {
            for (const anwesenheit of anwesenheiten) {
                rows = rows.map((row: any) => {
                    if (row.id !== anwesenheit.schueler_id) {
                        return row;
                    }
                    if (anwesenheit.typ === AnwesenheitTyp.GANZTAG) {
                        row.heutigerGanztagAnwesenheitsstatus = anwesenheit.status
                    } else {
                        row.heutigerSchultagAnwesenheitsstatus = anwesenheit.status
                    }
                    return row
                })
            }
        }

        // Medikamente
        const [medikamente] = await conn.execute<RowDataPacket[]>(`
            SELECT schueler_id as schuelerId, medikament FROM schueler_medikamente m
        `);
        if (Array.isArray(medikamente) && medikamente.length > 0) {
            for (const medikament of medikamente) {
                rows = rows.map((row: any) => {
                    if (row.medikamente == undefined) {
                        row.medikamente = []
                    }
                    if (medikament.schuelerId != row.id) {
                        return row;
                    }
                    row.medikamente.push(medikament.medikament)
                    return row
                })
            }
        }
        return rows.map(row => handleSchuelerRow(row));
    }

    async getSchuelerComplete(schuelerId: number): Promise<Schueler | undefined> {
        if (!this.connection) {
            return undefined;
        }

        const conn = this.connection;

        const [rows] = await conn.execute<ResultSetHeader>(`
            SELECT * FROM schueler WHERE id = ?
        `, [schuelerId]);

        if (!Array.isArray(rows) || rows.length !== 1) {
            return undefined;
        }
        let schueler = handleSchuelerRow(rows[0])

        const [allergienUndUnvertraeglichkeiten] = await conn.execute<ResultSetHeader>(`
            SELECT * FROM schueler_allergien_unvertraeglichkeiten WHERE schueler_id = ?
        `, [schuelerId]);

        if (Array.isArray(allergienUndUnvertraeglichkeiten) && allergienUndUnvertraeglichkeiten.length > 0) {
            schueler.allergienUndUnvertraeglichkeiten = allergienUndUnvertraeglichkeiten.map((entry) => entry.allergie_oder_unvertraeglichkeit)
        }

        const [medikamente] = await conn.execute<ResultSetHeader>(`
            SELECT * FROM schueler_medikamente WHERE schueler_id = ?
        `, [schuelerId]);

        if (Array.isArray(medikamente) && medikamente.length > 0) {
            schueler.medikamente = medikamente.map((entry) => entry.medikament)
        }

        const [abholberechtigtePersonen] = await conn.execute<ResultSetHeader>(`
            SELECT * FROM schueler_abholberechtigte_personen WHERE schueler_id = ?
        `, [schuelerId]);

        if (Array.isArray(abholberechtigtePersonen) && abholberechtigtePersonen.length > 0) {
            schueler.abholberechtigtePersonen = abholberechtigtePersonen
        }

        return schueler;
    }


    async createSchueler(schueler: Schueler): Promise<DatabaseMessage> {
        if (!this.connection) {
            return STANDARD_FEHLER
        }

        const conn = await this.connection.getConnection();

        try {
            await conn.beginTransaction();

            const [result] = await conn.execute<ResultSetHeader>(`
                INSERT INTO schueler (vorname, nachname, familiensprache, geburtsdatum, strasse, hausnummer, ort, hat_sonderpaedagogische_kraft, verlaesst_schule_allein, postleitzahl, kommentar, ernaehrung)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                schueler.vorname,
                schueler.nachname,
                schueler.familiensprache,
                schueler.geburtsdatum,
                schueler.strasse,
                schueler.hausnummer,
                schueler.ort,
                schueler.hatSonderpaedagogischeKraft,
                schueler.verlaesstSchuleAllein,
                schueler.postleitzahl === '' ? null : Number(schueler.postleitzahl),
                schueler.kommentar,
                schueler.ernährung
            ]);

            const id = result.insertId;

            for (const element of schueler.allergienUndUnvertraeglichkeiten || []) {
                await conn.execute(`
                    INSERT INTO schueler_allergien_unvertraeglichkeiten (schueler_id, allergie_oder_unvertraeglichkeit)
                    VALUES (?, ?)
                `, [id, element]);
            }

            for (const medikament of schueler.medikamente || []) {
                await conn.execute(`
                    INSERT INTO schueler_medikamente (schueler_id, medikament)
                    VALUES (?, ?)
                `, [id, medikament]);
            }

            for (const person of schueler.abholberechtigtePersonen || []) {
                await conn.execute(`
                    INSERT INTO schueler_abholberechtigte_personen (schueler_id, vorname, nachname, strasse, hausnummer, ort, abholzeit, postleitzahl)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    id,
                    person.vorname,
                    person.nachname,
                    person.strasse,
                    person.hausnummer,
                    person.ort,
                    person.abholzeit,
                    (person.postleitzahl as string | number) === '' ? null : Number(person.postleitzahl)
                ]);
            }

            await conn.commit();
            conn.release()

            return {
                success: true,
                message: 'Der Schüler wurde erfolgreich erstellt.'
            };
        } catch (e) {
            await conn.rollback();
            conn.release()
            return {
                success: false,
                message: 'Beim Erstellen des Schülers ist ein Fehler aufgetreten.'
            };
        }
    }

    async editSchueler(schueler: Schueler): Promise<DatabaseMessage> {
        if (!this.connection) {
            return STANDARD_FEHLER;
        }

        const conn = await this.connection.getConnection();

        try {
            await conn.beginTransaction();

            await conn.execute(
                `UPDATE schueler 
                SET vorname = ?, nachname = ?, familiensprache = ?, geburtsdatum = ?, strasse = ?, hausnummer = ?, ort = ?, hat_sonderpaedagogische_kraft = ?, verlaesst_schule_allein = ?, postleitzahl = ?, kommentar = ?, ernaehrung = ?
                WHERE id = ?`,
                [
                    schueler.vorname,
                    schueler.nachname,
                    schueler.familiensprache,
                    schueler.geburtsdatum,
                    schueler.strasse,
                    schueler.hausnummer,
                    schueler.ort,
                    schueler.hatSonderpaedagogischeKraft,
                    schueler.verlaesstSchuleAllein,
                    schueler.postleitzahl === '' ? null : Number(schueler.postleitzahl),
                    schueler.kommentar,
                    schueler.ernährung,
                    schueler.id
                ]
            );

            await conn.execute(
                `DELETE FROM schueler_allergien_unvertraeglichkeiten WHERE schueler_id = ?`,
                [schueler.id]
            );
            await conn.execute(
                `DELETE FROM schueler_medikamente WHERE schueler_id = ?`,
                [schueler.id]
            );
            await conn.execute(
                `DELETE FROM schueler_abholberechtigte_personen WHERE schueler_id = ?`,
                [schueler.id]
            );

            for (const element of schueler.allergienUndUnvertraeglichkeiten || []) {
                await conn.execute(
                    `INSERT INTO schueler_allergien_unvertraeglichkeiten (schueler_id, allergie_oder_unvertraeglichkeit)
                    VALUES (?, ?)`,
                    [schueler.id, element]
                );
            }

            for (const medikament of schueler.medikamente || []) {
                await conn.execute(
                    `INSERT INTO schueler_medikamente (schueler_id, medikament)
                    VALUES (?, ?)`,
                    [schueler.id, medikament]
                );
            }

            for (const person of schueler.abholberechtigtePersonen || []) {
                await conn.execute(
                    `INSERT INTO schueler_abholberechtigte_personen 
                    (schueler_id, vorname, nachname, strasse, hausnummer, ort, abholzeit, postleitzahl) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        schueler.id,
                        person.vorname,
                        person.nachname,
                        person.strasse,
                        person.hausnummer,
                        person.ort,
                        person.abholzeit,
                        (person.postleitzahl as string | number) === '' ? null : Number(person.postleitzahl)
                    ]
                );
            }

            await conn.commit();
            conn.release()

            return {
                success: true,
                message: 'Der Schüler wurde erfolgreich bearbeitet.'
            };
        } catch (e) {
            console.log(e)
            await conn.rollback();
            conn.release()
            return {
                success: false,
                message: 'Beim Bearbeiten des Schülers ist ein Fehler aufgetreten.'
            };
        }
    }

    async deleteSchueler(schuelerId: number): Promise<DatabaseMessage> {
        if (!this.connection) {
            return STANDARD_FEHLER
        }

        const conn = await this.connection.getConnection();

        try {
            await conn.beginTransaction();

            await conn.execute(`
                DELETE FROM schueler_allergien_unvertraeglichkeiten
                WHERE schueler_id = ?
            `, [schuelerId]);

            await conn.execute(`
                DELETE FROM schueler_medikamente
                WHERE schueler_id = ?
            `, [schuelerId]);

            await conn.execute(`
                DELETE FROM schueler_abholberechtigte_personen
                WHERE schueler_id = ?
            `, [schuelerId]);

            const [result] = await conn.execute<ResultSetHeader>(`
                DELETE FROM schueler
                WHERE id = ?
            `, [schuelerId]);

            await conn.commit();
            conn.release()

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Kein Schüler mit dieser ID gefunden.'
                };
            }

            return {
                success: true,
                message: 'Der Schüler wurde erfolgreich gelöscht.'
            };
        } catch (e) {
            await conn.rollback();
            conn.release()
            console.error(e);
            return {
                success: false,
                message: 'Beim Löschen des Schülers ist ein Fehler aufgetreten.'
            };
        }
    }

}