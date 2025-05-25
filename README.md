### Generating a HMAC key for signing cookies

```
openssl rand -base64 32 > cookie_signing.key
```

### Generating key pair and a self signed certificate for https

```
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./https.key -out https.crt
```

### ISC Lizenz

npm i lucide-react

### MIT Lizenz

hero-icons