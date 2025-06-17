import type { Halbjahr, Schuljahr, Klasse } from '../index'

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

export function getVorherigesHalbjahr(halbjahr: Halbjahr): Halbjahr {
  if (halbjahr === "1. Halbjahr") {
      return "2. Halbjahr"
  }
  return "1. Halbjahr"
}

export function getSchuljahrVorherigesHalbjahr(schuljahr: Schuljahr, halbjahr: Halbjahr): Schuljahr {
  if (halbjahr === "1. Halbjahr") {
    if (schuljahr === "00/01") {
        return "99/00"
    }
    const splitted = schuljahr.split('/')
    return `${parseInt(splitted[0]) - 1}/${parseInt(splitted[1]) - 1}` as Schuljahr
  }
  return schuljahr
}