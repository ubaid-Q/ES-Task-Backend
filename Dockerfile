FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN npm run build

EXPOSE 4000

CMD ["node", "dist/main"]
