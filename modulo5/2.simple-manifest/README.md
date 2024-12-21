# Despliegue de Aplicaciones con Kubernetes

Este documento describe cómo desplegar dos aplicaciones (NGINX y Tetris) en un clúster de Kubernetes, usando manifiestos YAML y la herramienta `kubectl`.

## Prerequisitos

1. **Kubernetes Cluster**: Asegúrate de tener un clúster de Kubernetes en funcionamiento.
2. **kubectl**: Instala y configura `kubectl` para interactuar con tu clúster.

## Despliegue de NGINX

### Crear el Pod de NGINX
**Aplicar el Manifiesto**:
Utiliza el siguiente comando para crear el pod en el clúster:
```sh
kubectl apply -f /path/to/nginx-pod.yaml
```

### Exponer el Pod de NGINX

1. **Usar Port-Forward**:
Utiliza el siguiente comando para exponer el pod en tu máquina local:
```sh
kubectl port-forward pod/nginx-pod 8080:80
```

2. **Acceder a la Aplicación**:
Abre tu navegador web y ve a `http://localhost:8080`.

## Despliegue de Tetris

### Crear el Pod de Tetris

**Aplicar el Manifiesto**:
Utiliza el siguiente comando para crear el pod en el clúster:
```sh
kubectl apply -f /path/to/tetris-pod.yaml
```

### Exponer el Pod de Tetris

1. **Usar Port-Forward**:
Utiliza el siguiente comando para exponer el pod en tu máquina local:
```sh
kubectl port-forward pod/tetris-pod 8080:3000
```

2. **Acceder a la Aplicación**:
Abre tu navegador web y ve a `http://localhost:8080`.



### Eliminar recursos
```sh
kubectl delete -f .
```