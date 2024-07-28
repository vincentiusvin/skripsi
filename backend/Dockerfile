FROM node:20.16.0-alpine3.19 as backend
WORKDIR /backend
COPY . .
RUN npm ci
RUN npm run build
CMD ["npm", "run", "start:prod"]
