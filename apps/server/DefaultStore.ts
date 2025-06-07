import { AuthStore, User, Rolle } from '@thesis/auth';
import crypto from 'crypto';
import mysql, { Connection, QueryResult, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { SessionData } from './modules/auth/auth';
import { Schueler, SchuelerSimple } from '@thesis/schueler';
import { Halbjahr, Klasse, KlassenVersion, Schuljahr } from '@thesis/schule';
import { Anwesenheiten, AnwesenheitTyp } from '@thesis/anwesenheiten';

interface DatabaseMessage {
    success: boolean,
    message: string,
}

const STANDARD_FEHLER = {
    success: false,
    message: 'Ein Fehler ist aufgetreten.'
};

function handleSchuelerRow(schueler: any): Schueler {
    schueler.verlaesstSchuleAllein = schueler.verlaesst_schule_allein
    schueler.hatSonderpaedagogischeKraft = schueler.hat_sonderpaedagogische_kraft
    delete schueler.verlaesst_schule_allein
    delete schueler.hat_sonderpaedagogische_kraft
    return schueler
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

    async getSchueler(): Promise<SchuelerSimple[]> {
        if (!this.connection) {
            throw new Error('Keine Datenbankverbindung');
        }

        const conn = this.connection;

        let [rows] = await conn.execute<RowDataPacket[]>(`
            SELECT id, vorname, nachname, hat_sonderpaedagogische_kraft, verlaesst_schule_allein FROM schueler
        `);

        if (!Array.isArray(rows) || rows.length === 0) {
            return [];
        }

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

        const conn = this.connection;

        try {
            await conn.beginTransaction();

            const [result] = await conn.execute<ResultSetHeader>(`
                INSERT INTO schueler (vorname, nachname, familiensprache, geburtsdatum, strasse, hausnummer, ort, hat_sonderpaedagogische_kraft, verlaesst_schule_allein, postleitzahl)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                schueler.postleitzahl === '' ? null : Number(schueler.postleitzahl)
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

            return {
                success: true,
                message: 'Der Schüler wurde erfolgreich erstellt.'
            };
        } catch (e) {
            await conn.rollback();
            return {
                success: false,
                message: 'Beim Erstellen des Schülers ist ein Fehler aufgetreten.'
            };
        }
    }

    async deleteSchueler(schuelerId: number): Promise<DatabaseMessage> {
        if (!this.connection) {
            return STANDARD_FEHLER
        }

        const conn = this.connection;

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
            console.error(e);
            return {
                success: false,
                message: 'Beim Löschen des Schülers ist ein Fehler aufgetreten.'
            };
        }
    }

    async getClass(schuljahr: Schuljahr, halbjahr: Halbjahr, klassenId: number): Promise<Klasse | undefined> {
        if (!this.connection) {
            return undefined;
        }

        const [rows] = await this.connection.execute<any[]>(
            `SELECT * FROM klassenversionen
            NATURAL JOIN klassenversion_schueler
            JOIN schueler ON schueler_id = schueler.id
            WHERE schuljahr = ? AND halbjahr = ? AND klassen_id = ?;`,
            [schuljahr, halbjahr, klassenId]
        );

        if (!Array.isArray(rows)) {
            return undefined;
        }

        let klasse = rows.reduce((prev: Klasse[], current) => {
            const { klassenstufe, zusatz, schuljahr, halbjahr, klassen_id: klassenId } = current
            let klasse = prev.find(k => k.id === klassenId);

            if (!klasse) {
                klasse = { id: current.klassen_id, versionen: [] };
                prev.push(klasse);
            }

            if (!klasse.versionen.some(o => o.zusatz === zusatz && o.klassenstufe === klassenstufe)) {
                klasse.versionen.push({
                    klassenId,
                    klassenstufe,
                    zusatz,
                    schuljahr, 
                    halbjahr
                } as KlassenVersion);
            }

            return prev;
        }, [])[0];

        // Adding schueler to class
        for (const row of rows) {
            const { klassenstufe, zusatz, vorname, nachname } = row;
            klasse.versionen.map((version) => {
                if (version.klassenstufe !== klassenstufe || version.zusatz !== zusatz) {
                    return version
                }
                if (!version.schueler) {
                    version.schueler = []
                }
                version.schueler.push(row.schueler_id)
                return version
            })
        }
        return klasse;
    }

    async getClasses(schuljahr: Schuljahr, halbjahr: Halbjahr): Promise<Klasse[]> {
        if (!this.connection) {
            return [];
        }

        const [rows] = await this.connection.execute<any[]>(
            'SELECT * FROM `klassenversionen` WHERE schuljahr = ? AND halbjahr = ?',
            [schuljahr, halbjahr]
        );

        if (!Array.isArray(rows)) {
            return [];
        }

        return rows.reduce((prev: Klasse[], current) => {
            let klasse = prev.find(k => k.id === current.klassen_id);

            if (!klasse) {
            klasse = { id: current.klassen_id, versionen: [] };
            prev.push(klasse);
            }

            klasse.versionen.push({
                ...current,
                klassenId: current.klassen_id,
            } as KlassenVersion);

            return prev;
        }, []) as Klasse[];
    }


    async createClass(klassen: KlassenVersion[]) {
        if (!this.connection) {
            return {
                success: false,
                message: 'Ein Fehler ist aufgetreten.'
            };
        }

        const conn = this.connection;

        try {
            await conn.beginTransaction();

            await conn.commit();

            const [result] = await conn.execute<ResultSetHeader>(`
                INSERT INTO klassen VALUES ()
            `, []);

            const id = result.insertId;

            for (const klasse of klassen) {
                await conn.execute(`
                    INSERT INTO klassenversionen (klassen_id, schuljahr, halbjahr, klassenstufe, zusatz)
                    VALUES (?, ?, ?, ?, ?)
                `, [
                    id,
                    klasse.schuljahr,
                    klasse.halbjahr,
                    klasse.klassenstufe,
                    klasse.zusatz
                ]);
                

                for (const schuelerId of klasse.schueler || []) {
                    await conn.execute(`
                        INSERT INTO klassenversion_schueler (klassen_id, schuljahr, halbjahr, klassenstufe, schueler_id)
                        VALUES (?, ?, ?, ?, ?)
                    `, [
                        id,
                        klasse.schuljahr,
                        klasse.halbjahr,
                        klasse.klassenstufe,
                        schuelerId
                    ]);
                }

            }


            return {
                success: true,
                message: 'Die Klasse wurde erfolgreich erstellt.'
            };

        } catch (e) {
            await conn.rollback();
            console.error(e);
            return {
                success: false,
                message: 'Beim Erstellen der Klasse ist ein Fehler aufgetreten.'
            };
        }  
    }
    async deleteClass(klassenId: number) {
        if (!this.connection) {
            return STANDARD_FEHLER
        }

        const conn = this.connection;

        try {
            await conn.beginTransaction();

            await conn.execute(
                `DELETE FROM klassenversion_schueler WHERE klassen_id = ?`,
                [klassenId]
            );

            await conn.execute(
                `DELETE FROM klassenversionen WHERE klassen_id = ?`,
                [klassenId]
            );

            await conn.execute(
                `DELETE FROM klassen WHERE id = ?`,
                [klassenId]
            );

            await conn.commit();

            return {
                success: true,
                message: 'Die Klasse wurde erfolgreich gelöscht.'
            };

        } catch (e) {
            await conn.rollback();
            console.error(e);
            return {
                success: false,
                message: 'Beim Löschen der Klasse ist ein Fehler aufgetreten.'
            };
        }
    }

    async updateAnwesenheitsstatus(
        schuelerId: number,
        typ: AnwesenheitTyp,
        status: Anwesenheiten,
        datum: string
    ): Promise<DatabaseMessage> {
        if (!this.connection) {
            return STANDARD_FEHLER
        }

        const conn = this.connection;

        try {
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

            const affected = result.affectedRows;

            return {
                success: affected > 0,
                message: affected > 0
                    ? 'Anwesenheitsstatus erfolgreich aktualisiert oder eingefügt.'
                    : 'Kein Eintrag wurde geändert.',
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
        typ: AnwesenheitTyp,
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