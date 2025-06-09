import { Halbjahr, Schuljahr, Klasse } from '../index'

export function getHalbjahr(date: Date): Halbjahr {
  const monat = date.getMonth();
  return (monat >= 1 && monat <= 6) ? "2. Halbjahr" : "1. Halbjahr";
}

export function getSchuljahr(date: Date): Schuljahr {
  const jahr = date.getFullYear();
  const monat = date.getMonth();

  const startJahr = monat >= 7 ? jahr : jahr - 1;
  const endJahr = startJahr + 1;

  const format = (n: number) => String(n % 100).padStart(2, '0');

  return `${format(startJahr)}/${format(endJahr)}` as Schuljahr
}

export function getTitle(klasse: Klasse) {
    let parts: string[] = []
    for (const version of klasse.versionen) {
        parts.push(`${version.klassenstufe}${version.zusatz}`)
    }
    return parts.join('/')
}