FROM node:latest

ADD . /app
WORKDIR /app
CMD ["npm", "install"]
CMD ["node_modules/.bin/gulp", "compile"]

WORKDIR /app/dist
EXPOSE 8080
CMD ["node", "server.js"]
