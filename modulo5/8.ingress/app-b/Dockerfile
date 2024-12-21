# Usa una imagen base de Python
FROM python:3.9-slim

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el archivo requirements.txt en el directorio de trabajo
COPY requirements.txt .

# Instala las dependencias
RUN pip install -r requirements.txt

# Copia el resto de los archivos de la aplicación en el directorio de trabajo
COPY . .

# Expone el puerto en el que correrá la aplicación
EXPOSE 5000

# Define el comando para correr la aplicación
CMD ["python", "app.py"]