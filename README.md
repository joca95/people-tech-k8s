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


### 9. **Acceder al backend en Minikube**

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
    name: "SwiftX Laptop",
    description: "A powerful laptop with the latest processor, perfect for gaming and work-related tasks.",
    category: "Electronics",
    model: "SLT-3080"
  },
  {
    name: "CleanPro Vacuum Cleaner",
    description: "A high-efficiency vacuum cleaner designed to tackle tough dirt and debris on all surfaces.",
    category: "Home Appliances",
    model: "CPVC-2500"
  },
  {
    name: "ComfortPro Office Chair",
    description: "An ergonomic office chair with adjustable lumbar support, designed for long hours of comfort.",
    category: "Furniture",
    model: "CPOC-820"
  },
  {
    name: "EcoFresh Refrigerator",
    description: "A spacious refrigerator with energy-efficient cooling technology and a sleek, modern design.",
    category: "Home Appliances",
    model: "EFRC-4550"
  },
  {
    name: "ProCamera 4K",
    description: "A 4K action camera with ultra-wide lens, waterproof capabilities, and advanced stabilization.",
    category: "Electronics",
    model: "PC4K-1080"
  },
  {
    name: "FitTrack Smart Scale",
    description: "A smart scale that measures weight, body fat percentage, muscle mass, and more via a mobile app.",
    category: "Fitness",
    model: "FTSS-100"
  },
  {
    name: "ThunderBass Speakers",
    description: "High-powered wireless speakers delivering deep bass and clear sound for an enhanced music experience.",
    category: "Audio",
    model: "TBS-9800"
  },
  {
    name: "QuickCook Air Fryer",
    description: "An air fryer that cooks food quickly and evenly, with little to no oil for healthier meals.",
    category: "Kitchen Appliances",
    model: "QCAF-600"
  },
  {
    name: "SmartHome Thermostat",
    description: "A smart thermostat that learns your schedule and adjusts the temperature for optimal comfort and energy savings.",
    category: "Smart Home",
    model: "SHT-1000"
  }
]
```


### 10. **Notas finales**

- Asegúrate de que todos los archivos de configuración (`postgres.yaml`, `backend.yaml`, etc.) estén correctamente configurados antes de aplicarlos.
- Si usas Minikube, recuerda que necesitas iniciar Minikube antes de intentar acceder a los servicios (`minikube start`).



