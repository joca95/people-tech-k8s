# Configuración del Escalado Automático de Pods Horizontal (HPA) en Kubernetes

Este documento proporciona una guía paso a paso para configurar el escalado automático de pods horizontal (Horizontal Pod Autoscaler, HPA) en un clúster de Kubernetes.

## Prerequisitos

1. **Kubernetes Cluster**: Asegúrate de tener un clúster de Kubernetes en funcionamiento.
2. **kubectl**: Instala y configura `kubectl` para interactuar con tu clúster de Kubernetes.
3. **Metrics Server**: El HPA requiere el Metrics Server para obtener las métricas de uso de recursos del clúster.

## Instalación del Metrics Server

1. **Instalar Metrics Server**:
Descarga y aplica el manifiesto de Metrics Server desde el repositorio oficial:

```sh
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

2. **Verificar la Instalación**:
Asegúrate de que el Metrics Server esté funcionando correctamente:

```sh
kubectl get deployment metrics-server -n kube-system
```

Deberías ver un despliegue en estado `AVAILABLE`.

## Despliegue de una Aplicación de Ejemplo

1. **Crear una Aplicación de Ejemplo**:
Vamos a desplegar una aplicación de ejemplo, en este caso, un despliegue de php.
Aplica el siguiente comando.
```sh
kubectl create deployment php-apache --image=us.gcr.io/k8s-artifacts-prod/hpa-example
kubectl set resources deploy php-apache --requests=cpu=400m
kubectl expose deploy php-apache --port 80
kubectl get pod -l app=php-apache
```

## Configuración del Escalado Automático de Pods Horizontal (HPA)

1. **Crear el HPA**:
Vamos a crear un HPA que escalará el despliegue de PHPApache basado en el uso de CPU.
Aplicar el manifiesto
```sh
kubectl apply -f 1.hpa.yaml
```

2. **Verificar el HPA**:
Asegúrate de que el HPA esté configurado y funcionando correctamente:

```sh
kubectl get hpa
```

Deberías ver una salida que muestre el HPA y su estado actual.

## Prueba del HPA

Para probar el HPA, genera carga en la aplicación para observar cómo se escala el número de réplicas.

1. **Generar Carga**:
Puedes usar la herramienta `kubectl run` para generar carga en los pods de NGINX:

```sh
kubectl run -i --tty load-generator --image=busybox /bin/sh
```

Una vez dentro del contenedor `load-generator`, ejecuta el siguiente comando para generar tráfico:

```sh
while true; do wget -q -O - http://php-apache; done
```

2. **Observar el Escalado**:
Monitorea el HPA para ver cómo ajusta el número de réplicas en función de la carga:

```sh
kubectl get hpa -w
```

Deberías ver el HPA ajustando el número de réplicas del despliegue de NGINX en función de la carga generada.
