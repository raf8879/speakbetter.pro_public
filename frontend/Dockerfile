# frontend/Dockerfile
FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Собираем продакшен
RUN npm run build

# Запускаем Next.js-сервер (порт 3000 по умолчанию)
EXPOSE 3000
CMD ["npm", "run", "start"]
