import { Anwesenheitsstatus, Anwesenheitstyp } from "@thesis/anwesenheiten";
import { Schuljahr } from "@thesis/schule";
import { Pool, ResultSetHeader } from "mysql2/promise"
import { DatabaseMessage, STANDARD_FEHLER } from "../shared/models";

export class AnwesenheitenStore {

    private connection: Pool

    constructor(pool: Pool) {
        this.connection = pool
    }

    async getAnwesenheiten(
        schuelerId: number,
        schuljahr: Schuljahr,
        typ: Anwesenheitstyp
    ) {
        if (!this.connection) {
            return [];
        }

        const conn = this.connection;

        const schuljahrStart = `20${schuljahr.split('/')[0]}-08-01`
        const schuljahrEnde = `20${schuljahr.split('/')[1]}-07-31`
        const [rows] = await conn.execute<ResultSetHeader>(
            `
            SELECT datum, typ, status 
            FROM anwesenheitsstatus
            WHERE schueler_id = ? AND datum BETWEEN ? AND ? AND typ = ?
            ORDER BY datum ASC
            `,
            [schuelerId, schuljahrStart, schuljahrEnde, typ]
        );
        return rows;
    }
    async updateAnwesenheitsstatus(
        schuelerId: number,
        typ: Anwesenheitstyp,
        status: Anwesenheitsstatus,
        startDatum: string,
        endDatum: string
    ): Promise<DatabaseMessage> {
        if (!this.connection) {
            return STANDARD_FEHLER
        }

        const conn = this.connection;

        try {
            const dates: string[] = [];
            const current = new Date(startDatum);
            const endDate = new Date(endDatum);

            while (current <= endDate) {
                dates.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }

            for (const datum of dates) {
                const [result] = await conn.execute<ResultSetHeader>(
                `
                INSERT INTO anwesenheitsstatus (schueler_id, datum, status, typ)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    status = VALUES(status),
                    typ = VALUES(typ)
                `,
                [schuelerId, datum, status, typ]
                );
            }
            

            return {
                success: true,
                message: 'Anwesenheitsstatus erfolgreich gesetzt.'
            };
        } catch (e) {
            console.error('Fehler beim Aktualisieren:', e);
            return {
            success: false,
            message: 'Ein Fehler ist beim Aktualisieren aufgetreten.',
            };
        }
    }

    async deleteAnwesenheitsstatus(
        schuelerId: number,
        typ: Anwesenheitstyp,
        datum: string
    ): Promise<DatabaseMessage> {
        if (!this.connection) {
            return STANDARD_FEHLER;
        }

        const conn = this.connection;

        try {
            const [result] = await conn.execute<ResultSetHeader>(
                `
                DELETE FROM anwesenheitsstatus
                WHERE schueler_id = ? AND typ = ? AND datum = ?
                `,
                [schuelerId, typ, datum]
            );

            const affected = result.affectedRows;

            return {
                success: affected > 0,
                message: affected > 0
                    ? 'Anwesenheitsstatus erfolgreich gelöscht.'
                    : 'Kein passender Eintrag gefunden.',
            };
        } catch (e) {
            console.error('Fehler beim Löschen:', e);
            return {
                success: false,
                message: 'Ein Fehler ist beim Löschen aufgetreten.',
            };
        }
    }
}