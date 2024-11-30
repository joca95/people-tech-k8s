Este caso práctico cubrirá lo siguiente:

1. **Desplegar el Ingress Controller**.
2. **Crear un servicio NGINX**.
3. **Configurar un recurso Ingress** para exponer la aplicación.
4. **Acceder a la aplicación desde el navegador**.

### **Paso 1: Desplegar el Ingress Controller**

Un Ingress Controller es necesario para que Kubernetes pueda gestionar y redirigir el tráfico HTTP y HTTPS hacia los servicios internos del clúster basándose en las reglas definidas en los recursos **Ingress**.

#### Crear el namespace

Primero, crea el namespace donde se desplegará el Ingress Controller. Si no lo tienes ya, puedes crear uno:

```bash
kubectl create namespace ingress-nginx
```

#### Crear los recursos necesarios

A continuación, puedes crear los archivos de configuración para desplegar el Ingress Controller NGINX en Kubernetes. Para ello, descarga los manifiestos de instalación de NGINX desde el repositorio oficial de NGINX Ingress Controller en GitHub o crea los archivos manualmente.

##### 2.1. Descargar los manifiestos de NGINX Ingress Controller

Puedes obtener los archivos de manifiestos directamente desde el repositorio oficial de NGINX Ingress Controller:

```bash
curl -o nginx-ingress-controller.yaml https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

##### 2.2. Modificar el archivo `nginx-ingress-controller.yaml`

Este archivo incluye todos los recursos necesarios para desplegar el Ingress Controller NGINX. Si deseas, puedes modificar el archivo `nginx-ingress-controller.yaml` para personalizar la configuración (por ejemplo, cambiar el `service` a `LoadBalancer` si deseas una IP pública para acceder al controlador).

##### 2.3. Aplicar los archivos de manifiestos

Aplica el manifiesto para desplegar el Ingress Controller:

```bash
kubectl apply -f nginx-ingress-controller.yaml
```

#### Verificar el despliegue

Una vez que los recursos se hayan creado, puedes verificar que el NGINX Ingress Controller esté desplegado y en funcionamiento:

```bash
kubectl get pods -n ingress-nginx
```

Deberías ver uno o más pods del Ingress Controller en el estado `Running`.

##### Verificar el servicio:

```bash
kubectl get svc -n ingress-nginx
```

Si el servicio está configurado como `LoadBalancer`, después de un momento debería aparecer una dirección IP pública que puedes usar para acceder a tu Ingress Controller.


### **Paso 2: Crear el Servicio NGINX**

Para este ejemplo, usaremos NGINX como aplicación que queremos exponer mediante el Ingress. Crea un archivo YAML para desplegar un `Deployment` de NGINX y un `Service` que lo exponga dentro del clúster.

**nginx-deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP
```

Este archivo YAML define:
- **Deployment**: Despliega NGINX en 2 réplicas.
- **Service**: Exponen el puerto 80 del contenedor a un puerto 80 en el clúster, lo que permite que el tráfico se redirija desde el Ingress Controller.

Despliega el archivo en tu clúster de Kubernetes con el siguiente comando:

```bash
kubectl apply -f nginx-deployment.yaml
```

### **Paso 3: Crear el recurso Ingress**

Ahora que tenemos el Ingress Controller y el servicio NGINX desplegados, crearemos un recurso **Ingress** que defina cómo dirigir el tráfico HTTP hacia el servicio NGINX.

**nginx-ingress.yaml**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress
spec:
  rules:
  - host: example.com  # El nombre de dominio para acceder al servicio
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx-service
            port:
              number: 80
```

En este archivo:
- **`host`**: Define el nombre de dominio al que se accederá. Para este caso es `example.com`. Asegúrate de actualizar tu archivo de hosts o usar un dominio válido que apunte a la IP del servicio LoadBalancer del Ingress Controller.
- **`path`**: Define las rutas a las que se redirigirán las solicitudes. En este caso, todas las solicitudes a `/` serán enviadas al servicio `nginx-service` en el puerto 80.

Aplica el archivo del recurso **Ingress**:

```bash
kubectl apply -f nginx-ingress.yaml
```

### **Paso 4: Verificar el acceso a la aplicación**

Una vez que todo esté desplegado, necesitas obtener la IP externa del Ingress Controller. Si usaste el tipo **LoadBalancer** para el servicio del Ingress Controller, puedes obtener la IP de la siguiente manera:

```bash
kubectl get svc -n ingress-nginx
```

Busca la IP en la columna **EXTERNAL-IP**. Si estás usando un entorno como Minikube o Kind, puedes obtener la URL con:

```bash
minikube service ingress-nginx-controller --url
```

Después de obtener la IP del Ingress Controller, puedes agregar una entrada en tu archivo de hosts para que `example.com` apunte a esa IP. Si no estás utilizando un dominio real, puedes agregar la IP al archivo `/etc/hosts` (o en Windows, al archivo `C:\Windows\System32\drivers\etc\hosts`):

```plaintext
<External-IP> example.com
```

Luego, abre tu navegador y visita `http://example.com`. Deberías ver la página de inicio de NGINX, lo que significa que el tráfico ha sido redirigido correctamente desde el Ingress hacia el servicio NGINX en tu clúster.

### **Paso 5: Escalabilidad (Opcional)**

Si deseas probar la escalabilidad, puedes aumentar el número de réplicas de tu Deployment de NGINX para simular la alta disponibilidad. Edita el número de réplicas en el archivo YAML de Deployment y aplícalo nuevamente:

```yaml
spec:
  replicas: 5  # Aumentar a 5 réplicas
```

Y luego aplica los cambios:

```bash
kubectl apply -f nginx-deployment.yaml
```

Con esto, tu aplicación NGINX ahora debería estar distribuida en 5 Pods, y el Ingress Controller se encargará de enrutar el tráfico a cualquiera de estos Pods.

---
