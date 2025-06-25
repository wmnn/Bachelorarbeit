export const isValidPassword = (password: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    return regex.test(password);
}
export const NOT_VALID_PASSWORD_MESSAGE =
  'Das Passwort muss mindestens 6 Zeichen lang sein und mindestens einen Groß- sowie einen Kleinbuchstaben enthalten.';
