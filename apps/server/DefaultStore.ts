import { AuthStore, User, Rolle } from '@thesis/auth';
import crypto from 'crypto';
import mysql, { Connection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { SessionData } from './modules/auth/auth';

interface DatabaseMessage {
    success: boolean,
    message: string,
}

export class DefaultStore implements AuthStore {

    private connection: undefined | Connection

    constructor() {
        this.initConnection()
    }

    private async initConnection() {
        this.connection = await mysql.createConnection({
            'host'     : process.env.MYSQL_HOST?.split(':')[0] ?? process.env.MYSQL_HOST,
            'port'     : parseInt((process.env.MYSQL_HOST?.split(':')[1] ?? process.env.MYSQL_PORT) ?? '3306'),
            'database' : process.env.MYSQL_DB,
            'user'     : process.env.MYSQL_USER,
            'password' : process.env.MYSQL_ROOT_PASSWORD
        });
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
        const users = rows.map((user: User) => {
            delete user.passwort
            return user;
        })
        return users;
    }

    async createUser(email: string, password: string, vorname: string, nachname: string): Promise<User | undefined> {
        if (!this.connection) {
            return undefined;
        }
  
        const rolle = 'admin';
        try {
            const [result] = await this.connection.execute<ResultSetHeader>(`
                INSERT INTO users (email, passwort, vorname, nachname, rolle, is_locked, is_verified)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [email, this.createHash(password), vorname, nachname, rolle, false, false]);

            if (result.affectedRows !== 1) {
                return undefined;
            }

            const id = result.insertId;

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
    ): Promise<boolean> {
        if (!this.connection) {
            return false;
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
            return false;
        }

        values.push(id);

        const sql = `
            UPDATE users
            SET ${fields.join(", ")}
            WHERE id = ?
        `;

        try {
            const [result] = await this.connection.execute<ResultSetHeader>(sql, values);
            return result.affectedRows === 1;
        } catch (e) {
            return false;
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
            user = JSON.parse(row.session_data)
        } catch (_) { }
        return {
            sessionId: row.session_id,
            user: user,
            createdAt: row.created_at,
            expiresAt: row.expires_at
        } as SessionData;
    }
    async createSession(sessionId: string, sessionData: SessionData) {

        if (!this.connection) {
            return false;
        }
  
        const [result] = await this.connection.execute<ResultSetHeader>(`
            INSERT INTO session_store (session_id, session_data, created_at, expires_at)
            VALUES (?, ?, ?, ?)
        `, [sessionId , JSON.stringify(sessionData.user), sessionData.createdAt, sessionData.expiresAt]);

        if (result.affectedRows !== 1) {
            return false;
        }

        return true;
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

    private createHash(stringToBeHashed: string) {
        return crypto.createHash('sha256').update(stringToBeHashed).digest('hex')
    }
}