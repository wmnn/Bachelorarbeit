import type { Klasse } from "@thesis/schule";

export function getTitle(klasse: Klasse) {
    let parts = []
    for (const version of klasse.versionen) {
        parts.push(`${version.klassenstufe}${version.zusatz}`)
    }
    return parts.join('/')
}