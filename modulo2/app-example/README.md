# README - Kubernetes Deployment for `k8s-peopletech-back`

Este documento proporciona los pasos necesarios para construir, etiquetar, subir una imagen de Docker a un repositorio, y desplegarla en Kubernetes usando `kubectl`.

### 1. **Construir la imagen de Docker**

Para comenzar, construimos la imagen de Docker usando el archivo `Dockerfile` que debe estar en el directorio actual.

Ubicarnos en la carpeta `./backend`

```bash
docker build -t joca95/k8s-peopletech-back .
```

- **Explicación**: Este comando construye la imagen de Docker con el nombre `joca95/k8s-peopletech-back`.

### 2. **Etiquetar la imagen**

Una vez que la imagen esté construida, podemos etiquetarla para una versión específica.

```bash
docker tag joca95/k8s-peopletech-back:latest joca95/k8s-peopletech-back:joca-01
```

- **Explicación**: Este comando etiqueta la imagen de Docker con la versión `joca-01`.

### 3. **Subir la imagen al repositorio de Docker**

A continuación, subimos la imagen etiquetada al repositorio de Docker.

```bash
docker push joca95/k8s-peopletech-back:joca-01
```

- **Explicación**: Este comando sube la imagen `joca95/k8s-peopletech-back:joca-01` al repositorio de Docker.


### 4. **Configurar Kubernetes**

Antes de crear los recursos de Kubernetes, creamos un nuevo namespace y verificamos que esté disponible.

Ubicarnos en la carpeta `./manifest`

#### Crear un Namespace

```bash
kubectl create namespace app
```

- **Explicación**: Esto crea un nuevo namespace llamado `app` en Kubernetes para organizar los recursos.

#### Verificar los namespaces

```bash
kubectl get namespaces
```

- **Explicación**: Este comando muestra todos los namespaces disponibles en Kubernetes.


### 5. **Desplegar PostgreSQL en Kubernetes**

Aplicamos el archivo de configuración `postgres.yaml` para desplegar el servicio de base de datos PostgreSQL.

```bash
kubectl apply -f postgres.yaml
```

- **Explicación**: Este comando crea los recursos necesarios para PostgreSQL en el namespace `app`.

#### Verificar los recursos de PostgreSQL

```bash
kubectl get all -n app
```

- **Explicación**: Este comando muestra todos los recursos desplegados dentro del namespace `app`, incluyendo pods, servicios y despliegues.


### 6. **Desplegar el backend en Kubernetes**

Aplicamos el archivo de configuración `backend.yaml` para desplegar el backend de la aplicación.

```bash
kubectl apply -f backend.yaml
```

- **Explicación**: Este comando crea los recursos para el backend en Kubernetes dentro del namespace `app`.

#### Verificar los pods del backend

```bash
kubectl get pods -n app
```

- **Explicación**: Este comando muestra los pods del backend en el namespace `app`.

#### Ver los detalles de un pod específico

```bash
kubectl describe pod/backend-xxxx-xxxx -n app
```

- **Explicación**: Este comando muestra detalles sobre el pod del backend especificado.


### 7. **Actualizar la imagen del backend**

Si necesitas actualizar la imagen de Docker del backend, puedes usar el siguiente comando:

```bash
kubectl set image deployment/backend backend=joca95/k8s-peopletech-back:joca-01 -n app
```

- **Explicación**: Este comando actualiza el deployment del backend para usar la nueva versión de la imagen `joca95/k8s-peopletech-back:joca-01`.


### 8. **Verificar despliegues y servicios en Kubernetes**

#### Ver los despliegues

```bash
kubectl get deployments -n app
```

- **Explicación**: Este comando muestra todos los deployments en el namespace `app`.

#### Ver los servicios

```bash
kubectl get svc -n app
```

- **Explicación**: Este comando muestra todos los servicios en el namespace `app`.

#### Ver todos los recursos en todos los namespaces

```bash
kubectl get all --all-namespaces
```

- **Explicación**: Este comando muestra todos los recursos en todos los namespaces de Kubernetes.

### 9. **Prueba de Acceso al Service Backend de Tipo ClusterIP**

#### Crear un Pod de Prueba

Para verificar la conectividad interna hacia el Service de tipo `ClusterIP`, crea un Pod usando una imagen `busybox` que incluye herramientas de conectividad.

```bash
kubectl run test-pod --rm -it --image=busybox -- /bin/sh
#wget -qO- <service-ip>:5000/api/products
#wget -qO- <service-name>.<namespace>:5000/api/products
wget -qO- backend.app:5000/api/products
```

- **Explicación**: Este comando inicia un Pod temporal para probar el acceso al servicio backend. Si puedes realizar una solicitud a la API del backend desde este Pod, significa que el Service de tipo `ClusterIP` está funcionando correctamente dentro del clúster.

#### Verificar la IP del Nodo Trabajador

Si deseas probar la conectividad desde fuera del clúster:

1. Obtén la IP del nodo trabajador:

```bash
kubectl get nodes -o wide
```

2. Intenta realizar una solicitud `curl`:

```bash
curl <workernode-ip>:5000/api/products
```

- **Nota**: Este comando fallará porque el Service de tipo `ClusterIP` no está expuesto externamente. Solo se puede acceder desde dentro del clúster.

#### Usar Port-Forward para Pruebas Externas

Para pruebas temporales desde fuera del clúster, puedes usar `port-forward`:

```bash
kubectl -n app port-forward --address 0.0.0.0 service/backend 5000:5000
```

- **Explicación**: Este comando redirige el puerto 5000 del Service backend al puerto local 5000 para permitir el acceso externo temporal.

### 10. **Modificar el Service Backend a Tipo NodePort**

Para exponer el Service backend externamente de manera permanente:

1. Edita el manifiesto `backend.yaml` y:

- Cambia la versión de la imagen del contenedor.
- Cambia el tipo del Service a `NodePort`.
- Descomenta las líneas correspondientes al tipo y los puertos del Service.

2. Aplica el manifiesto actualizado:

```bash
kubectl apply -f backend.yaml
```

#### Verificar el Service Modificado

1. Comprueba que el Service ahora es de tipo `NodePort`:

```bash
kubectl get svc -n app
```

- **Explicación**: Esto mostrará los detalles del Service, incluyendo el puerto externo asignado (por ejemplo, `30001`).

2. Obtén la IP del nodo trabajador:

```bash
kubectl get nodes -o wide
```

3. Prueba el acceso externo:

```bash
curl <workernode-ip>:30001/api/products
```

- **Explicación**: Ahora el Service backend debería estar accesible externamente a través del puerto asignado.

### 11 **Hacer Rollback de un Deployment**

Si necesitas volver a una versión anterior del Deployment:

```bash
kubectl rollout undo deployment backend
```

- **Explicación**: Este comando revierte el Deployment `backend` a la versión anterior, utilizando el historial almacenado por Kubernetes.

### 12 **Conexión entre Namespaces**

#### Crear un Nuevo Namespace
Para separar recursos y facilitar la administración, crearemos un nuevo namespace llamado `bd`:

```bash
kubectl create namespace bd
```

- **Explicación**: Esto crea un espacio de nombres `bd` dentro del clúster de Kubernetes, donde residirá la configuración de la base de datos PostgreSQL.

#### Modificar el Namespace en los Archivos de Configuración
1. Abre el archivo `postgres.yaml` y actualiza el campo `namespace` para que sea `bd`.
2. Aplica el manifiesto:

```bash
kubectl apply -f postgres.yaml
```

- **Explicación**: Este comando despliega PostgreSQL en el nuevo namespace `bd`.

3. Modifica el archivo `backend.yaml` para actualizar la variable de entorno `PGHOST`. Cambia su valor a `postgres.bd`, que combina el nombre del servicio PostgreSQL y el namespace `bd`.
4. Aplica el manifiesto del backend:

```bash
kubectl apply -f backend.yaml
```

- **Explicación**: Este comando asegura que el backend pueda conectarse a la base de datos en el namespace correcto.

#### Verificar la Conexión
Accede a la aplicación y confirma que está conectada a una nueva base de datos limpia en el namespace `bd`.

### 13. **Acceder al backend en Minikube**

Si estás utilizando Minikube para tu clúster de Kubernetes local, puedes obtener la IP de Minikube y la lista de servicios.

#### Obtener la IP de Minikube

```bash
minikube ip
```

- **Explicación**: Este comando devuelve la IP de Minikube, que puedes usar para acceder a los servicios de Kubernetes localmente.

#### Ver los servicios de Minikube

```bash
minikube service list
```

- **Explicación**: Este comando muestra todos los servicios expuestos en Minikube.

#### Acceder al servicio del backend

```bash
minikube service backend -n app
```

- **Explicación**: Este comando abre un túnel para acceder al servicio `backend` en el namespace `app` de Minikube.

#### Datos de prueba para el API

```json
[
  {
    "name": "SwiftX Laptop",
    "description": "A powerful laptop with the latest processor, perfect for gaming and work-related tasks.",
    "category": "Electronics",
    "model": "SLT-3080"
  },
  {
    "name": "CleanPro Vacuum Cleaner",
    "description": "A high-efficiency vacuum cleaner designed to tackle tough dirt and debris on all surfaces.",
    "category": "Home Appliances",
    "model": "CPVC-2500"
  },
  {
    "name": "ComfortPro Office Chair",
    "description": "An ergonomic office chair with adjustable lumbar support, designed for long hours of comfort.",
    "category": "Furniture",
    "model": "CPOC-820"
  },
  {
    "name": "EcoFresh Refrigerator",
    "description": "A spacious refrigerator with energy-efficient cooling technology and a sleek, modern design.",
    "category": "Home Appliances",
    "model": "EFRC-4550"
  },
  {
    "name": "ProCamera 4K",
    "description": "A 4K action camera with ultra-wide lens, waterproof capabilities, and advanced stabilization.",
    "category": "Electronics",
    "model": "PC4K-1080"
  },
  {
    "name": "FitTrack Smart Scale",
    "description": "A smart scale that measures weight, body fat percentage, muscle mass, and more via a mobile app.",
    "category": "Fitness",
    "model": "FTSS-100"
  },
  {
    "name": "ThunderBass Speakers",
    "description": "High-powered wireless speakers delivering deep bass and clear sound for an enhanced music experience.",
    "category": "Audio",
    "model": "TBS-9800"
  },
  {
    "name": "QuickCook Air Fryer",
    "description": "An air fryer that cooks food quickly and evenly, with little to no oil for healthier meals.",
    "category": "Kitchen Appliances",
    "model": "QCAF-600"
  },
  {
    "name": "SmartHome Thermostat",
    "description": "A smart thermostat that learns your schedule and adjusts the temperature for optimal comfort and energy savings.",
    "category": "Smart Home",
    "model": "SHT-1000"
  }
]
```

### 14. **Notas finales**

- Asegúrate de que todos los archivos de configuración (`postgres.yaml`, `backend.yaml`, etc.) estén correctamente configurados antes de aplicarlos.
- Si usas Minikube, recuerda que necesitas iniciar Minikube antes de intentar acceder a los servicios (`minikube start`).


kubeadm init --apiserver-advertise-address $(hostname -i) --pod-network-cidr 10.5.0.0/16
 
kubectl apply -f https://raw.githubusercontent.com/cloudnativelabs/kube-router/master/daemonset/kubeadm-kuberouter.yaml
 
kubectl taint nodes node1 node-role.kubernetes.io/control-plane-
 
kubectl apply -f https://raw.githubusercontent.com/kubernetes/website/master/content/en/examples/application/nginx-app.yaml
 
kubectl delete -f https://raw.githubusercontent.com/kubernetes/website/master/content/en/examples/application/nginx-app.yaml
