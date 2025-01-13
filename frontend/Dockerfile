## =========================
# 1) СТАДИЯ РАЗРАБОТКИ (development)
# =========================
#FROM node:18-slim AS dev
#
#WORKDIR /app
#
## Установим зависимости для dev
#COPY package*.json ./
#RUN npm install
#
## Копируем весь код (но обычно мы будем монтировать volume локально)
#COPY . .
#
## Открываем порт для dev-сервера
#EXPOSE 3000
#
## Команда по умолчанию (для локальной разработки):
#CMD ["npm", "run", "start"]
#
#
## =========================
## 2) СТАДИЯ СБОРКИ (build)
## =========================
#FROM node:18-slim AS build
#
#WORKDIR /app
#COPY package*.json ./
#RUN npm install
#
## Копируем весь код
#COPY . .
#
## Собираем продакшен-бандл
#RUN npm run build
#
#
## =========================
## 3) СТАДИЯ ПРОДАКШЕН (production)
## =========================
#FROM nginx:alpine AS prod
#
## Удалим дефолтную конфигурацию (не обязательно, но на всякий случай)
#RUN rm /etc/nginx/conf.d/default.conf
#
## Сюда скопируем готовый build из предыдущей стадии
#COPY --from=build /app/build /usr/share/nginx/html
#
## (опционально) Добавим свой конфиг, если нужно
## COPY nginx.conf /etc/nginx/conf.d
#
#EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]
# frontend/Dockerfile (пример уже у вас)



###################
# 1) STAGE: build
FROM node:18-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build  # создаём prod-бандл

# 2) STAGE: prod
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
