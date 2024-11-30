# Usa una imagen base de Python
FROM python:3.10-slim

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el archivo Python al contenedor
COPY memory_stress.py .

# Instala la librería psutil
RUN pip install psutil

# Comando para ejecutar el script
CMD ["python", "memory_stress.py"]
