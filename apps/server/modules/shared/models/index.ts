export interface DatabaseMessage {
    success: boolean,
    message: string,
}
export const STANDARD_FEHLER = {
    success: false,
    message: 'Ein Fehler ist aufgetreten.'
};