import { LoginRedirectAction } from "../auth/src"

export const AUTH_API_ENDPOINT = '/api/auth'
export const AUTH_2_FACTOR_API_ENDPOINT = '/api/2-fa'
export const LOGIN_ENDPOINT = '/login'
export const LOGOUT_ENDOINT = '/logout'
export const REGISTER_ENDPOINT =  '/register'
export const REGISTER_CALLBACK_ENDPOINT = '/callback'

export const SESSION_COOKIE_NAME = 'session_cookie'


export const SCHUELER_ENDPOINT = '/api/schueler'
export const KLASSEN_ENDPOINT = '/api/klassen'
export const ANWESENHEITEN_ENDPOINT = '/api/anwesenheiten'
export const GANZTAGSANGEBOT_ENDPOINT = '/api/ganztagsangebot'
export const DIAGNOSTIK_ENDPOINT = '/api/diagnostik'
export const FILES_ENDPOINT = '/api/files'
export const NACHRICHTEN_ENDPOINT = '/api/nachrichten'

export const handleRedirection = (redirect: undefined | LoginRedirectAction) => {
    if (redirect == undefined) {
        return;
    }
    if (redirect == LoginRedirectAction.LOGIN_SUCCESS) {
        window.location.href = '/diagnostikverfahren'
    } else if (redirect == LoginRedirectAction.REDIRECT_TO_LOGIN) {
        window.location.href = '/login'
    } else if (redirect == LoginRedirectAction.SETUP_2_FACTOR_AUTHENTICATION) {
        window.location.href = '/2fa-setup'
    } else if (redirect == LoginRedirectAction.VERIFY_2_FACTOR_CODE) {
        window.location.href = '/2fa-verify'
    } else if (redirect == LoginRedirectAction.VALIDATE_2_FACTOR_CODE) {
        window.location.href = '/2fa-validate'
    }
}