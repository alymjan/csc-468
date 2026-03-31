
FROM node:20-alpine AS frontend-builder

WORKDIR /usr/src/app/frontend


COPY frontend/package*.json ./
RUN npm install


COPY frontend/ ./

RUN npm run build 



FROM node:20-alpine

WORKDIR /usr/src/app


COPY package*.json ./
RUN npm install --omit=dev


COPY . .


COPY --from=frontend-builder /usr/src/app/frontend/build ./frontend/build


USER node

EXPOSE 3000

CMD ["npm", "start"]
