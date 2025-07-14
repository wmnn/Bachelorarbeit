## 1. Generierung von Schlüssel

Hinweis: openssl muss installiert sein. Es gibt diverse Anleitungen und unterschiedliche Möglichkeiten openssl zu installieren.

#### 1.1  Generierung eines HMAC Schlüssel, um Cookies zu signieren

```
openssl rand -base64 32 > cookie_signing.key
```
#### 1.2 Generierung eines HMAC Schlüssel für die Registrierung
```
openssl rand -base64 32 > register.key
```

#### 1.3 Generierung eines Schlüsselpaares und ein selbst signiertes Zertifikat für eine verschlüsselte HTTPS-Verbindung

```
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./https.key -out https.crt
```

## 2. Erstelle eine .env-Datei im Hauptverzeichnis und füge Konfigurationsdaten entsprechend der Datei .env.sample hinzu.



## 3. Starten des Systems in Docker-Containern
Die CLI kann hier heruntergelanden werden: `https://docs.docker.com/get-started/get-docker/`
```
docker compose up -d
```