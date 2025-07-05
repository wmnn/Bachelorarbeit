import type { Nachricht, NachrichtenVersion } from "../model";

export const countUnreadMessages = (arr: Nachricht[]) => {
    return arr.reduce((prev, acc) => {
        prev.push(...acc.versionen.filter(v => v.lesestatus === undefined))
        return prev
    }, [] as NachrichtenVersion[]).length
}