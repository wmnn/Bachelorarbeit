import { Diagnostik, DiagnostikTyp, Ergebnis, Farbbereich, Row } from "@thesis/diagnostik";
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
                    untere_grenze AS untereGrenze, typ, user_id AS userId, klassen_id AS klasseId
                FROM diagnostikverfahren
                WHERE id = ?
            `, [diagnostikId]);

            if (rows.length === 0) return undefined;

            const diag = rows[0];

            const [geeigneteKlassen, kategorien, farbbereiche] = await Promise.all([
                this.getDiagnostikKlassenstufen(diag.id),
                this.getDiagnostikKategorien(diag.id),
                this.getDiagnostikFarbbereiche(diag.id)
            ]);

            return {
                id: diag.id,
                name: diag.name,
                beschreibung: diag.beschreibung,
                // erstellungsdatum: diag.erstellungsdatum,
                obereGrenze: diag.obereGrenze,
                untereGrenze: diag.untereGrenze,
                speicherTyp: diag.typ,
                // userId: diag.userId,
                klasseId: diag.klasseId,
                geeigneteKlassen,
                kategorien,
                farbbereiche
            };

        } catch (e) {
            console.error('Fehler in getDiagnostik:', e);
            return undefined;
        }
    }
    async getDiagnostiken() {
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
                    untere_grenze AS untereGrenze, typ, user_id AS userId, klassen_id AS klasseId
                FROM diagnostikverfahren
            `);

            const result: Diagnostik[] = [];

            for (const diag of rows) {
                const [geeigneteKlassen, kategorien, farbbereiche] = await Promise.all([
                    this.getDiagnostikKlassenstufen(diag.id),
                    this.getDiagnostikKategorien(diag.id),
                    this.getDiagnostikFarbbereiche(diag.id)
                ]);

                result.push({
                    id: diag.id,
                    name: diag.name,
                    beschreibung: diag.beschreibung,
                    // erstellungsdatum: diag.erstellungsdatum,
                    obereGrenze: diag.obereGrenze,
                    untereGrenze: diag.untereGrenze,
                    speicherTyp: diag.typ,
                    userId: diag.userId,
                    klasseId: diag.klasseId,
                    geeigneteKlassen,
                    kategorien,
                    farbbereiche
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
    private async getDiagnostikKlassenstufen(diagnostikId: number): Promise<string[]> {
        const [rows] = await this.connection!.execute<RowDataPacket[]>(`
            SELECT klassenstufe FROM diagnostikverfahren_klassenstufen 
            WHERE diagnostikverfahren_id = ?
        `, [diagnostikId]);

        return rows.map(row => row.klassenstufe);
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

        return rows.map(row => ({
            hexFarbe: row.hexFarbe,
            obereGrenze: row.obereGrenze ?? null
        }));
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

            let { name, beschreibung, obereGrenze, untereGrenze, klasseId } = diagnostik
            if (diagnostik.erstellungsTyp === 'benutzerdefiniert') {

            }
            
            const [result] = await conn.execute<ResultSetHeader>(`
                INSERT INTO diagnostikverfahren (name, beschreibung, erstellungsdatum, obere_grenze, untere_grenze, typ, user_id, klassen_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [name, beschreibung, new Date().toISOString().split('T')[0],obereGrenze, untereGrenze, DiagnostikTyp.LAUFENDES_VERFAHREN, userId, klasseId]);

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

            await conn.commit();

            return {
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

    async addErgebnisse(ergebnisse: Ergebnis[], diagnostikId: number, datum: string): Promise<DatabaseMessage> {
        if (!this.connection) return STANDARD_FEHLER;

        const conn = await this.connection.getConnection();

        try {
            await conn.beginTransaction();

            // Prepare values and flatten for parameter binding
            const values: any[] = [];
            const placeholders = ergebnisse.map(ergebnis => {
                values.push(diagnostikId, datum, ergebnis.schuelerId, ergebnis.ergebnis);
                return "(?, ?, ?, ?)";
            }).join(", ");

            const sql = `
                INSERT INTO diagnostikverfahren_ergebnisse (diagnostikverfahren_id, datum, schueler_id, ergebnis)
                VALUES ${placeholders}
            `;

            await conn.execute(sql, values);
            await conn.commit();

            return {
                success: true,
                message: 'Die Ergebnisse wurden erfolgreich hinzugefügt.'
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
                    ORDER BY datum DESC, schueler_id
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

            // return (rows as any[]).map(row => ({
            //     schuelerId: row.schueler_id,
            //     ergebnis: row.ergebnis,
            //     datum: row.datum
            // }));

        } catch (e) {
            console.error('Fehler in getErgebnisse:', e);
            return STANDARD_FEHLER;
        } finally {
            conn.release();
        }
    }

}