FROM skripsi-backend as backend

FROM node:20.16.0-alpine3.19 as frontend_build
WORKDIR /frontend
COPY ./package*.json .
RUN npm ci
COPY . .
COPY --from=backend /backend /backend
RUN npm run build

FROM nginx:1.27.0-alpine3.19 as frontend_serve
COPY --from=frontend_build /frontend/dist /usr/share/nginx/html
RUN gzip -9k $(find /usr/share/nginx/html/ -type f)
COPY ./default.conf.template /etc/nginx/templates/default.conf.template
