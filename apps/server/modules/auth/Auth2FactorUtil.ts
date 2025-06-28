import { getAuth2FactorStore } from "../../singleton";

export async function is2FASetup(userId: number) {
    const { data } = await getAuth2FactorStore().get2FaktorData(userId)
    if (data !== undefined && typeof data.secret == 'string') {
        return true;
    }
    return false;
}