### **Escenario**
Supongamos que necesitamos crear un usuario llamado `developer` que:
1. Tenga acceso solo al namespace `development`.
2. Pueda:
   - Leer y listar ConfigMaps y Secrets.
   - Crear, listar y eliminar Pods.

---

### **Pasos**

#### **1. Crear un Certificado para el Usuario (`developer`)**
Los usuarios en Kubernetes no se almacenan como recursos, sino que se autentican mediante certificados.

1. **Crear un archivo de configuración OpenSSL:**
Revisar el archivo `developer-openssl.cnf`

2. **Crear una clave privada y un CSR (Certificate Signing Request):**
```bash
openssl genrsa -out developer.key 2048
openssl req -new -key developer.key -out developer.csr -subj "/CN=developer" -config developer-openssl.cnf
```

3. **Firmar el certificado usando el certificado del clúster:**
Utiliza el certificado y clave del clúster (normalmente `ca.crt` y `ca.key`):
```bash
openssl x509 -req -in developer.csr -CA /etc/kubernetes/pki/ca.crt -CAkey /etc/kubernetes/pki/ca.key -CAcreateserial -out developer.crt -days 365 -extensions v3_req -extfile developer-openssl.cnf
```

4. **Configurar el acceso en `kubectl`:**
Agrega las credenciales al archivo `kubeconfig`: reemplazar <cluster-name>
```bash
kubectl config set-credentials developer --client-certificate=developer.crt --client-key=developer.key
kubectl config set-context developer-context --cluster=<cluster-name> --namespace=development --user=developer
```

#### **2. Crear un Namespace**
Primero, crea el namespace donde el usuario trabajará:
```bash
kubectl create namespace development
```

#### **3. Crear el Role**
Define un `Role` con los permisos necesarios para los recursos en el namespace `development`, revisar el manifiesto `role.yaml`.

Aplica el Role:
```bash
kubectl apply -f role.yaml
```

#### **4. Crear el RoleBinding**
Asocia el Role `developer-role` con el usuario `developer`, revisar el manifiesto `rolebinding.yaml`.

Aplica el RoleBinding:
```bash
kubectl apply -f rolebinding.yaml
```

#### **5. Probar los Permisos**
Con el contexto configurado para el usuario `developer`:
1. Cambia al contexto del usuario:
```bash
kubectl config use-context developer-context
```
2. Verifica que el usuario pueda listar ConfigMaps y Secrets:
```bash
kubectl get configmaps
kubectl get secrets
```
3. Intenta crear un Pod:
```bash
kubectl run test-pod --image=nginx
```
4. Intenta acceder a recursos fuera de su permiso, como nodos:
```bash
kubectl get nodes
```
Este comando debería fallar, confirmando que los permisos están restringidos.

---

### **Extensión: Asignar Permisos a Nivel de Clúster**
Si el usuario necesita acceso a estos recursos en múltiples namespaces, usa un `ClusterRole` en lugar de un `Role`.

1. **Crear un ClusterRole:**
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
    name: cluster-developer-role
rules:
- apiGroups: [""]
    resources: ["configmaps", "secrets", "pods"]
    verbs: ["get", "list", "create", "delete"]
```
Aplica el ClusterRole:
```bash
kubectl apply -f clusterrole.yaml
```

2. **Crear un ClusterRoleBinding:**
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
    name: cluster-developer-binding
subjects:
- kind: User
    name: developer
    apiGroup: rbac.authorization.k8s.io
roleRef:
    kind: ClusterRole
    name: cluster-developer-role
    apiGroup: rbac.authorization.k8s.io
```
Aplica el ClusterRoleBinding:
```bash
kubectl apply -f clusterrolebinding.yaml
```