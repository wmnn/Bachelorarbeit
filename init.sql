CREATE TABLE rollen (
    rolle VARCHAR(36) PRIMARY KEY,
    berechtigungen VARCHAR(1024)
);

CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    passwort VARCHAR(255),
    vorname VARCHAR(255),
    nachname VARCHAR(255),
    rolle VARCHAR(36),
    is_locked BOOLEAN,
    is_verified BOOLEAN
);

CREATE TABLE diagnostikverfahren (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    beschreibung VARCHAR(255),
    erstellungsdatum DATE,
    aktualisiertAm DATE,
    obere_grenze FLOAT,
    untere_grenze FLOAT,
    sichtbarkeit VARCHAR(255),
    typ VARCHAR(255),
    user_id VARCHAR(36),
    klassen_id VARCHAR(36),
    erhebungszeitraum TINYINT(1),
);

CREATE TABLE ganztagsangebote (
    id INT AUTO_INCREMENT PRIMARY KEY,
    schuljahr VARCHAR(10),
    halbjahr VARCHAR(12),
    name VARCHAR(128)
);

CREATE TABLE klassen (
    id INT AUTO_INCREMENT PRIMARY KEY
);

CREATE TABLE schueler (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vorname VARCHAR(255),
    nachname VARCHAR(255),
    familiensprache VARCHAR(255),
    geburtsdatum DATE,
    strasse VARCHAR(255),
    hausnummer VARCHAR(255),
    postleitzahl INT,
    ort VARCHAR(255),
    hat_sonderpaedagogische_kraft VARCHAR(255),
    verlaesst_schule_allein VARCHAR(255),
    kommentar VARCHAR(280),
    ernaehrung TINYINT(1)
);

CREATE TABLE schueler_abholberechtigte_personen (
    schueler_id INT PRIMARY KEY,
    vorname VARCHAR(255),
    nachname VARCHAR(255),
    strasse VARCHAR(255),
    hausnummer VARCHAR(255),
    postleitzahl INT,
    ort VARCHAR(255),
    abholzeit VARCHAR(255)
);

CREATE TABLE anwesenheitsstatus (
    schueler_id INT,
    datum DATE,
    status INT,
    typ INT,
    PRIMARY KEY (schueler_id, datum, typ)
);

CREATE TABLE klassenversionen (
    klassen_id INT,
    schuljahr VARCHAR(6),
    halbjahr VARCHAR(12),
    klassenstufe VARCHAR(255),
    zusatz VARCHAR(255),
    PRIMARY KEY (klassen_id, schuljahr, halbjahr, klassenstufe)
);

CREATE TABLE diagnostikverfahren_ergebnisse (
    diagnostikverfahren_id INT,
    datum VARCHAR(10),
    schueler_id INT,
    ergebnis VARCHAR(10),
    PRIMARY KEY (diagnostikverfahren_id, datum, schueler_id)
);

CREATE TABLE diagnostikverfahren_auswertungsgruppe (
    diagnostikverfahren_id INT,
    auswertungsgruppe VARCHAR(25),
    schueler_id INT,
    PRIMARY KEY (diagnostikverfahren_id, auswertungsgruppe, schueler_id)
);

CREATE TABLE diagnostikverfahren_geteilt (
    diagnostikverfahren_id INT,
    user_id INT,
    PRIMARY KEY (diagnostikverfahren_id, user_id)
);

CREATE TABLE ganztagsangebot_schueler (
    ganztagsangebot_id INT,
    schueler_id INT,
    PRIMARY KEY (ganztagsangebot_id, schueler_id)
);

CREATE TABLE klassenversion_schueler (
    klassen_id INT,
    schuljahr VARCHAR(6),
    halbjahr VARCHAR(12),
    klassenstufe VARCHAR(12),
    schueler_id INT,
    PRIMARY KEY (schuljahr, halbjahr, schueler_id)
);

CREATE TABLE klassenversion_klassenlehrer (
    user_id INT,
    klassen_id INT,
    schuljahr VARCHAR(10),
    halbjahr VARCHAR(12),
    PRIMARY KEY (user_id, klassen_id, schuljahr, halbjahr)
);

CREATE TABLE ganztagsangebot_betreuer (
    user_id INT,
    ganztagsangebot_id INT,
    PRIMARY KEY (user_id, ganztagsangebot_id)
);

CREATE TABLE schueler_allergien_unvertraeglichkeiten (
    schueler_id INT,
    allergie_oder_unvertraeglichkeit VARCHAR(255),
    PRIMARY KEY (schueler_id, allergie_oder_unvertraeglichkeit)
);

CREATE TABLE schueler_medikamente (
    schueler_id INT,
    medikament VARCHAR(255),
    PRIMARY KEY (schueler_id, medikament)
);

CREATE TABLE diagnostikverfahren_klassenstufen (
    diagnostikverfahren_id INT,
    klassenstufe VARCHAR(255),
    PRIMARY KEY (diagnostikverfahren_id, klassenstufe)
);

CREATE TABLE diagnostikverfahren_kategorien (
    diagnostikverfahren_id INT,
    kategorie VARCHAR(255),
    PRIMARY KEY (diagnostikverfahren_id, kategorie)
);

CREATE TABLE diagnostikverfahren_dateien (
    diagnostikverfahren_id INT,
    datei VARCHAR(255),
    PRIMARY KEY (diagnostikverfahren_id, datei)
);

CREATE TABLE diagnostikverfahren_farbbereiche (
    diagnostikverfahren_id INT,
    hex_farbe VARCHAR(255),
    obere_grenze FLOAT NULL,
    PRIMARY KEY (diagnostikverfahren_id, hex_farbe)
);

CREATE TABLE session_store (
    session_id VARCHAR(128),
    session_data VARCHAR(1024),
    created_at     TIMESTAMP NOT NULL,
    expires_at     TIMESTAMP,
    PRIMARY KEY (session_id)
);

CREATE TABLE users_2_factor_authentication (
    user_id INT,
    secret VARCHAR(64),
    tmp VARCHAR(64),
    PRIMARY KEY (user_id)
);

CREATE TABLE nachrichten (
    nachricht_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    typ INT,
    id INT
);

CREATE TABLE nachrichtenversionen (
    nachricht_id INT,
    nachrichtenversion_id INT AUTO_INCREMENT,
    zeitstempel DATE,
    inhalt VARCHAR(280),
    PRIMARY KEY(nachrichtenversion_id)
);

CREATE TABLE nachrichtenlesestatus (
    nachrichtenversion_id INT,
    user_id INT,
    lesestatus INT,
    PRIMARY KEY(nachrichtenversion_id, user_id)
);

CREATE TABLE nachrichtenvorlagen (
    nachricht_id INT AUTO_INCREMENT,
    typ INT,
    inhalt VARCHAR(280),
    PRIMARY KEY(nachricht_id)
);


