import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { DatabaseMessage, STANDARD_FEHLER } from "../shared/models";
import { User } from "@thesis/auth";
import { Rolle } from "@thesis/rollen";
import { SessionData } from "./authApi";
import crypto from 'crypto';

export class AuthStore {

    private connection: Pool

    constructor(pool: Pool) {
        this.connection = pool
    }

    async findUser(email: string, password: string): Promise<undefined | User> {
        if (!this.connection) {
            return undefined;
        }

        const [rows] = await this.connection.execute(
            'SELECT * FROM users WHERE email = ? AND passwort = ?',
            [email, this.createHash(password)]
        );

        if (!Array.isArray(rows)) {
            return undefined;
        } 

        if (rows.length !== 1) {
            return undefined;
        }
        const result: any = rows[0]
        const user: User = {
            id: result.id,
            email: result.email,
            vorname: result.vorname,
            nachname: result.nachname,
            rolle: result.rolle,
            isVerified: result.is_verified,
            isLocked: result.is_locked
        }

        return user;
    }

    async getUser(email: string): Promise<undefined | User> {
        if (!this.connection) {
            return undefined;
        }

        const [rows] = await this.connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (!Array.isArray(rows) || rows.length !== 1) {
            return undefined;
        }

        const result: any = rows[0];
        
        const user: User = {
            id: result.id,
            email: result.email,
            vorname: result.vorname,
            nachname: result.nachname,
            rolle: result.rolle,
            isVerified: result.is_verified,
            isLocked: result.is_locked
        };

        return user;
    }


    async getUsers(): Promise<undefined | User[]> {
        if (!this.connection) {
            return undefined;
        }

        const [rows] = await this.connection.execute<ResultSetHeader>(
            'SELECT * FROM users', []
        );

        if (!Array.isArray(rows)) {
            return undefined;
        } 
        const users = rows.map((user: any) => {
            delete user.passwort
            user.isLocked = user.is_locked
            user.isVerified = user.is_verified
            delete user.is_locked
            delete user.is_verified
            return user;
        })
        return users;
    }

    async createUser(email: string, password: string, vorname: string, nachname: string): Promise<User | undefined> {
        if (!this.connection) {
            return undefined;
        }
  
        const rolle = '';
        try {
            const [result] = await this.connection.execute<ResultSetHeader>(`
                INSERT INTO users (email, passwort, vorname, nachname, rolle, is_locked, is_verified)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [email, this.createHash(password), vorname, nachname, rolle, false, false]);

            if (result.affectedRows !== 1) {
                return undefined;
            }

            const id = result.insertId;

            if (id === 1) {
                await this.updateUser(id, undefined, undefined, undefined, undefined, 'admin')
            }

            return {
                id,
                email,
                vorname,
                nachname,
                rolle,
                isLocked: false,
                isVerified: false,
            } as User;
        } catch (e) {
            return undefined
        }

    }

    async updateUser(
        id: number,
        email?: string,
        password?: string,
        vorname?: string,
        nachname?: string,
        rolle?: string,
        isLocked?: boolean,
        isVerified?: boolean
    ): Promise<DatabaseMessage> {
        if (!this.connection) {
            return STANDARD_FEHLER
        }

        const fields: string[] = [];
        const values: any[] = [];

        if (email !== undefined) {
            fields.push("email = ?");
            values.push(email);
        }
        if (password !== undefined) {
            fields.push("passwort = ?");
            values.push(this.createHash(password));
        }
        if (vorname !== undefined) {
            fields.push("vorname = ?");
            values.push(vorname);
        }
        if (nachname !== undefined) {
            fields.push("nachname = ?");
            values.push(nachname);
        }
        if (rolle !== undefined) {
            fields.push("rolle = ?");
            values.push(rolle);
        }
        if (isLocked !== undefined) {
            fields.push("is_locked = ?");
            values.push(isLocked);
        }
        if (isVerified !== undefined) {
            fields.push("is_verified = ?");
            values.push(isVerified);
        }

        if (fields.length === 0) {
            return {
                success: false,
                message: 'Ein Fehler ist aufgetreten.'
            };
        }

        values.push(id);

        const sql = `
            UPDATE users
            SET ${fields.join(", ")}
            WHERE id = ?
        `;

        try {
            const [result] = await this.connection.execute<ResultSetHeader>(sql, values);
            return {
                success: true,
                message: 'Der Nutzer wurde erfolgreich aktualisiert.'
            };
        } catch (e) {
            return {
                success: false,
                message: 'Der Nutzer konnte nicht aktualisiert werden.'
            };
        }
    }

    async deleteUser(id: number): Promise<boolean> {
        if (!this.connection) {
            return false;
        }

        try {
            const [result] = await this.connection.execute<ResultSetHeader>(
                `DELETE FROM users WHERE id = ?`,
                [id]
            );

            return result.affectedRows === 1;
        } catch (e) {
            return false;
        }
    }
    

    async getRoles(): Promise<undefined | Rolle[]> {
        
        if (!this.connection) {
            return undefined;
        }

        const [rows] = await this.connection.execute<RowDataPacket[]>(
            'SELECT * FROM rollen',
            []
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return undefined;
        }
        try {
            const rollen = rows.map(row => {
                row.berechtigungen = JSON.parse(row.berechtigungen)
                return row;
            })

            return rollen as Rolle[];
        } catch (e) {
            return undefined;
        }
    }

    async createRole(role: Rolle): Promise<DatabaseMessage> {

        const defaultErrorMessage = {
                success: false,
                message: 'Die Rolle konnte nicht erstellt werden.'
        };
        if (!this.connection) {
            return defaultErrorMessage
        }
  
        try {
            const [result] = await this.connection.execute<ResultSetHeader>(`
                INSERT INTO rollen (rolle, berechtigungen)
                VALUES (?, ?)
            `, [role.rolle , JSON.stringify(role.berechtigungen)]);

            if (result.affectedRows !== 1) {
                return defaultErrorMessage
            }
        } catch (e: any) {
            if (e.code === 'ER_DUP_ENTRY') {
                return {
                    success: false,
                    message: 'Es existiert bereits eine Rolle mit dem Namen.'
                };
            }

            return defaultErrorMessage;
        }

        return {
            success: true,
            message: 'Die Rolle wurde erfolgreich erstellt.'
        };
    }

    async updateRole(rollenbezeichnung: string, updatedRole: Rolle): Promise<DatabaseMessage> {
        const defaultErrorMessage = {
                success: false,
                message: 'Die Rolle konnte nicht aktualisiert werden.'
        };
        if (!this.connection) {
            return defaultErrorMessage;
        }

        try {
            const [result] = await this.connection.execute<ResultSetHeader>(`
                UPDATE rollen
                SET rolle = ?, berechtigungen = ?
                WHERE rolle = ?
            `, [updatedRole.rolle, JSON.stringify(updatedRole.berechtigungen), rollenbezeichnung]);

            if (result.affectedRows == 0) {
                return { success: false, message: "Es existiert keine Rolle mit diesem Namen." };
            }
            if (result.affectedRows !== 1) {
                return { success: false, message: "Fehler beim Aktualisieren der Rolle." };
            } 
        } catch (e: any) {
            return { success: false, message: "Ein unerwarteter Fehler ist aufgetreten." };
        }

        return {
            success: true,
            message: 'Die Rolle wurde erfolgreich aktualisiert.'
        };
    }

    async deleteRole(rolle: string): Promise<DatabaseMessage> {
        const defaultErrorMessage = {
            success: false,
            message: 'Die Rolle konnte nicht gelöscht werden.'
        };

        if (!this.connection) {
            return defaultErrorMessage;
        }

        try {
            const [result] = await this.connection.execute<ResultSetHeader>(`
                DELETE FROM rollen
                WHERE rolle = ?
            `, [rolle]);

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Es existiert keine Rolle mit diesem Namen.'
                };
            }

            if (result.affectedRows !== 1) {
                return defaultErrorMessage;
            }

            await this.connection.execute<ResultSetHeader>(`
                UPDATE users
                SET rolle = ?
                WHERE rolle = ?
            `, ["", rolle]);

        } catch (e: any) {
            return defaultErrorMessage;
        }

        return {
            success: true,
            message: 'Die Rolle wurde erfolgreich gelöscht.'
        };
    }

    async getSessions(): Promise<SessionData[]> {
        if (!this.connection) {
            return [];
        }

        const [rows] = await this.connection.execute(
            'SELECT * FROM session_store'
        );

        if (!Array.isArray(rows)) {
            return [];
        }

        return rows.map((row: any) => {
            let user = undefined;
            const parsedData = JSON.parse(row.session_data)
            user = parsedData.user

            const sessionData = {
                sessionId: row.session_id,
                user: user,
                createdAt: row.created_at,
                expiresAt: row.expires_at,
                is2FaVerified: parsedData.is2FaVerified
            } as SessionData;

            return sessionData
        });
    }

    async getSession(sessionId: string): Promise<undefined | SessionData> {
        if (!this.connection) {
            return undefined;
        }

        const [rows] = await this.connection.execute(
            'SELECT * FROM session_store WHERE session_id = ?',
            [sessionId]
        );

        if (!Array.isArray(rows)) {
            return undefined;
        } 

        if (rows.length !== 1) {
            return undefined;
        }
        
        const row = rows[0] as any
        let user = undefined
        try {
            const parsedData = JSON.parse(row.session_data)
            user = parsedData.user

            const sessionData = {
                sessionId: row.session_id,
                user: user,
                createdAt: row.created_at,
                expiresAt: row.expires_at,
                is2FaVerified: parsedData.is2FaVerified
            } as SessionData;

            return sessionData
        } catch (_) { 
            return undefined
        }
    }
    async setSessionData(sessionId: string, sessionData: SessionData): Promise<boolean> {
        if (!this.connection) {
            return false;
        }

        const [result] = await this.connection.execute<ResultSetHeader>(`
            INSERT INTO session_store (session_id, session_data, created_at, expires_at)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                session_data = VALUES(session_data),
                created_at = VALUES(created_at),
                expires_at = VALUES(expires_at)
        `, [
            sessionId,
            JSON.stringify({
                user: sessionData.user,
                is2FaVerified: sessionData.is2FaVerified
            }),
            sessionData.createdAt,
            sessionData.expiresAt
        ]);

        return result.affectedRows > 0;
    }


    async removeSession(sessionId: string): Promise<boolean> {
        if (!this.connection) {
            return false;
        }

        const [result] = await this.connection.execute<ResultSetHeader>(`
            DELETE FROM session_store WHERE session_id = ?
        `, [sessionId]);

        if (result.affectedRows === 1) {
            return true;
        }

        return false;
    }

    async removeSessionForUser(userId: number): Promise<DatabaseMessage> {
        if (!this.connection) {
            return STANDARD_FEHLER
        }

        let [rows] = await this.connection.execute<ResultSetHeader>(
            'SELECT * FROM session_store',
            []
        );

        if (!Array.isArray(rows)) {
            return STANDARD_FEHLER
        } 

        try {
            const sessionsToDelete = rows.filter((row) => {
                try {
                    const user = JSON.parse(row.session_data) as User;
                    return user?.id === userId;
                } catch {
                    return false;
                }
            });

            if (sessionsToDelete.length === 0) {
                return {
                    success: false,
                    message: 'Keine Sitzung für den Benutzer gefunden.'
                };
            }

            for (const session of sessionsToDelete) {
                await this.connection.execute(
                    'DELETE FROM session_store WHERE session_id = ?',
                    [session.session_id]
                );
            }

            return {
                success: true,
                message: 'Sitzung(en) erfolgreich gelöscht.'
            };
        } catch(_) {
            return STANDARD_FEHLER
        }
    }

    private createHash(stringToBeHashed: string) {
        return crypto.createHash('sha256').update(stringToBeHashed).digest('hex')
    }
}