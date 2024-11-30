### Requisitos Previos
#### Utlizar un cluster con suficientes recursos

#### Instalar API de Métricas de Kubernetes
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
Visualizar la creación de componentes:
```bash
kubectl get all -l k8s-app=metrics-server -n kube-system
```

Depués de unos minutos el API estará listo sirviendo métricas de nodos y pods.
```shell
kubectl top nodes
```

```shell
kubectl top pod
```

### Paso 1: Crear un Namespace con LimitRange y ResourceQuota

Primero, vamos a crear un **namespace** en Kubernetes donde aplicaremos los controles de recursos mediante `LimitRange` y `ResourceQuota`.

#### 1.1 Crear el archivo YAML para el `Namespace`, `LimitRange` y `ResourceQuota`

- **Namespace**: Revisar manifiesto `namespace.yaml`, `stress-demo` es el namespace donde vamos a aplicar los límites.
Aplicar Namespace
```bash
kubectl apply -f namespace.yaml
```
Visualizar Namespace
```bash
kubectl get namespaces
```
- **LimitRange**: Revisar manifiesto `limitrange.yaml`
  - Se especifican límites máximos y mínimos de recursos para CPU y memoria por contenedor.
  - Se establecen valores predeterminados y de solicitud de recursos para los contenedores sin especificaciones.

Aplicar LimitRange
```bash
kubectl apply -f limitrange.yaml
```
Visualizar LimitRange
```bash
kubectl get limitrange -n stress-demo
```
Describir LimitRange
```bash
kubectl describe limitrange limit-range -n stress-demo
```

- **ResourceQuota**: Revisar manifiesto `quota.yaml`. Se limita la cantidad total de CPU, memoria, y pods que pueden ser creados en el namespace `stress-demo`.

Aplicar Quota
```bash
kubectl apply -f quota.yaml
```
Visualizar Quota
```bash
kubectl get resourcequota -n stress-demo
```
Describir Quota
```bash
kubectl describe resourcequota resource-quota -n stress-demo
```


### Paso 3: Crear varios Pods

Crear Pod1 con nginx
```bash
kubectl run pod1 --image=nginx:alpine -n stress-demo
```

Crear Pod2 con nginx
```bash
kubectl run pod2 --image=nginx:alpine -n stress-demo
```

Crear Pod3 con nginx
```bash
kubectl run pod3 --image=nginx:alpine -n stress-demo
```

Debe salir error
```
Error from server (Forbidden): pods "pod3" is forbidden: exceeded quota: resource-quota, requested: limits.cpu=500m,pods=1, used: limits.cpu=1,pods=2, limited: limits.cpu=1,pods=2
```

Delete Pod2
```bash
kubectl delete pod pod2 -n stress-demo
```

Crear Pod2 con nginx con solicitando 3 CPUs
```bash
kubectl apply -f pod-3cpu.yaml
```

Debe salir error
```
The Pod "pod2" is invalid: spec.containers[0].resources.requests: Invalid value: "3": must be less than or equal to cpu limit of 500m
```

### Paso 3: Crear los Pods para estrés de CPU y Memoria

Ahora crearemos dos pods utilizando la imagen Docker `polinux/stress`, uno para estresar la CPU y otro para estresar la memoria.

#### 3.1 Crear el archivo YAML para los Pods de CPU y Memoria

- **Pod para estresar la CPU** (`cpu-stress-pod`): Revisar manifiesto `cpu-stress.yaml`
  - Utiliza la imagen `polinux/stress`.
  - Establece **requests** y **limits** para CPU y memoria.
  - Ejecuta el comando `stress` para estresar 1 núcleo de CPU durante 3 minutos.


Aplicar Pod
```bash
kubectl apply -f cpu-stress.yaml
```
Nos mostrará un error debido al ResourceQuota definido en este namespace
```
Error from server (Forbidden): error when creating "cpu-stress.yaml": pods "cpu-stress-pod" is forbidden: maximum cpu usage per Container is 1, but limit is 2
```

- **Pod para estresar la Memoria** (`memory-stress-pod`): Revisar manifiesto `memoria-stress.yaml`
  - Ejecutará un script en python que consumirá la memoria del pod
  - Establece las mismas restricciones de **requests** y **limits**.


Aplicar Pod
```bash
kubectl apply -f memoria-stress.yaml
```
Visualizar Pod
```bash
kubectl get pod -n stress-demo
```
Revisar Métricas Pod
```bash
kubectl top pod -n stress-demo
```

Visualizar Quota
```bash
kubectl get resourcequota -n stress-demo
```
Describir Quota
```bash
kubectl describe resourcequota resource-quota -n stress-demo
```