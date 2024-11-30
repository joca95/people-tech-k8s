## **Contexto del caso práctico**
### Escenario:
- Una empresa tiene un clúster compartido donde múltiples equipos despliegan aplicaciones.
- El equipo "Frontend" y el equipo "Backend" tienen restricciones diferentes para el uso de recursos:
  - **Frontend**: Máximo de 1 CPU y 1 GiB de memoria por Pod.
  - **Backend**: Máximo de 2 CPUs y 4 GiB de memoria por Pod.
- El clúster tiene un límite total de recursos que cada equipo puede usar:
  - **Frontend**: Máximo de 4 CPUs y 4 GiB de memoria en total.
  - **Backend**: Máximo de 8 CPUs y 16 GiB de memoria en total.

---
## **Requisitos Previos**
### Instalar API de Metricas
Instalar el Api de métrica de kubernetes
```shell
wget https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```
Editar Deployment `metrics-server` agregando la siguiente línea en arg.
```yaml
- --kubelet-insecure-tls
```
Aplicar componentes de metric server:
```shell
kubectl apply -f components.yaml
```


## **Paso 1: Crear Namespaces**
Creamos un namespace para cada equipo, revisar el manifiesto `namespaces.yaml`

Ejecutar el comando:
```shell
kubectl apply -f namespaces.yaml
```

---

## **Paso 2: Configurar ResourceQuota**
Limitamos los recursos totales que cada equipo puede consumir en su namespace.

### ResourceQuota para "frontend" y "backend":
Revisar el manifiesto `quotas.yaml`

Ejecutar el comando:
```shell
kubectl apply -f quotas.yaml
```

---

## **Paso 3: Configurar LimitRange**
Definimos los límites predeterminados y máximos para Pods en cada namespace.

### LimitRange para "frontend" y "backend":

Revisar el manifiesto `limits-range.yaml`

Ejecutar el comando:
```shell
kubectl apply -f limits-range.yaml
```

---

## **Paso 4: Crear Pods con Requests & Limits**
Desplegamos Pods en cada namespace para observar cómo se aplican las restricciones.

### Pod para "frontend" y "backend":
- El Pod frontend solicita 250m de CPU y 256Mi de memoria, y tiene un límite de 500m y 512Mi.
- El Pod backend solicita 1 CPU y 1 GiB de memoria, y tiene un límite de 2 CPUs y 2 GiB.

Revisar el manifiesto `pods.yaml`

Ejecutar el comando:
```shell
kubectl apply -f pods.yaml
```

---

## **Validación**

### 1. Validar ResourceQuota:
Comprueba si los Pods respetan los límites totales del namespace.

```bash
kubectl describe resourcequota frontend-quota -n frontend
kubectl describe resourcequota backend-quota -n backend
```

### 2. Validar LimitRange:
Comprueba si los Pods respetan los límites por contenedor.

```bash
kubectl describe limitrange frontend-limits -n frontend
kubectl describe limitrange backend-limits -n backend
```

### 3. Simular violaciones:
Intenta crear un Pod que supere los límites configurados. Por ejemplo en el Pod `frontend` solicitar 2 CPU y 2GB de Memoria y como límites 3 CPUs y 3GB de Memoria.

Revisar el manifiesto `pod-frontend-oversized.yaml`

**Ejemplo (fallará):**
Ejecutar el comando:
```shell
kubectl apply -f pod-frontend-oversized.yaml
```

Error esperado:
```
Error from server (Forbidden): Resource requests/limits exceed the quota
```