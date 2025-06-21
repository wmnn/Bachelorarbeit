import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { DatabaseMessage, STANDARD_FEHLER } from "../shared/models";
import { Halbjahr, Klasse, KlassenVersion, Schuljahr } from "@thesis/schule";
import { User } from "@thesis/auth";
import { reduceKlassenversionenToKlassen } from "./util";
import { Schueler } from "@thesis/schueler";

export class KlassenStore {

    private connection: Pool

    constructor(pool: Pool) {
        this.connection = pool
    }

    async getClass(schuljahr: Schuljahr, halbjahr: Halbjahr, klassenId: number): Promise<Klasse | undefined> {
        if (!this.connection) {
            return undefined;
        }

        const [rows] = await this.connection.execute<any[]>(
            `SELECT * FROM klassenversionen kv
            LEFT JOIN klassenversion_schueler ks ON kv.klassen_id = ks.klassen_id 
            AND kv.schuljahr = ks.schuljahr AND kv.halbjahr = ks.halbjahr 
            AND kv.klassenstufe = ks.klassenstufe
            LEFT JOIN schueler ON schueler_id = schueler.id
            WHERE kv.schuljahr = ? AND kv.halbjahr = ? AND kv.klassen_id = ?;`,
            [schuljahr, halbjahr, klassenId]
        );

        if (!Array.isArray(rows)) {
            return {
                id: klassenId,
                versionen: []
            };
        }
        let klasse = reduceKlassenversionenToKlassen(rows)[0]
        const [ returnedKlasse ] = await this.addLehrerToClasses([klasse], schuljahr, halbjahr);
        return returnedKlasse;
    }

    private async addLehrerToClasses(klassen: Klasse[], schuljahr: Schuljahr, halbjahr: Halbjahr) {
        if (!this.connection) {
            return [];
        }

        const [lehrer] = await this.connection.execute<any[]>(
            `SELECT id, vorname, nachname, klassen_id FROM klassenversion_klassenlehrer k 
            LEFT JOIN users u ON k.user_id = u.id
            WHERE schuljahr = ? AND halbjahr = ?`,
            [schuljahr, halbjahr]
        );
        const reducedLehrer = lehrer.reduce((prev: Klasse[], current) => {
            let klasse = prev.find(k => k.id === current.klassen_id);

            if (!klasse) {
                klasse = { id: current.klassen_id, versionen: [], klassenlehrer: [] };
                prev.push(klasse);
            }

            klasse.klassenlehrer?.push(current)
            return prev

        }, [] as Klasse[])

        return klassen.map((klasse) => {
            const lehrer = reducedLehrer.find(o => o.id === klasse.id)
            if (!lehrer) {
                return klasse
            }
            return {
                ...klasse,
                klassenlehrer: lehrer.klassenlehrer ?? [] 
            }
        })
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

        let klasse = rows.reduce((prev: Klasse[], current) => {
            let klasse = prev.find(k => k.id === current.klassen_id);

            if (!klasse) {
                klasse = { 
                    id: current.klassen_id, 
                    versionen: [],
                    klassenlehrer: []
                };
                prev.push(klasse);
            }

            klasse.versionen.push({
                ...current,
                klassenId: current.klassen_id,
            } as KlassenVersion);

            return prev;
        }, []) as Klasse[];

        return await this.addLehrerToClasses(klasse, schuljahr, halbjahr)
    }


    async createClass(klassenId: undefined | number, klassen: KlassenVersion[], klassenlehrer: User[]): Promise<DatabaseMessage> {
        if (!this.connection) {
            return STANDARD_FEHLER
        }

        const conn = await this.connection.getConnection();

        try {
            await conn.beginTransaction();
            let id = klassenId
            if (!klassenId) {
                const [result] = await conn.execute<ResultSetHeader>(`
                    INSERT INTO klassen VALUES ()
                `, []);

                id = result.insertId;
            }
            

            let schuljahr: undefined | string;
            let halbjahr: undefined | string;

            for (const klasse of klassen) {
                schuljahr = klasse.schuljahr
                halbjahr = klasse. halbjahr
                const { zusatz, klassenstufe } = klasse;

                if (!zusatz || !klassenstufe || zusatz === '' || klassenstufe === '') {
                    await conn.rollback()
                    return {
                        success: false,
                        message: 'Eine Klasse muss eine Klassenstufe und einen Zusatz haben.'
                    };
                }

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

                if (!klasse.schueler || klasse.schueler.length === 0) {
                    await conn.rollback()
                    return {
                        success: false,
                        message: 'Eine Klasse muss Schüler enthalten.'
                    };
                }

                try {
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
                } catch(_) {
                    await conn.rollback()
                    return {
                        success: false,
                        message: 'Ein Schüler kann nur in einer Klasse sein.'
                    };
                }
            }

            if (klassenlehrer.length === 0) {
                await conn.rollback()
                return {
                    success: false,
                    message: 'Eine Klasse muss Lehrer enthalten.'
                };
            }
            if (schuljahr && halbjahr) {
                for (const lehrer of klassenlehrer) {
                    await conn.execute(`
                        INSERT INTO klassenversion_klassenlehrer (user_id, klassen_id, schuljahr, halbjahr)
                        VALUES (?, ?, ?, ?)
                    `, [
                        lehrer.id,
                        id,
                        schuljahr,
                        halbjahr
                    ]);
                }
            }

            await conn.commit();
            conn.release()
            return {
                success: true,
                message: 'Die Klasse wurde erfolgreich erstellt.'
            };
        } catch (e) {
            console.log(e)
            await conn.rollback()
            conn.release()
            return {
                success: false,
                message: 'Beim Erstellen der Klasse ist ein Fehler aufgetreten.'
            };
        }  
    }

    async editClass(
        klassenId: number,
        klassen: KlassenVersion[],
        klassenlehrer: User[],
        schuljahr: Schuljahr,
        halbjahr: Halbjahr
    ): Promise<DatabaseMessage> {
        if (!this.connection) {
            return STANDARD_FEHLER;
        }

        const conn = await this.connection.getConnection();
        
        try {
            await conn.beginTransaction();

            if (klassen.length === 0) {
                await conn.rollback();
                return { success: false, message: 'Klassen-Versionen dürfen nicht leer sein.' };
            }

            await conn.execute(`DELETE FROM klassenversion_klassenlehrer WHERE klassen_id = ? AND schuljahr = ? AND halbjahr = ?`, [klassenId, schuljahr, halbjahr]);
            await conn.execute(`DELETE FROM klassenversion_schueler WHERE klassen_id = ? AND schuljahr = ? AND halbjahr = ?`, [klassenId, schuljahr, halbjahr]);
            await conn.execute(`DELETE FROM klassenversionen WHERE klassen_id = ? AND schuljahr = ? AND halbjahr = ?`, [klassenId, schuljahr, halbjahr]);

            for (const klasse of klassen) {
                const { zusatz, klassenstufe } = klasse;

                if (!zusatz || !klassenstufe || zusatz === '' || klassenstufe === '') {
                    await conn.rollback();
                    return {
                        success: false,
                        message: 'Eine Klasse muss eine Klassenstufe und einen Zusatz haben.',
                    };
                }

                const [versionResult] = await conn.execute<ResultSetHeader>(
                    `
                    INSERT INTO klassenversionen (klassen_id, schuljahr, halbjahr, klassenstufe, zusatz)
                    VALUES (?, ?, ?, ?, ?)
                    `,
                    [klassenId, schuljahr, halbjahr, klassenstufe, zusatz]
                );

                if (!klasse.schueler || klasse.schueler.length === 0) {
                    await conn.rollback();
                    return {
                        success: false,
                        message: 'Eine Klasse muss Schüler enthalten.',
                    };
                }
    
                try {
                    for (const schuelerId of klasse.schueler) {
                        await conn.execute(
                            `
                            INSERT INTO klassenversion_schueler (klassen_id, schuljahr, halbjahr, klassenstufe, schueler_id)
                            VALUES (?, ?, ?, ?, ?)
                            `,
                            [klassenId, schuljahr, halbjahr, klassenstufe, schuelerId]
                        );
                    }
                } catch (_) {
                    await conn.rollback();
                    return {
                        success: false,
                        message: 'Ein Schüler kann nur in einer Klasse sein.',
                    };
                }
            }

            if (klassenlehrer.length === 0) {
                await conn.rollback();
                return {
                    success: false,
                    message: 'Eine Klasse muss Lehrer enthalten.',
                };
            }

            if (schuljahr && halbjahr) {
                for (const lehrer of klassenlehrer) {
                    await conn.execute(`
                        INSERT INTO klassenversion_klassenlehrer (user_id, klassen_id, schuljahr, halbjahr)
                        VALUES (?, ?, ?, ?)
                    `, [lehrer.id, klassenId, schuljahr, halbjahr]);
                }
            }

            await conn.commit();
            conn.release()

            return {
                success: true,
                message: 'Die Klasse wurde erfolgreich bearbeitet.',
            };
        } catch (e) {
            console.log(e);
            await conn.rollback();
            conn.release()
            return {
                success: false,
                message: 'Beim Bearbeiten der Klasse ist ein Fehler aufgetreten.',
            };
        }
    }


    async deleteClass(klassenId: number, schuljahr: Schuljahr, halbjahr: Halbjahr) {
        if (!this.connection) {
            return STANDARD_FEHLER
        }

        const conn = await this.connection.getConnection();

        try {
            await conn.beginTransaction();

            await conn.execute(
                `DELETE FROM klassenversion_schueler 
                WHERE klassen_id = ?
                AND schuljahr = ? AND halbjahr = ?
                `,
                [klassenId, schuljahr, halbjahr]
            );

            await conn.execute(
                `DELETE FROM klassenversionen WHERE klassen_id = ?
                AND schuljahr = ? AND halbjahr = ?
                `,
                [klassenId, schuljahr, halbjahr]
            );

            // await conn.execute(
            //     `DELETE FROM klassen WHERE id = ?`,
            //     [klassenId]
            // );

            await conn.execute(
                `DELETE FROM klassenversion_klassenlehrer WHERE klassen_id = ?
                AND schuljahr = ? AND halbjahr = ?
                `,
                [klassenId, schuljahr, halbjahr]
            );

            await conn.commit();
            conn.release()

            return {
                success: true,
                message: 'Die Klasse wurde erfolgreich gelöscht.'
            };

        } catch (e) {
            await conn.rollback();
            conn.release()
            console.error(e);
            return {
                success: false,
                message: 'Beim Löschen der Klasse ist ein Fehler aufgetreten.'
            };
        }
    }

    async getKlassenVonSchueler(schueler: Schueler[], schuljahr: Schuljahr, halbjahr: Halbjahr): Promise<{ schuelerId: number, klasse: Klasse }[]> {
        
        let results: { schuelerId: number, klasse: Klasse }[] = []
        const [klassenUndSchueler] = await this.connection.execute<RowDataPacket[]>(`
            SELECT klassen_id as klassenId, schueler_id as schuelerId FROM klassenversion_schueler WHERE schuljahr = ? AND halbjahr = ?
        `, [schuljahr, halbjahr]);

        for (const entry of klassenUndSchueler) {
            const klasse = await this.getClass(schuljahr, halbjahr, entry.klassenId);
            if (klasse) {
                results.push({
                    schuelerId: entry.schuelerId,
                    klasse,
                })
            }
        }

        return results
    }
}