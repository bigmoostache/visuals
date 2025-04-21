FROM node:latest

WORKDIR /app 

COPY /.eslintrc.json /app/.eslintrc.json
COPY /next.config.mjs /app/next.config.mjs
COPY /package-lock.json /app/package-lock.json
COPY /components.json /app/components.json
COPY /package.json /app/package.json
COPY /postcss.config.mjs /app/postcss.config.mjs
COPY /tsconfig.json /app/tsconfig.json
COPY /tailwind.config.ts /app/tailwind.config.ts
COPY /tsconfig.json /app/tsconfig.json

RUN npm ci

COPY /src /app/src
COPY /public /app/public

RUN npm run build

CMD [ "npm", "start"]