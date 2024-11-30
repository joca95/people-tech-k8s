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
kubectl get limitrange limit-range -n stress-demo
```

- **ResourceQuota**: Revisar manifiesto `quota.yaml`. Se limita la cantidad total de CPU, memoria, y pods que pueden ser creados en el namespace `stress-demo`.

Aplicar LimitRange
```bash
kubectl apply -f quota.yaml
```
Visualizar LimitRange
```bash
kubectl get resourcequota -n stress-demo
```
Describir LimitRange
```bash
kubectl get resourcequota resource-quota -n stress-demo
```


### Paso 2: Crear los Pods para estrés de CPU y Memoria

Ahora crearemos dos pods utilizando la imagen Docker `polinux/stress`, uno para estresar la CPU y otro para estresar la memoria.

#### 2.1 Crear el archivo YAML para los Pods de CPU y Memoria

- **Pod para estresar la CPU** (`cpu-stress-pod`): Revisar manifiesto `cpu-stress.yaml`
  - Utiliza la imagen `polinux/stress`.
  - Establece **requests** y **limits** para CPU y memoria.
  - Ejecuta el comando `stress` para estresar 1 núcleo de CPU durante 3 minutos.
- **Pod para estresar la Memoria** (`memory-stress-pod`): Revisar manifiesto `memoria-stress.yaml`
  - Similar al anterior, pero usa la opción `--vm` para crear un proceso de memoria virtual y lo hace durante 3 minutos.
  - Establece las mismas restricciones de **requests** y **limits**.

### Paso 3: Verificar el comportamiento

#### 3.1 Verificar el estado de los Pods

Puedes verificar que los pods estén corriendo con:

```bash
kubectl get pods -n stress-demo
```

#### 3.2 Ver los recursos utilizados por los Pods

Para ver cómo los **requests** y **limits** están afectando el uso de recursos, puedes usar el siguiente comando para observar los recursos de los pods:

```bash
kubectl top pod -n stress-demo
```

Este comando te mostrará el uso de CPU y memoria de los pods. En 3 minutos, deberías ver un aumento gradual en el uso de recursos, tanto en el pod de CPU como en el pod de memoria, pero limitado por los valores de **requests** y **limits** establecidos en el archivo YAML.

#### 3.3 Verificar la aplicación de los límites en los Pods

Si los pods intentan utilizar más recursos de los establecidos en sus `limits`, Kubernetes debería restringir su uso, y el pod de memoria debería ser detenido si intenta usar más memoria de la permitida, y lo mismo para el pod de CPU.

#### 3.4 Verificar el uso de **ResourceQuota**

Para ver cómo se está utilizando el **ResourceQuota** en el namespace, puedes ejecutar:

```bash
kubectl get resourcequota -n stress-demo
```

### Resumen

En este caso práctico:

1. Se creó un namespace llamado `stress-demo` con restricciones de recursos usando `LimitRange` y `ResourceQuota`.
2. Se crearon dos pods que utilizan la imagen `polinux/stress` para estresar la CPU y la memoria, respectivamente, con solicitudes (`requests`) y límites (`limits`) de recursos establecidos.
3. Se verificó el comportamiento del pod en cuanto al uso de recursos a través de los comandos `kubectl top` y `kubectl get resourcequota`.

Con esta configuración, los pods no podrán exceder los límites de CPU y memoria establecidos, y el **ResourceQuota** garantiza que no se creen más de los recursos permitidos en el namespace.