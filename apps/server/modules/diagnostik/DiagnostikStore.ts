import { Auswertungsgruppe, deleteDiagnostik, Diagnostik, DiagnostikTyp, Ergebnis, Farbbereich, Row } from "@thesis/diagnostik";
import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { DatabaseMessage, STANDARD_FEHLER } from "../shared/models";

export class DiagnostikStore {

    private connection: Pool

    constructor(pool: Pool) {
        this.connection = pool
    }

    async getDiagnostik(diagnostikId: number): Promise<Diagnostik | undefined> {
        if (!this.connection) return undefined;

        const conn = this.connection;

        try {
            const [rows] = await conn.execute<RowDataPacket[]>(`
                SELECT id, name, beschreibung, erstellungsdatum, obere_grenze AS obereGrenze, 
                    untere_grenze AS untereGrenze, typ, user_id AS userId, klassen_id AS klasseId, sichtbarkeit
                FROM diagnostikverfahren
                WHERE id = ?
            `, [diagnostikId]);

            if (rows.length === 0) return undefined;

            const diag = rows[0];

            const [geeigneteKlassen, kategorien, farbbereiche, files, geteiltMit, auswertungsgruppen] = await Promise.all([
                this.getDiagnostikKlassenstufen(diag.id),
                this.getDiagnostikKategorien(diag.id),
                this.getDiagnostikFarbbereiche(diag.id),
                this.getDiagnostikFiles(diag.id),
                this.getDiagnostikShared(diag.id),
                this.getAuswertungsgruppen(diag.id)
            ]);

            return {
                id: diag.id,
                name: diag.name,
                beschreibung: diag.beschreibung,
                erstellungsDatum: diag.erstellungsdatum,
                obereGrenze: diag.obereGrenze,
                untereGrenze: diag.untereGrenze,
                speicherTyp: parseInt(diag.typ),
                // userId: diag.userId,
                klasseId: parseInt(diag.klasseId),
                geeigneteKlassen,
                kategorien,
                farbbereiche,
                sichtbarkeit: parseInt(diag.sichtbarkeit),
                files,
                geteiltMit,
                auswertungsgruppen
            };

        } catch (e) {
            console.error('Fehler in getDiagnostik:', e);
            return undefined;
        }
    }

    async getDiagnostikenGeteilt(userId: number) {
        if (!this.connection) {
            return {
                success: false,
                message: 'Keine Datenbankverbindung.',
                data: null
            };
        }
        const conn = this.connection;

        try {
            const [rows] = await conn.execute<RowDataPacket[]>(`
                SELECT diagnostikverfahren_id FROM diagnostikverfahren_geteilt
                WHERE user_id = ?
            `, [userId]);

            let data = rows.map(row => parseInt(row.diagnostikverfahren_id)) as number[];

            return {
                success: true,
                message: '',
                data,
            };

        } catch (e) {
            console.error('Fehler in getDiagnostiken:', e);
            return {
                success: false,
                message: 'Fehler beim Abrufen der Diagnostiken.',
                data: null
            };
        }

    }
    async getDiagnostiken(speicherTyp: Diagnostik['speicherTyp']) {
        if (!this.connection) {
            return {
                success: false,
                message: 'Keine Datenbankverbindung.',
                data: null
            };
        }

        const conn = this.connection;

        try {
            const [rows] = await conn.execute<RowDataPacket[]>(`
                SELECT id, name, beschreibung, erstellungsdatum, obere_grenze AS obereGrenze, 
                    untere_grenze AS untereGrenze, typ, user_id AS userId, klassen_id AS klasseId, sichtbarkeit
                FROM diagnostikverfahren
                WHERE typ = ?
            `, [speicherTyp]);

            const result: Diagnostik[] = [];

            for (const diag of rows) {
                const [geeigneteKlassen, kategorien, farbbereiche, files, auswertungsgruppen] = await Promise.all([
                    this.getDiagnostikKlassenstufen(diag.id),
                    this.getDiagnostikKategorien(diag.id),
                    this.getDiagnostikFarbbereiche(diag.id),
                    this.getDiagnostikFiles(diag.id),
                    this.getAuswertungsgruppen(diag.id)
                ]);

                result.push({
                    id: diag.id,
                    name: diag.name,
                    beschreibung: diag.beschreibung,
                    erstellungsDatum: diag.erstellungsdatum,
                    obereGrenze: parseInt(diag.obereGrenze),
                    untereGrenze: diag.untereGrenze,
                    speicherTyp: parseInt(diag.typ),
                    userId: diag.userId,
                    klasseId: parseInt(diag.klasseId),
                    geeigneteKlassen,
                    kategorien,
                    farbbereiche,
                    sichtbarkeit: parseInt(diag.sichtbarkeit),
                    files,
                    auswertungsgruppen
                });
            }

            return {
                success: true,
                message: 'Diagnostiken erfolgreich abgerufen.',
                data: result
            };

        } catch (e) {
            console.error('Fehler in getDiagnostiken:', e);
            return {
                success: false,
                message: 'Fehler beim Abrufen der Diagnostiken.',
                data: null
            };
        }
    }

    private async getDiagnostikShared(diagnostikId: number): Promise<number[]> {
        const [rows] = await this.connection!.execute<RowDataPacket[]>(`
            SELECT user_id FROM diagnostikverfahren_geteilt
            WHERE diagnostikverfahren_id = ?
        `, [diagnostikId]);

        return rows.map(row => parseInt(row.user_id));
    }

    private async getDiagnostikFiles(diagnostikId: number): Promise<string[]> {
        const [rows] = await this.connection!.execute<RowDataPacket[]>(`
            SELECT datei FROM diagnostikverfahren_dateien
            WHERE diagnostikverfahren_id = ?
        `, [diagnostikId]);

        return rows.map(row => row.datei);
    }

    private async getDiagnostikKlassenstufen(diagnostikId: number): Promise<string[]> {
        const [rows] = await this.connection!.execute<RowDataPacket[]>(`
            SELECT klassenstufe FROM diagnostikverfahren_klassenstufen 
            WHERE diagnostikverfahren_id = ?
        `, [diagnostikId]);

        return rows.map(row => row.klassenstufe);
    }

    private async getAuswertungsgruppen(diagnostikId: number): Promise<Auswertungsgruppe[]> {
        const [rows] = await this.connection!.execute<RowDataPacket[]>(`
            SELECT auswertungsgruppe, schueler_id
            FROM diagnostikverfahren_auswertungsgruppe
            WHERE diagnostikverfahren_id = ?
        `, [diagnostikId]);

        const map = new Map<string, number[]>();

        for (const row of rows) {
            const gruppe = row.auswertungsgruppe;
            const schuelerId = row.schueler_id;

            if (!map.has(gruppe)) {
                map.set(gruppe, []);
            }
            map.get(gruppe)!.push(schuelerId);
        }

        return Array.from(map.entries()).map(([name, schuelerIds]) => ({
            name,
            schuelerIds,
        }));
    }

    private async getDiagnostikKategorien(diagnostikId: number): Promise<string[]> {
        const [rows] = await this.connection!.execute<RowDataPacket[]>(`
            SELECT kategorie FROM diagnostikverfahren_kategorien 
            WHERE diagnostikverfahren_id = ?
        `, [diagnostikId]);

        return rows.map(row => row.kategorie);
    }

    private async getDiagnostikFarbbereiche(diagnostikId: number): Promise<Farbbereich[]> {
        const [rows] = await this.connection!.execute<RowDataPacket[]>(`
            SELECT hex_farbe AS hexFarbe, obere_grenze AS obereGrenze 
            FROM diagnostikverfahren_farbbereiche 
            WHERE diagnostikverfahren_id = ?
        `, [diagnostikId]);

        return rows.map(row => {
            const obereGrenze = row.obereGrenze
            return {
                hexFarbe: row.hexFarbe,
                obereGrenze: obereGrenze ?? undefined
            }
        });
    }

    async updateAuswertungsgruppen(
        diagnostikId: number,
        auswertungsgruppen: Auswertungsgruppe[]
    ) {
        if (!this.connection) return STANDARD_FEHLER;

        const conn = await this.connection.getConnection();

        try {
            await conn.beginTransaction();

            await conn.execute(`DELETE FROM diagnostikverfahren_auswertungsgruppe WHERE diagnostikverfahren_id = ?`,
                [diagnostikId]
            );

            const values: any[] = [];
            const placeholders: string[] = [];

            for (const gruppe of auswertungsgruppen) {
                for (const schuelerId of gruppe.schuelerIds) {
                    values.push(diagnostikId, gruppe.name, schuelerId);
                    placeholders.push(`(?, ?, ?)`);
                }
            }

            if (values.length > 0) {
                await conn.execute(
                    `INSERT INTO diagnostikverfahren_auswertungsgruppe (diagnostikverfahren_id, auswertungsgruppe, schueler_id) VALUES ${placeholders.join(', ')}`,
                    values
                );
            }

            await conn.commit();

            return {
                success: true,
                message: 'Die Auswertungsgruppen wurden erfolgreich aktualisiert.'
            };
        } catch (error) {
            console.error('Fehler beim Aktualisieren der Auswertungsgruppen:', error);
            await conn.rollback();
            return STANDARD_FEHLER;
        } finally {
            conn.release();
        }
    }

    async createDiagnostik(userId: number, diagnostik: Diagnostik) {
        if (!this.connection) {
            return {
                success: false,
                message: 'Keine Datenbankverbindung.'
            };
        }
        const conn = await this.connection.getConnection();

        try {
            await conn.beginTransaction();

            let { name, beschreibung, obereGrenze, untereGrenze, klasseId, speicherTyp } = diagnostik
            if (diagnostik.erstellungsTyp === 'benutzerdefiniert') {

            }
            
            const [result] = await conn.execute<ResultSetHeader>(`
                INSERT INTO diagnostikverfahren (name, beschreibung, erstellungsdatum, obere_grenze, untere_grenze, typ, user_id, klassen_id, sichtbarkeit) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [name, beschreibung, new Date().toISOString().split('T')[0], obereGrenze, untereGrenze, speicherTyp, userId, klasseId, diagnostik.sichtbarkeit ?? null]);

            const id = result.insertId;

            for (const element of diagnostik.geeigneteKlassen || []) {
                await conn.execute(`
                    INSERT INTO diagnostikverfahren_klassenstufen (diagnostikverfahren_id, klassenstufe)
                    VALUES (?, ?)
                `, [id, element]);
            }

            for (const element of diagnostik.kategorien || []) {
                await conn.execute(`
                    INSERT INTO diagnostikverfahren_kategorien (diagnostikverfahren_id, kategorie)
                    VALUES (?, ?)
                `, [id, element]);
            }    
            
            for (const element of diagnostik.farbbereiche || []) {
                await conn.execute(`
                    INSERT INTO diagnostikverfahren_farbbereiche (diagnostikverfahren_id, hex_farbe, obere_grenze)
                    VALUES (?, ?, ?)
                `, [id, element.hexFarbe, element.obereGrenze ?? null]);
            }    

            for (const path of diagnostik.files || []) {
                await conn.execute(`
                    INSERT INTO diagnostikverfahren_dateien (diagnostikverfahren_id, datei)
                    VALUES (?, ?)
                `, [id, path]);
            }    

            await conn.commit();

            return {
                diagnostikId: id,
                success: true,
                message: 'Die Diagnostik wurde erfolgreich erstellt.'
            };
        } catch (e) {
            console.error(e);
            await conn.rollback();
            return {
                success: false,
                message: 'Beim Erstellen der Diagnostik ist ein Fehler aufgetreten.'
            };
        } finally {
            conn.release();
        }
    }

    async editDiagnostik(userId: number, diagnostik: Diagnostik) {
        if (!this.connection) {
            return STANDARD_FEHLER
        }

        const conn = await this.connection.getConnection();

        try {
            await conn.beginTransaction();

            const { id, name, beschreibung, obereGrenze, untereGrenze, klasseId, speicherTyp } = diagnostik;

            await conn.execute(`
                UPDATE diagnostikverfahren
                SET name = ?, beschreibung = ?, obere_grenze = ?, untere_grenze = ?, typ = ?, klassen_id = ?
                WHERE id = ? AND user_id = ?
            `, [name, beschreibung, obereGrenze, untereGrenze, speicherTyp, klasseId, id, userId]);

            await conn.execute(`DELETE FROM diagnostikverfahren_klassenstufen WHERE diagnostikverfahren_id = ?`, [id]);
            await conn.execute(`DELETE FROM diagnostikverfahren_kategorien WHERE diagnostikverfahren_id = ?`, [id]);
            await conn.execute(`DELETE FROM diagnostikverfahren_farbbereiche WHERE diagnostikverfahren_id = ?`, [id]);
            await conn.execute(`DELETE FROM diagnostikverfahren_dateien WHERE diagnostikverfahren_id = ?`, [id]);
            await conn.execute(`DELETE FROM diagnostikverfahren_geteilt WHERE diagnostikverfahren_id = ?`, [id]);

            for (const element of diagnostik.geeigneteKlassen || []) {
                await conn.execute(`
                    INSERT INTO diagnostikverfahren_klassenstufen (diagnostikverfahren_id, klassenstufe)
                    VALUES (?, ?)
                `, [id, element]);
            }

            for (const element of diagnostik.kategorien || []) {
                await conn.execute(`
                    INSERT INTO diagnostikverfahren_kategorien (diagnostikverfahren_id, kategorie)
                    VALUES (?, ?)
                `, [id, element]);
            }

            for (const element of diagnostik.files || []) {
                await conn.execute(`
                    INSERT INTO diagnostikverfahren_dateien (diagnostikverfahren_id, datei)
                    VALUES (?, ?)
                `, [id, element]);
            }

            for (const element of diagnostik.geteiltMit || []) {
                await conn.execute(`
                    INSERT INTO diagnostikverfahren_geteilt (diagnostikverfahren_id, user_id)
                    VALUES (?, ?)
                `, [id, element]);
            }

            for (const element of diagnostik.farbbereiche || []) {
                let { obereGrenze } = element
                obereGrenze = (obereGrenze ?? null) as any
                obereGrenze = (obereGrenze == '' ? null : obereGrenze) as any
                await conn.execute(`
                    INSERT INTO diagnostikverfahren_farbbereiche (diagnostikverfahren_id, hex_farbe, obere_grenze)
                    VALUES (?, ?, ?)
                `, [id, element.hexFarbe, obereGrenze]);
            }

            await conn.commit();

            return {
                success: true,
                message: 'Die Diagnostik wurde erfolgreich aktualisiert.'
            };
        } catch (e) {
            console.error(e);
            await conn.rollback();
            return {
                success: false,
                message: 'Beim Aktualisieren der Diagnostik ist ein Fehler aufgetreten.'
            };
        } finally {
            conn.release();
        }
    }

    async updateSichtbarkeit(diagnostikId: number, sichtbarkeit: number) {
        if (!this.connection) {
            return STANDARD_FEHLER
        }

        const conn = await this.connection.getConnection();

        try {
            await conn.execute(`
                UPDATE diagnostikverfahren
                SET sichtbarkeit = ?
                WHERE id = ?
            `, [sichtbarkeit, diagnostikId]);

            return {
                success: true,
                message: 'Die Sichtbarkeit wurde erfolgreich aktualisiert.'
            };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                message: 'Fehler beim Aktualisieren der Sichtbarkeit.'
            };
        } finally {
            conn.release();
        }
    }

    async copyErgebnisse(prevDiagnostikId: number, targetDiagnostikId: number) {
        if (!this.connection) return STANDARD_FEHLER;

        const conn = await this.connection.getConnection();
        try {
            await conn.beginTransaction();

            // Fix: Add `= ?` to WHERE clause
            const [rows] = await conn.execute<any[]>(`
                SELECT datum, schueler_id, ergebnis FROM diagnostikverfahren_ergebnisse 
                WHERE diagnostikverfahren_id = ?
            `, [prevDiagnostikId]);

            if (!Array.isArray(rows) || rows.length === 0) {
                await conn.rollback();
                return {
                    success: false,
                    message: 'Keine Ergebnisse zum Kopieren gefunden.'
                };
            }

            const values: any[] = [];
            const placeholders = rows.map(row => {
                values.push(targetDiagnostikId, row.datum, row.schueler_id, row.ergebnis);
                return "(?, ?, ?, ?)";
            }).join(", ");

            await conn.execute(`
                INSERT INTO diagnostikverfahren_ergebnisse 
                    (diagnostikverfahren_id, datum, schueler_id, ergebnis)
                VALUES ${placeholders}
            `, values);

            await conn.commit();

            return {
                success: true,
                message: 'Die Ergebnisse wurden erfolgreich kopiert.'
            };

        } catch (e) {
            console.error("Fehler beim Kopieren der Ergebnisse:", e);
            await conn.rollback();
            return STANDARD_FEHLER;
        } finally {
            conn.release();
        }
    }

    async addErgebnisse(ergebnisse: Ergebnis[], diagnostikId: number, datum: string): Promise<DatabaseMessage> {
        if (!this.connection) return STANDARD_FEHLER;

        const conn = await this.connection.getConnection();

        try {
            await conn.beginTransaction();

            const values: any[] = [];
            const placeholders = ergebnisse.map(ergebnis => {
                values.push(diagnostikId, datum, ergebnis.schuelerId, ergebnis.ergebnis);
                return "(?, ?, ?, ?)";
            }).join(", ");

            const sql = `
                INSERT INTO diagnostikverfahren_ergebnisse 
                    (diagnostikverfahren_id, datum, schueler_id, ergebnis)
                VALUES ${placeholders}
                ON DUPLICATE KEY UPDATE
                    ergebnis = VALUES(ergebnis)
            `;

            await conn.execute(sql, values);
            await conn.commit();

            return {
                success: true,
                message: 'Die Ergebnisse wurden erfolgreich aktualisiert.'
            };

        } catch (e) {
            console.error('Fehler in addErgebnisse:', e);
            await conn.rollback();
            return STANDARD_FEHLER;

        } finally {
            conn.release();
        }
    }

    async getErgebnisse(diagnostikId: number): Promise<Row[] | DatabaseMessage> {
        if (!this.connection) return STANDARD_FEHLER;

        const conn = await this.connection.getConnection();

        try {
            const [rows] = await conn.execute(
                `
                    SELECT schueler_id as schuelerId, ergebnis, datum
                    FROM diagnostikverfahren_ergebnisse
                    WHERE diagnostikverfahren_id = ?
                    ORDER BY datum ASC, schueler_id ASC
                `,
                [diagnostikId]
            );

            const res = (rows as Ergebnis[]).reduce((prev, acc) => {
                const isSchuelerInside = prev.some(o => o.schuelerId === acc.schuelerId)
                if (!isSchuelerInside) {
                    prev.push({
                        schuelerId: acc.schuelerId,
                        ergebnisse: []
                    })
                }
                return prev.map(obj => {
                    if (obj.schuelerId !== acc.schuelerId) {
                        return obj
                    }
                    return {
                        ...obj,
                        ergebnisse: [...obj.ergebnisse, acc]
                    }
                })
            }, [] as Row[])

            return res

        } catch (e) {
            console.error('Fehler in getErgebnisse:', e);
            return STANDARD_FEHLER;
        } finally {
            conn.release();
        }
    }
    
    async deleteDiagnostik(diagnostikId: string): Promise<DatabaseMessage> {
        if (!this.connection) {
            return STANDARD_FEHLER
        }

        const conn = await this.connection.getConnection();

        try {
            await conn.beginTransaction();

            await conn.execute(`
                DELETE FROM diagnostikverfahren_klassenstufen WHERE diagnostikverfahren_id = ?
            `, [diagnostikId]);

            await conn.execute(`
                DELETE FROM diagnostikverfahren_kategorien WHERE diagnostikverfahren_id = ?
            `, [diagnostikId]);

            await conn.execute(`
                DELETE FROM diagnostikverfahren_farbbereiche WHERE diagnostikverfahren_id = ?
            `, [diagnostikId]);

            const [result] = await conn.execute<ResultSetHeader>(`
                DELETE FROM diagnostikverfahren WHERE id = ?
            `, [diagnostikId]);

            if (result.affectedRows === 0) {
                await conn.rollback();
                return {
                    success: false,
                    message: 'Das Diagnostikverfahren wurde nicht gefunden.'
                };
            }

            await conn.commit();

            return {
                success: true,
                message: 'Das Diagnostikverfahren wurde erfolgreich gelöscht.'
            };
        } catch (e) {
            console.error(e);
            await conn.rollback();
            return {
                success: false,
                message: 'Beim Löschen der Diagnostik ist ein Fehler aufgetreten.'
            };
        } finally {
            conn.release();
        }
    }


}