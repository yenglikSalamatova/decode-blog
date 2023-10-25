# Используем базовый образ Node.js
FROM node


# Создание директории приложения
WORKDIR /app

# Cache for node modules
COPY package*.json .

# Установка зависимостей Node.js
RUN npm ci

# Копирование файлов приложения
COPY . .

# Открытие порта для Node.js приложения
EXPOSE 3000

# Команда запуска MongoDB и Node.js приложения
CMD ["node", "server.js"]
