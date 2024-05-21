# Use a Node.js base image
FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD npm start