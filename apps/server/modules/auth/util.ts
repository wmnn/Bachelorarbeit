import { Berechtigung, Berechtigungen, User } from "@thesis/auth";
import { getDB } from "../../singleton";

export async function searchUser<T extends Berechtigung>(query: string, berechtigung: T, berechtigungValue: Berechtigungen[T][]): Promise<User[] | undefined> {
    let users = await getDB().getUsers();
    let roles = await getDB().getRoles();

    if (!users || !roles) {
        return;
    }
    roles = roles.filter(role => {
        return berechtigungValue.includes(role.berechtigungen[berechtigung])
    })

    users = users.filter(user => {
        if (roles.some(role => role.rolle === user.rolle)) {
            return true;
        }
        return false;
    })

    users = users.filter(user => {
        return `${user.vorname} ${user.vorname}`.includes(query)
    }).splice(0, 10)
    return users;
}