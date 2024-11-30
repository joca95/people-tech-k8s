### 1. **ConfigMap para PostgreSQL**

Primero, creamos el ConfigMap que tendrá el nombre de la base de datos y el puerto.

#### Paso 1: Crear el ConfigMap para PostgreSQL

Definir el ConfigMap para la base de datos, revisar el manifiseto `configmap-bd.yaml`

Este ConfigMap almacena dos variables: el nombre de la base de datos (`POSTGRES_DB`) y el puerto (`POSTGRES_PORT`).

Aplicar ConfigMap:
```bash
kubectl apply -f configmap-bd.yaml
```

Visualizar ConfigMap:
```bash
kubectl get configmap
```

Describe ConfigMap:
```bash
kubectl describe configmap postgres-config
```

#### Paso 2: Crear el Secreto para la contraseña

Ahora, creamos el **Secreto** que almacenará la contraseña de la base de datos. La contraseña se debe codificar en base64 o puedes usar herramientas de Kubernetes para hacerlo automáticamente.

```bash
echo -n "My*P455w0rd" | base64
```

Esto devolverá una cadena base64, que usaremos en el archivo del Secreto, revisar manifiesto `secret-db.yaml`

Aplicar Secret:
```bash
kubectl apply -f secret-bd.yaml
```

Visualizar Secret:
```bash
kubectl get secret
```

Describe Secret:
```bash
kubectl describe secret postgres-secret
```

#### Paso 3: Configurar el Pod de PostgreSQL

Ahora, configuramos el Pod de PostgreSQL para que use el **ConfigMap** y el **Secreto** como variables de entorno, revisar el manifiesto `postgres.yaml`.

En este archivo YAML:
- El **ConfigMap** se referencia con `env` para cargar `POSTGRES_DB` y `POSTGRES_PORT` como variables de entorno.
- El **Secreto** se referencia también con `env` para cargar `POSTGRES_PASSWORD` como variable de entorno.

Aplicar Pod:
```bash
kubectl apply -f postgres.yaml
```

Visualizar Pod:
```bash
kubectl get pod
```

Visualizar Pod:
```bash
kubectl describe pod postgres
```

Visualizar Variables de entorno dentro del contenedor
```bash
kubectl exec -it postgres -- sh
echo $POSTGRES_DB
echo $POSTGRES_PORT
echo $POSTGRES_PASSWORD
```

### 2. **Otro Pod para Archivos de Configuración (usando ConfigMap)**

Ahora, vamos a crear otro Pod que sirva de configuración para archivos de configuración adicionales. Este Pod se montará con un **ConfigMap** que contiene archivos de configuración.

#### Paso 1: Crear el ConfigMap para los archivos de configuración

Supongamos que quieres incluir dos archivos de configuración en tu ConfigMap, revisar el manifiseto `file-configmap.yaml`

Aplicar ConfigMap:
```bash
kubectl apply -f file-configmap.yaml
```

Visualizar ConfigMap:
```bash
kubectl get configmap
```

Describe ConfigMap:
```bash
kubectl describe configmap app-config
```

#### Paso 2: Crear el Pod que monta el ConfigMap

Este es el Pod que monta el **ConfigMap** con los archivos de configuración como un volumen, revisar el manifiesto `pod.yaml`.

Aplicar Pod:
```bash
kubectl apply -f pod.yaml
```

Visualizar Pod:
```bash
kubectl get pod
```

Visualizar Pod:
```bash
kubectl describe pod config-provider
```

Visualizar Variables de entorno dentro del contenedor
```bash
kubectl exec -it config-provider -- sh
cat /etc/config/app-config.json
cat /etc/config/app-config.xml
```

Aquí, el Pod `config-provider` monta el **ConfigMap** `app-config` en el directorio `/etc/config` del contenedor. Puedes modificar el comando para hacer algo útil con los archivos de configuración montados.
