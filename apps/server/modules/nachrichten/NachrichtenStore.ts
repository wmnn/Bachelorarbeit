import { Nachricht, NachrichtenTyp, NachrichtErstellenRequestBody } from "@thesis/nachricht"
import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { DatabaseMessage, STANDARD_FEHLER } from "../shared/models";

export class NachrichtenStore {

    private connection: Pool

    constructor(pool: Pool) {
        this.connection = pool
    }

    async getAllNachrichten(typ: number): Promise<any> {
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
                v.inhalt
            FROM nachrichten n
            JOIN nachrichtenversionen v ON n.nachricht_id = v.nachricht_id
            WHERE n.typ = ? AND v.zeitstempel >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            ORDER BY v.zeitstempel DESC
        `, [typ]);

        if (!Array.isArray(rows)) {
            return [];
        }

        return rows.reduce((prev, acc) => {
            if (!prev.find(o => o.id === acc.nachrichtId)) {
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
                zeitstempel: acc.zeitstempel
            });

            return prev;
        }, [] as Nachricht[]);
    }

    async getNachrichten(id: number, typ: number): Promise<any> {
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
                v.inhalt
            FROM nachrichten n
            JOIN nachrichtenversionen v ON n.nachricht_id = v.nachricht_id
            WHERE n.id = ? AND n.typ = ? AND v.zeitstempel >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            ORDER BY v.zeitstempel DESC
        `, [id, typ]);

        if (!Array.isArray(rows)) {
            return [];
        }

        return rows.reduce((prev, acc) => {
            if (!prev.find(o => o.id == acc.nachrichtId)) {
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
                zeitstempel: acc.zeitstempel
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

}