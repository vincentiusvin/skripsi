FROM node:20.16.0-alpine3.19 as backend
WORKDIR /backend
COPY ./package*.json .
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
