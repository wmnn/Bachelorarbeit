import { Lesestatus, Nachricht, NachrichtenTyp, NachrichtErstellenRequestBody } from "@thesis/nachricht"
import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { DatabaseMessage, STANDARD_FEHLER } from "../shared/models";

export class NachrichtenStore {

    private connection: Pool

    constructor(pool: Pool) {
        this.connection = pool
    }

    async getAllNachrichten(typ: number, userId: number): Promise<any> {
        if (!this.connection) {
            return [];
        }

        const conn = this.connection;

        const [rows] = await conn.execute<RowDataPacket[]>(`
            SELECT 
                n.nachricht_id as nachrichtId,
                n.user_id as userId,
                n.typ as typ,
                n.id,
                v.zeitstempel,
                v.inhalt,
                v.nachrichtenversion_id as nachrichtenversionId,
                (SELECT lesestatus FROM nachrichtenlesestatus l WHERE l.nachrichtenversion_id = v.nachrichtenversion_id AND l.user_id = ?) as lesestatus
            FROM nachrichten n
            JOIN nachrichtenversionen v ON n.nachricht_id = v.nachricht_id
            WHERE n.typ = ? AND v.zeitstempel >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            ORDER BY v.nachrichtenversion_id DESC
        `, [userId, typ]);

        if (!Array.isArray(rows)) {
            return [];
        }

        return rows.reduce((prev, acc) => {
            if (!prev.find(o => o.nachrichtId === acc.nachrichtId)) {
                prev.push({
                    nachrichtId: acc.nachrichtId,
                    id: acc.id,
                    userId: acc.userId,
                    typ: acc.typ,
                    versionen: [],
                });
            }

            const element = prev.find(o => o.nachrichtId === acc.nachrichtId);
            element?.versionen.push({
                inhalt: acc.inhalt,
                zeitstempel: acc.zeitstempel,
                lesestatus: acc.lesestatus ?? undefined,
                nachrichtenversionId: acc.nachrichtenversionId
            });

            return prev;
        }, [] as Nachricht[]);
    }

    async getNachrichten(id: number, typ: number, userId: number): Promise<any> {
        if (!this.connection) {
            return []
        }

        const conn = this.connection;

        const [rows] = await conn.execute<RowDataPacket[]>(`
            SELECT 
                n.nachricht_id as nachrichtId,
                n.user_id as userId,
                n.typ as typ,
                n.id,
                v.zeitstempel,
                v.inhalt,
                v.nachrichtenversion_id as nachrichtenversionId,
                (SELECT lesestatus FROM nachrichtenlesestatus l WHERE l.nachrichtenversion_id = v.nachrichtenversion_id AND l.user_id = ?) as lesestatus
            FROM nachrichten n
            JOIN nachrichtenversionen v ON n.nachricht_id = v.nachricht_id
            WHERE n.id = ? AND n.typ = ? AND v.zeitstempel >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            ORDER BY v.nachrichtenversion_id DESC
        `, [userId, id, typ]);

        if (!Array.isArray(rows)) {
            return [];
        }

        return rows.reduce((prev, acc) => {
            if (!prev.find(o => o.nachrichtId == acc.nachrichtId)) {
                prev.push({
                    nachrichtId: acc.nachrichtId,
                    id: acc.id,
                    userId: acc.userId,
                    versionen: [],
                    typ: acc.typ,
                    
                })
            }
            const element = prev.find(o => o.nachrichtId == acc.nachrichtId);
            element?.versionen.push({
                inhalt: acc.inhalt,
                zeitstempel: acc.zeitstempel,
                lesestatus: acc.lesestatus ?? undefined,
                nachrichtenversionId: acc.nachrichtenversionId
            })

            return prev
        }, [] as Nachricht[])
    }

    async nachrichtErstellen(userId: number, typ: NachrichtenTyp, inhalt: string, id: number): Promise<DatabaseMessage> {
        if (!this.connection) {
            return STANDARD_FEHLER
        }

        const conn = await this.connection.getConnection();
        try {
            await conn.beginTransaction();

            const [versionResult] =  await conn.execute<ResultSetHeader>(`
                INSERT INTO nachrichten (user_id, typ, id)
                VALUES (?, ?, ?)
            `, [userId, typ, id]);

            const nachrichtenId = versionResult.insertId;

            await conn.execute<ResultSetHeader>(`
                INSERT INTO nachrichtenversionen (nachricht_id, zeitstempel, inhalt)
                VALUES (?, CURDATE(), ?)
            `, [nachrichtenId, inhalt]);
            

            await conn.commit();

            return {
                success: true,
                message: 'Die Nachricht wurde erfolgreich erstellt.'
            };
        } catch (error) {
            console.error('Fehler beim Erstellen der Nachricht:', error);
            await conn.rollback();

            return {
                success: false,
                message: 'Fehler beim Erstellen der Nachricht.'
            };
        } finally {
            conn.release()
        }
    }

    async nachrichtBearbeiten(nachrichtId: number, inhalt: string): Promise<DatabaseMessage> {
        if (!this.connection) {
            return STANDARD_FEHLER
        }

        const conn = await this.connection.getConnection();
        try {
            await conn.beginTransaction();


            await conn.execute<ResultSetHeader>(`
                INSERT INTO nachrichtenversionen (nachricht_id, zeitstempel, inhalt)
                VALUES (?, CURDATE(), ?)
            `, [nachrichtId, inhalt]);
            

            await conn.commit();

            return {
                success: true,
                message: 'Die Nachricht wurde erfolgreich bearbeitet.'
            };
        } catch (error) {
            console.error('Fehler beim Bearbeiten der Nachricht:', error);
            await conn.rollback();

            return {
                success: false,
                message: 'Fehler beim Bearbeiten der Nachricht.'
            };
        } finally {
            conn.release()
        }
    }

    async nachrichtLoeschen(nachrichtId: number): Promise<DatabaseMessage> {
        if (!this.connection) {
            return STANDARD_FEHLER
        }

        const conn = await this.connection.getConnection();
        try {
            await conn.beginTransaction();

            await conn.execute(`
                DELETE FROM nachrichten WHERE nachricht_id = ?
            `, [nachrichtId]);

            const [versionReferences] = await conn.execute<RowDataPacket[]>(`
                SELECT COUNT(*) as count FROM nachrichten WHERE nachricht_id = ?
            `, [nachrichtId]);

            const refCount = versionReferences[0].count;

            if (refCount === 0) {
                await conn.execute(`
                    DELETE FROM nachrichtenversionen WHERE nachricht_id = ?
                `, [nachrichtId]);
            }

            await conn.commit();

            return {
                success: true,
                message: 'Die Nachricht wurde erfolgreich gelöscht.'
            };
        } catch (error) {
            console.error('Fehler beim Löschen der Nachricht:', error);
            await conn.rollback();

            return {
                success: false,
                message: 'Fehler beim Löschen der Nachricht.'
            };
        } finally {
            conn.release()
        }
    }


    async nachrichtenVorlagenSpeichern(klassenVorlagen: string[], schuelerVorlagen: string[]): Promise<DatabaseMessage> {
        if (!this.connection) {
            return STANDARD_FEHLER;
        }

        const conn = await this.connection.getConnection();

        try {
            await conn.beginTransaction();
            await conn.execute(`DELETE FROM nachrichtenvorlagen`);

            for (const inhalt of klassenVorlagen) {
                await conn.execute(`
                    INSERT INTO nachrichtenvorlagen (typ, inhalt)
                    VALUES (?, ?)
                `, [NachrichtenTyp.KLASSE, inhalt]);
            }

            for (const inhalt of schuelerVorlagen) {
                await conn.execute(`
                    INSERT INTO nachrichtenvorlagen (typ, inhalt)
                    VALUES (?, ?)
                `, [NachrichtenTyp.SCHÜLER, inhalt]);
            }

            await conn.commit();
            
            return {
                success: true,
                message: 'Die Nachrichtenvorlagen wurden erfolgreich gespeichert.'
            };
        } catch (error) {
            console.error('Fehler beim Speichern der Vorlagen:', error);
            await conn.rollback();

            return {
                success: false,
                message: 'Fehler beim Speichern der Nachrichtenvorlagen.'
            };
        } finally {
            conn.release();
        }
    }
    async getNachrichtenVorlagen(typ: NachrichtenTyp): Promise<string[]> {
        if (!this.connection) {
            return [];
        }

        const conn = this.connection;

        try {
            const [rows] = await conn.execute<RowDataPacket[]>(`
                SELECT inhalt 
                FROM nachrichtenvorlagen
                WHERE typ = ?
                ORDER BY nachricht_id ASC
            `, [typ]);

            if (!Array.isArray(rows)) {
                return [];
            }

            return rows.map(row => row.inhalt as string);
        } catch (error) {
            console.error('Fehler beim Laden der Nachrichtenvorlagen:', error);
            return [];
        }
    }

    async updateLesestatus(ids: number[], userId: number) {
        if (!this.connection) {
            return false;
        }

        const conn = this.connection;

        try {
            const placeholders = ids.map(() => `(?, ?, ?)`).join(', ');
            const values = ids.flatMap(id => [id, userId, Lesestatus.GELESEN]);

            const [result] = await conn.execute(`
                INSERT INTO nachrichtenlesestatus (nachrichtenversion_id, user_id, lesestatus)
                VALUES ${placeholders}
                ON DUPLICATE KEY UPDATE lesestatus = VALUES(lesestatus)
            `, values);

            return true;
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Lesestatus:', error);
            return false;
        }
    }


}