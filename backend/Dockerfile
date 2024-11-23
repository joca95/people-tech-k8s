# Imagen base
FROM node:16-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar archivos
COPY package*.json ./
COPY server.js ./

# Instalar dependencias
RUN npm install

# Exponer el puerto
EXPOSE 5000

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]