-- CREATE TABLE berechtigungen (
--     label VARCHAR(255) PRIMARY KEY
-- );

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



-- CREATE TABLE rolle_hat_berechtigung (
--     rolle VARCHAR(36),
--     berechtigung VARCHAR(255),
--     berechtigung_wert VARCHAR(255),
--     PRIMARY KEY (rollen_id, label)
-- );

-- CREATE TABLE berechtigung_werte (
--     berechtigung VARCHAR(255),
--     berechtigung_wert VARCHAR(255),
--     PRIMARY KEY (label, wert)
-- );

CREATE TABLE diagnostikverfahren (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    beschreibung VARCHAR(255),
    erstellungsdatum DATE,
    obere_grenze FLOAT,
    untere_grenze FLOAT,
    sichtbarkeit VARCHAR(255),
    typ VARCHAR(255),
    user_id VARCHAR(36),
    klassen_id VARCHAR(36)
);

CREATE TABLE ganztagsangebote (
    id INT AUTO_INCREMENT PRIMARY KEY,
    schuljahr VARCHAR(255),
    name VARCHAR(255)
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
    verlaesst_schule_allein VARCHAR(255)
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

CREATE TABLE nachrichtenversionen (
    zeitstempel TIMESTAMP,
    nachrichten_id VARCHAR(36),
    inhalt VARCHAR(255),
    PRIMARY KEY (zeitstempel, nachrichten_id)
);

CREATE TABLE anwesenheitsstatus (
    schueler_id INT,
    datum DATE,
    status INT,
    typ INT,
    PRIMARY KEY (schueler_id, datum)
);

CREATE TABLE klassenversionen (
    klassen_id INT,
    schuljahr VARCHAR(6),
    halbjahr VARCHAR(12),
    klassenstufe VARCHAR(255),
    zusatz VARCHAR(255),
    PRIMARY KEY (klassen_id, schuljahr, halbjahr, klassenstufe)
);

CREATE TABLE tests (
    diagnostikverfahren_id VARCHAR(36),
    datum DATE,
    PRIMARY KEY (diagnostikverfahren_id, datum)
);

CREATE TABLE nachrichten (
    id INT AUTO_INCREMENT PRIMARY KEY,
    typ VARCHAR(255),
    schueler_id VARCHAR(36),
    klassen_id INT,
    user_id VARCHAR(36)
);

CREATE TABLE schueler_tests (
    diagnostikverfahren_id VARCHAR(36),
    datum DATE,
    schueler_id VARCHAR(36),
    ergebnis VARCHAR(255),
    PRIMARY KEY (diagnostikverfahren_id, datum, schueler_id)
);

CREATE TABLE ganztagsangebot_schueler (
    ganztagsangebot_id VARCHAR(36),
    schueler_id VARCHAR(36),
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

CREATE TABLE user_fuehrt_ganztagsangebot (
    user_id VARCHAR(36),
    ganztagsangebot_id VARCHAR(36),
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
    diagnostikverfahren_id VARCHAR(36),
    klassenstufe VARCHAR(255),
    PRIMARY KEY (diagnostikverfahren_id, klassenstufe)
);

CREATE TABLE diagnostikverfahren_kategorien (
    diagnostikverfahren_id VARCHAR(36),
    kategorie VARCHAR(255),
    PRIMARY KEY (diagnostikverfahren_id, kategorie)
);

CREATE TABLE diagnostikverfahren_dateien (
    diagnostikverfahren_id VARCHAR(36),
    datei VARCHAR(255),
    PRIMARY KEY (diagnostikverfahren_id, datei)
);

CREATE TABLE diagnostikverfahren_farbbereiche (
    diagnostikverfahren_id VARCHAR(36),
    hex_farbe VARCHAR(255),
    obere_grenze FLOAT,
    PRIMARY KEY (diagnostikverfahren_id, hex_farbe)
);

CREATE TABLE session_store (
    session_id VARCHAR(128),
    session_data VARCHAR(1024),
    created_at     TIMESTAMP NOT NULL,
    expires_at     TIMESTAMP
)