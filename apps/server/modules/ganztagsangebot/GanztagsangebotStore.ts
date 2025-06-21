import { Ganztagsangebot, Halbjahr, Schuljahr } from "@thesis/schule";
import { Pool, ResultSetHeader } from "mysql2/promise"
import { DatabaseMessage, STANDARD_FEHLER } from "../shared/models";

interface GetGanztagsangeboteSQL {
    id: number,
    schuelerId: number,
    schuljahr: Schuljahr,
    halbjahr: Halbjahr,
    name: string,
    betreuerId: number
}

export class GanztagsangebotStore {

    private connection: Pool

    constructor(pool: Pool) {
        this.connection = pool
    }
    async createGanztagsangebot(ganztagsangebot: Ganztagsangebot) {
        if (!this.connection) {
            return STANDARD_FEHLER
        }

        const conn = await this.connection.getConnection();

        try {
            await conn.beginTransaction();

            const [result] = await conn.execute<ResultSetHeader>(`
                INSERT INTO ganztagsangebote (schuljahr, halbjahr, name) VALUES (?, ?, ?)
            `, [ganztagsangebot.schuljahr, ganztagsangebot.halbjahr, ganztagsangebot.name]);

            const id = result.insertId;

            for (const schuelerId of ganztagsangebot.schueler ?? []) {
                await conn.execute<ResultSetHeader>(`
                    INSERT INTO ganztagsangebot_schueler (ganztagsangebot_id, schueler_id) VALUES (?, ?)
                `, [id, schuelerId]);
            }

            for (const betreuerId of ganztagsangebot.betreuer ?? []) {
                await conn.execute<ResultSetHeader>(`
                    INSERT INTO ganztagsangebot_betreuer (ganztagsangebot_id, user_id) VALUES (?, ?)
                `, [id, betreuerId]);
            }
            
            await conn.commit();
            conn.release()
            return {
                success: true,
                message: 'Das Ganztagsangebot wurde erfolgreich erstellt.'
            };
        } catch (e) {
            console.log(e)
            await conn.rollback()
            conn.release()
            return {
                success: false,
                message: 'Beim Erstellen des Ganztagsangebotes ist ein Fehler aufgetreten.'
            };
        }  
    }
    
    async getGanztagsangebote(schuljahr: Schuljahr, halbjahr: Halbjahr): Promise<Ganztagsangebot[]> {
        if (!this.connection) {
            return []
        }

        
        const [data] = await this.connection.execute<any[]>(
            `SELECT g.id as id, gs.schueler_id as schuelerId, schuljahr, halbjahr, name, gb.user_id as betreuerId FROM ganztagsangebote g 
            LEFT JOIN ganztagsangebot_schueler gs ON g.id = gs.ganztagsangebot_id 
            LEFT JOIN ganztagsangebot_betreuer gb ON g.id = gb.ganztagsangebot_id
            WHERE schuljahr = ? AND halbjahr = ?
        `,
            [schuljahr, halbjahr]
        );

        if (!Array.isArray(data)) {
            return []
        }

        return this.reduceGanztagsangebotDataToGanztagsangebote(data)
    }
    private reduceGanztagsangebotDataToGanztagsangebote(data: GetGanztagsangeboteSQL[]) {
        const ganztagsangebote = data.reduce((prev: Ganztagsangebot[], current: GetGanztagsangeboteSQL) => {
            const { id, name, halbjahr, schuljahr } = current
            const isGanztagsangebotInside = prev.find(g => g.id === id)
            if (!isGanztagsangebotInside) {
                prev.push({
                    id,
                    name,
                    halbjahr,
                    schuljahr,
                })
            }
            const isSchuelerInside = prev.find(g => g.schueler?.includes(current.schuelerId))
            if (!isSchuelerInside) {
                prev.map(item => {
                    if (item.id !== current.id) {
                        return item;
                    }
                    if (!item.schueler) {
                        item.schueler = [current.schuelerId]
                    } else {
                        item.schueler = [...item.schueler, current.schuelerId]
                    }
                    return item;
                })
            }
            const isBetreuerInside = prev.find(g => g.betreuer?.includes(current.betreuerId))
            if (!isBetreuerInside) {
                prev.map(item => {
                    if (item.id !== current.id) {
                        return item;
                    }
                    if (!item.betreuer) {
                        item.betreuer = [current.betreuerId]
                    } else {
                        item.betreuer = [...item.betreuer, current.betreuerId]
                    }
                    return item;
                })
            }
            return prev
        }, [] as Ganztagsangebot[]) as Ganztagsangebot[]
        return ganztagsangebote
    }

    async getGanztagsangebot(schuljahr: Schuljahr, halbjahr: Halbjahr, ganztagsangebotId: number): Promise<Ganztagsangebot | undefined> {
        if (!this.connection) {
            return undefined;
        }

        const [data] = await this.connection.execute<any[]>(
            `SELECT g.id as id, gs.schueler_id as schuelerId, schuljahr, halbjahr, name, gb.user_id as betreuerId FROM ganztagsangebote g 
            LEFT JOIN ganztagsangebot_schueler gs ON g.id = gs.ganztagsangebot_id 
            LEFT JOIN ganztagsangebot_betreuer gb ON g.id = gb.ganztagsangebot_id
            WHERE schuljahr = ? AND halbjahr = ? AND id = ?
        `,
            [schuljahr, halbjahr, ganztagsangebotId]
        );

        if (!Array.isArray(data)) {
            return undefined
        }

        return this.reduceGanztagsangebotDataToGanztagsangebote(data)[0]
    }

    async editGanztagsangebot(schuljahr: Schuljahr, halbjahr: Halbjahr, ganztagsangebot: Ganztagsangebot) {
        if (!this.connection) {
            return {
                success: false,
                message: 'Keine Datenbankverbindung.'
            };
        }

        const conn = await this.connection.getConnection();

        try {
            await conn.beginTransaction();

            await conn.execute(`
                UPDATE ganztagsangebote 
                SET name = ?, schuljahr = ?, halbjahr = ?
                WHERE id = ?
            `, [ganztagsangebot.name, schuljahr, halbjahr, ganztagsangebot.id]);

            await conn.execute(`
                DELETE FROM ganztagsangebot_schueler WHERE ganztagsangebot_id = ?
            `, [ganztagsangebot.id]);

            for (const schuelerId of ganztagsangebot.schueler ?? []) {
                await conn.execute(`
                    INSERT INTO ganztagsangebot_schueler (ganztagsangebot_id, schueler_id)
                    VALUES (?, ?)
                `, [ganztagsangebot.id, schuelerId]);
            }

            await conn.execute(`
                DELETE FROM ganztagsangebot_betreuer WHERE ganztagsangebot_id = ?
            `, [ganztagsangebot.id]);


            for (const betreuerId of ganztagsangebot.betreuer ?? []) {
                await conn.execute(`
                    INSERT INTO ganztagsangebot_betreuer (ganztagsangebot_id, user_id)
                    VALUES (?, ?)
                `, [ganztagsangebot.id, betreuerId]);
            }

            await conn.commit();
            conn.release()

            return {
                success: true,
                message: 'Das Ganztagsangebot wurde erfolgreich aktualisiert.'
            };

        } catch (e) {
            console.error(e);
            await conn.rollback();
            conn.release()
            return {
                success: false,
                message: 'Beim Aktualisieren des Ganztagsangebotes ist ein Fehler aufgetreten.'
            };
        }
    }
    async deleteGanztagsangebot(ganztagsangebotId: number): Promise<DatabaseMessage> {
        if (!this.connection) {
            return {
                success: false,
                message: 'Keine Datenbankverbindung.'
            };
        }

        const conn = await this.connection.getConnection();

        try {
            await conn.beginTransaction();

            await conn.execute(`
                DELETE FROM ganztagsangebot_schueler WHERE ganztagsangebot_id = ?
            `, [ganztagsangebotId]);

            await conn.execute(`
                DELETE FROM ganztagsangebot_betreuer WHERE ganztagsangebot_id = ?
            `, [ganztagsangebotId]);

            await conn.execute(`
                DELETE FROM ganztagsangebote WHERE id = ?
            `, [ganztagsangebotId]);

            await conn.commit();
            conn.release()

            return {
                success: true,
                message: 'Das Ganztagsangebot wurde erfolgreich gelöscht.'
            };
        } catch (e) {
            console.error(e);
            await conn.rollback();
            conn.release()
            return {
                success: false,
                message: 'Beim Löschen des Ganztagsangebotes ist ein Fehler aufgetreten.'
            };
        }
    }
}