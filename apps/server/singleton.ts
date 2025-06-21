import mysql from 'mysql2/promise';
import { AuthStore } from './modules/auth/AuthStore';
import { SchuelerStore } from './modules/schueler/SchuelerStore';
import { KlassenStore } from './modules/klassen/KlassenStore';
import { AnwesenheitenStore } from './modules/anwesenheiten/AnwesenheitenStore';
import { DiagnostikStore } from './modules/diagnostik/DiagnostikStore';
import { GanztagsangebotStore } from './modules/ganztagsangebot/GanztagsangebotStore';
import dotenv from 'dotenv';
dotenv.config({
    path: '../../.env'
});

const pool = mysql.createPool({
    'host'     : process.env.MYSQL_HOST?.split(':')[0] ?? process.env.MYSQL_HOST,
    'port'     : parseInt((process.env.MYSQL_HOST?.split(':')[1] ?? process.env.MYSQL_PORT) ?? '3306'),
    'database' : process.env.MYSQL_DB,
    'user'     : process.env.MYSQL_USER,
    'password' : process.env.MYSQL_ROOT_PASSWORD,
    timezone: 'Z',
    waitForConnections: true,
    connectionLimit: 10, 
    queueLimit: 0 
});
let authStore: AuthStore | undefined
let schuelerStore: SchuelerStore | undefined
let klassenStore: KlassenStore | undefined
let anwesenheitenStore: AnwesenheitenStore | undefined
let diagnostikStore: DiagnostikStore | undefined
let ganztagsangebotStore: GanztagsangebotStore | undefined
let roles : undefined 

export function getAuthStore() {
    if (!authStore) {
        authStore = new AuthStore(pool);
    }
    return authStore
}
export function getSchuelerStore() {
    if (!schuelerStore) {
        schuelerStore = new SchuelerStore(pool);
    }
    return schuelerStore
}
export function getKlassenStore() {
    if (!klassenStore) {
        klassenStore = new KlassenStore(pool);
    }
    return klassenStore
}
export function getAnwesenheitenStore() {
    if (!anwesenheitenStore) {
        anwesenheitenStore = new AnwesenheitenStore(pool);
    }
    return anwesenheitenStore
}
export function getDiagnostikStore() {
    if (!diagnostikStore) {
        diagnostikStore = new DiagnostikStore(pool);
    }
    return diagnostikStore
}
export function getGanztagsangebotStore() {
    if (!ganztagsangebotStore) {
        ganztagsangebotStore = new GanztagsangebotStore(pool);
    }
    return ganztagsangebotStore
}