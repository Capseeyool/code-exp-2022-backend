FROM node:18

COPY package.json .

RUN ["npm", "i"]

COPY . .

EXPOSE $PORT

CMD ["npm", "start"]