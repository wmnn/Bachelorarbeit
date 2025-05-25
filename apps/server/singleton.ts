import { DefaultStore } from "./DefaultStore";

let db: DefaultStore | undefined
let roles : undefined 

export function getDB() {
    if (!db) {
        db = new DefaultStore();
    }
    return db
}

export async function getRoles() {
    if (!roles) {
        const result = await getDB().getRoles();
    }
    return roles;
}