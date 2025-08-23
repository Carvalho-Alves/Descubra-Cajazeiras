FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
# Copia as pastas backend, frontend e docs explicitamente
COPY ./backend ./backend
COPY ./frontend ./frontend
COPY ./docs ./docs
EXPOSE 3333
CMD ["npm","run","dev"]
