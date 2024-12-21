# Configuración de Balanceadores de Carga Ingress en Amazon EKS

Este documento proporciona una guía paso a paso para configurar balanceadores de carga Ingress en un clúster de Amazon EKS. Un controlador Ingress permite gestionar el tráfico HTTP y HTTPS hacia los servicios dentro del clúster.

## Prerrequisitos

Antes de comenzar, asegúrate de tener los siguientes requisitos:

1. **Cuenta de AWS**: Una cuenta activa de AWS.
2. **EKS Cluster**: Un clúster de Amazon EKS configurado y funcionando.
3. **kubectl**: La herramienta de línea de comandos `kubectl` configurada para interactuar con tu clúster de EKS.
4. **Helm**: La herramienta de gestión de paquetes Helm instalada.

## Pasos para Configurar Ingress

### 1. Instalar el Controlador Ingress

Esto se ha hecho en la sección `3.services-manifest`

### 2. Crear un Ingress Resource

Define un recurso Ingress para gestionar el tráfico HTTP/HTTPS hacia tu servicio.

#### ingress.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
  namespace: default
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/certificate-arn: <your-acm-certificate-arn>  # Opcional, para HTTPS
spec:
  rules:
    - host: example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-service
                port:
                  number: 80
```

Guarda este archivo como `ingress.yaml` y aplícalo con `kubectl`:

```sh
kubectl apply -f ingress.yaml
```

### 3. Verificar el Estado del Ingress

Verifica que el Ingress se haya creado correctamente y que se haya provisionado un ALB (Application Load Balancer).

```sh
kubectl get ingress
```

### 4. Configurar el DNS

Una vez que el ALB esté en funcionamiento, obtén la URL del ALB y configura tu DNS para apuntar a esta URL.

#### Obtener la URL del ALB

```sh
kubectl describe ingress example-ingress
```

Busca la sección `Address` para obtener la URL del ALB.

### 5. Probar el Ingress

Accede a la URL configurada en tu DNS para verificar que el tráfico se enrute correctamente a tu servicio.
