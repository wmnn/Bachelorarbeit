FROM node:18-alpine
RUN apk add --no-cache curl
RUN apk add --no-cache bash
RUN npm install -g pnpm
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"
WORKDIR /app
# /root/.bun/bin/bun