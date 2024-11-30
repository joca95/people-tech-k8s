# Creación de un Usuario para Kubernetes con Roles y RoleBindings

Este documento describe el proceso para crear un nuevo usuario en Kubernetes, asignarle roles y realizar pruebas de acceso para validar la configuración.

## Requisitos previos

1. Tener acceso al clúster de Kubernetes con privilegios de administrador.
2. Herramientas como `kubectl` y `openssl` deben estar instaladas en el entorno local.

---

### 1. Generación de Clave Privada y Solicitud de Certificado

Primero, generamos la clave privada para el usuario y luego creamos una solicitud de firma de certificado (CSR).

1. **Generar la clave privada del usuario:**

```bash
openssl genrsa -out /root/people-tech.key 2048
```

2. **Crear la Solicitud de Certificado (CSR):**

```bash
openssl req -new -key /root/people-tech.key -out /root/people-tech.csr -subj "/CN=people-tech"
```

3. **Codificar la CSR en base64 para incluirla en el archivo YAML:**

```bash
cat /root/people-tech.csr | base64 | tr -d "\n"
```

Esto devolverá una cadena base64 que será utilizada en el archivo `user.yaml`.

---

### 2. Crear el `CertificateSigningRequest` (CSR)

Crea un archivo `user.yaml` con la siguiente configuración, incluyendo la cadena base64 generada previamente.

**Contenido de `user.yaml`:**

```yaml
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: people-tech
spec:
  request: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0K...
  signerName: kubernetes.io/kube-apiserver-client
  expirationSeconds: 86400  # Un día
  usages:
  - client auth
```

### 3. Aplicar el CSR en Kubernetes

Aplica el archivo `user.yaml` para crear el CSR en el clúster:

```bash
kubectl apply -f user.yaml
```

### 4. Aprobar el CSR

Una vez que el CSR esté en el clúster, debe ser aprobado:

```bash
kubectl get csr
kubectl certificate approve people-tech
```

### 5. Obtener el Certificado Aprobado

Obtén el certificado aprobado y guárdalo en un archivo:

```bash
kubectl get csr/people-tech -o yaml
kubectl get csr people-tech -o jsonpath='{.status.certificate}' | base64 -d > people-tech.crt
```

### 6. Configurar las Credenciales del Usuario

Configura las credenciales del nuevo usuario `people-tech` en el archivo de configuración de `kubectl`:

```bash
kubectl config set-credentials people-tech --client-key=/root/people-tech.key --client-certificate=people-tech.crt --embed-certs=true
```

### 7. Configurar el Contexto del Usuario

Configura el contexto para el usuario `people-tech`:

```bash
kubectl config set-context people-tech --cluster=kubernetes --user=people-tech
```

---

### 8. Crear Roles y Role Bindings

1. **Crear un archivo de Role:** (ejemplo `role.yaml`)

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: development
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["list", "get"]
```

2. **Crear un archivo de RoleBinding:** (ejemplo `rolebinding.yaml`)

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: pod-reader-binding
  namespace: development
subjects:
- kind: User
  name: people-tech
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

3. **Aplicar los archivos:**

```bash
kubectl apply -f role.yaml
kubectl apply -f rolebinding.yaml
```

### 9. Realizar Pruebas

1. **Cambiar a contexto del nuevo usuario:**

```bash
kubectl config use-context people-tech
```

2. **Verificar los contextos disponibles:**

```bash
kubectl config get-contexts
```

3. **Probar el acceso a los pods:**

- Intentar listar los pods en el namespace `default` (Debe fallar):

```bash
kubectl get pod
```

El error esperado es:

```
Error from server (Forbidden): pods is forbidden: User "people-tech" cannot list resource "pods" in API group "" in the namespace "default"
```

- Intentar listar los pods en el namespace `kube-system` (Debe fallar):

```bash
kubectl get pod -n kube-system
```

El error esperado es:

```
Error from server (Forbidden): pods is forbidden: User "people-tech" cannot list resource "pods" in API group "" in the namespace "kube-system"
```

4. **Verificar los pods en el namespace `development`:**

```bash
kubectl get pod -n development
```

**Crear un pod en el namespace `development`:**

```bash
kubectl run pod1 --image=nginx:alpine -n development
```

**Verificar todos los recursos en el namespace `development`:**

```bash
kubectl get all -n development
```
