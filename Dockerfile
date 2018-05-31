FROM node:4
MAINTAINER patricio_chavez@hotmail.com
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app
CMD [ "node", "index.js" ]

