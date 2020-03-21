FROM node:13.10-stretch-slim

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY . . 

CMD [ "node", "index.js" ]