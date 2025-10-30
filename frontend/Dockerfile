FROM node:20

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia solo los archivos de dependencias primero
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia TODO el código del frontend al contenedor
COPY . .

# Expone el puerto 3000
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "start"]
