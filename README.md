## 1. Download the Docker CLI
```
https://docs.docker.com/get-started/get-docker/
```


## 2. Open a terminal in the root directory


#### 2.1  Generating a HMAC key for signing cookies

```
openssl rand -base64 32 > cookie_signing.key
```
#### 2.2 Generating a HMAC key for registering
```
openssl rand -base64 32 > register.key
```

#### 2.3 Generating key pair and a self signed certificate for https

```
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./https.key -out https.crt
```

## 3. Create a .env file inside the root directory and add config data based on .env.sample

## 4. Execute the docker cli command
```
docker compose up -d
```

<!-- 
### ISC Lizenz

npm i lucide-react

### MIT Lizenz

hero-icons -->

<!-- ### Activate SMTP for gmail

https://www.youtube.com/watch?v=ZfEK3WP73eY&ab_channel=GuideRealm -->