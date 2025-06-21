import { Diagnostik, DiagnostikTyp, Farbbereich } from "@thesis/diagnostik";
import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise"

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
            conn.release();

            return {
                success: true,
                message: 'Die Diagnostik wurde erfolgreich erstellt.'
            };
        } catch (e) {
            console.error(e);
            await conn.rollback();
            conn.release();
            return {
                success: false,
                message: 'Beim Erstellen der Diagnostik ist ein Fehler aufgetreten.'
            };
        }


    }
}