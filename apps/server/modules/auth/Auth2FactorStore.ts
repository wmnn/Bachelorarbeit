import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { DatabaseMessage, STANDARD_FEHLER } from "../shared/models";

export class Auth2FactorStore {

    private connection: Pool;

    constructor(pool: Pool) {
        this.connection = pool;
    }

    async get2FaktorData(userId: number): Promise<{
        success: boolean,
        message: string,
        data?: {
            userId: number,
            secret: string,
            tmpSecret: string
        }
    }> {
        if (!this.connection) {
            return STANDARD_FEHLER;
        }

        try {
            const [rows] = await this.connection.execute<RowDataPacket[]>(
                'SELECT * FROM users_2_factor_authentication WHERE user_id = ?',
                [userId]
            );

            if (rows.length === 0) {
                return STANDARD_FEHLER
            }

            const row = rows[0];
            return {
                success: true,
                message: 'Die Query war erfolgreich.',
                data: {
                    userId: row.user_id,
                    secret: row.secret,
                    tmpSecret: row.tmp
                }
            };

        } catch (err) {
            console.error(err);
            return STANDARD_FEHLER
        }
    }

    async setTmpSecret(userId: number, tmpSecret: string): Promise<DatabaseMessage> {
        if (!this.connection) {
            return STANDARD_FEHLER;
        }

        try {
            const [result] = await this.connection.execute<ResultSetHeader>(
                `INSERT INTO users_2_factor_authentication (user_id, tmp)
                 VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE tmp = VALUES(tmp)`,
                [userId, tmpSecret]
            );

            return {
                success: true,
                message: 'Der temporäre Schlüssel wurde erfolgreich gespeichert.'
            };
        } catch (err) {
            console.error(err);
            return STANDARD_FEHLER
        }
    }

    async setSecret(userId: number): Promise<{
        success: boolean,
        message: string
    }> {
        if (!this.connection) {
            return STANDARD_FEHLER;
        }

        try {
            const [result] = await this.connection.execute<ResultSetHeader>(
                `UPDATE users_2_factor_authentication
                 SET secret = tmp, tmp = NULL
                 WHERE user_id = ?`,
                [userId]
            );

            if (result.affectedRows === 0) {
                return STANDARD_FEHLER
            }

            return {
                success: true,
                message: 'Der Schlüssel wurde erfolgreich gesetzt.'
            };
        } catch (err) {
            console.error(err);
            return STANDARD_FEHLER
        }
    }
}