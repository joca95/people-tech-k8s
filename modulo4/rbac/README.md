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






openssl genrsa -out /root/people-tech.key 2048


openssl req -new -key /root/people-tech.key -out /root/people-tech.csr -subj "/CN=people-tech"


cat /root/people-tech.csr | base64 | tr -d "\n"


LS0tLS1CRUdJTiBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0KTUlJQ1d6Q0NBVU1DQVFBd0ZqRVVNQklHQTFVRUF3d0xjR1Z2Y0d4bExYUmxZMmd3Z2dFaU1BMEdDU3FHU0liMwpEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUURVTCtuc0RzamlyOFN3NmRwd1N6aUR2UWc2UkEzSTJ0UCtlaVI3CldIZ2VEMFRNTldzSGFYeTZwZG9JSGc5MEpSdTNPUU1tUERFWGZ4ZTNlQ0VhQXNFN2Nrbnh6REYwdGtKOUZUWnMKMGRXYktVeU1adXVMMVlaSnJsakxxcXhVOGVRUnlhTDljaytrWEEvVXA5SXdNUW4vZjc4TFJ3Q3RZZjhYZG5hcApZdHBWK0NpV255M0N0V1U0bHM0NC9DZlVvajVkZ2loeW9rVkdhWC8wQUU1blJ4L1h0ZVlPYWhqQ21rU2ZoQ3NvCkFvclo5Z1QwUVpxTEpRZUo5TVU1WlpLRzN4WERMRTVvMTlMbm94Qy9MY0N1ZDVUL1JHUU82ZWZGUk5GTnBRdjUKaDVWc2YrY3VUTk11UWNLdG5pM3I3RnVRVGxzN29pUE5lbFlTWnpFdHU5UGF5WjZqQWdNQkFBR2dBREFOQmdrcQpoa2lHOXcwQkFRc0ZBQU9DQVFFQXMvUDJMMjRKVzBObTh0K291ZlhML1JVSnc2bFhmNXA1aFNDYTNYUDl2UU1ECklpUzZvcDJPZmwxT1VVcVM4ZzFtUUNBR1M3SEZyV040RHM5czcyN3EzN3lDbXBhNS9iUzlmYUxkWmc0Q0dSdHgKT3NmMjFSK3ZaK25PMUFSRVFaWnR1OHltcUMxbk5GVER1M2Z5WVI2NkhQZCtCNVo4UkI2MUZUbDdNdnFmVFlONgp6Q2ZkYWo5eGZHbzFoSEUrTEZobHlCd054a0hFMC9UQnZRUURNV3Nua3dxcWxOTTBwbjNXSE8vWUY0MXZCeWExCktraC9jZU53azFEbC9rOFR3VC9GY1NCNGtmYXV4LzUxdFRZTkduZ2VsRnVqSk5rVWpjSjFPYlJEYjIwbEo5ZEcKVFVHaTQ3MjZ6d08rR2ppNWt6QkU3cjc1R2NnZG1Ja0d4SWlQeXpkR0F3PT0KLS0tLS1FTkQgQ0VSVElGSUNBVEUgUkVRVUVTVC0tLS0tCg==


user.yaml

apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: people-tech
spec:
  request: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0KTUlJQ1d6Q0NBVU1DQVFBd0ZqRVVNQklHQTFVRUF3d0xjR1Z2Y0d4bExYUmxZMmd3Z2dFaU1BMEdDU3FHU0liMwpEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUURVTCtuc0RzamlyOFN3NmRwd1N6aUR2UWc2UkEzSTJ0UCtlaVI3CldIZ2VEMFRNTldzSGFYeTZwZG9JSGc5MEpSdTNPUU1tUERFWGZ4ZTNlQ0VhQXNFN2Nrbnh6REYwdGtKOUZUWnMKMGRXYktVeU1adXVMMVlaSnJsakxxcXhVOGVRUnlhTDljaytrWEEvVXA5SXdNUW4vZjc4TFJ3Q3RZZjhYZG5hcApZdHBWK0NpV255M0N0V1U0bHM0NC9DZlVvajVkZ2loeW9rVkdhWC8wQUU1blJ4L1h0ZVlPYWhqQ21rU2ZoQ3NvCkFvclo5Z1QwUVpxTEpRZUo5TVU1WlpLRzN4WERMRTVvMTlMbm94Qy9MY0N1ZDVUL1JHUU82ZWZGUk5GTnBRdjUKaDVWc2YrY3VUTk11UWNLdG5pM3I3RnVRVGxzN29pUE5lbFlTWnpFdHU5UGF5WjZqQWdNQkFBR2dBREFOQmdrcQpoa2lHOXcwQkFRc0ZBQU9DQVFFQXMvUDJMMjRKVzBObTh0K291ZlhML1JVSnc2bFhmNXA1aFNDYTNYUDl2UU1ECklpUzZvcDJPZmwxT1VVcVM4ZzFtUUNBR1M3SEZyV040RHM5czcyN3EzN3lDbXBhNS9iUzlmYUxkWmc0Q0dSdHgKT3NmMjFSK3ZaK25PMUFSRVFaWnR1OHltcUMxbk5GVER1M2Z5WVI2NkhQZCtCNVo4UkI2MUZUbDdNdnFmVFlONgp6Q2ZkYWo5eGZHbzFoSEUrTEZobHlCd054a0hFMC9UQnZRUURNV3Nua3dxcWxOTTBwbjNXSE8vWUY0MXZCeWExCktraC9jZU53azFEbC9rOFR3VC9GY1NCNGtmYXV4LzUxdFRZTkduZ2VsRnVqSk5rVWpjSjFPYlJEYjIwbEo5ZEcKVFVHaTQ3MjZ6d08rR2ppNWt6QkU3cjc1R2NnZG1Ja0d4SWlQeXpkR0F3PT0KLS0tLS1FTkQgQ0VSVElGSUNBVEUgUkVRVUVTVC0tLS0tCg==
  signerName: kubernetes.io/kube-apiserver-client
  expirationSeconds: 86400  # one day
  usages:
  - client auth

kubectl apply -f user.yaml


kubectl get csr


kubectl certificate approve people-tech


kubectl get csr/people-tech -o yaml


kubectl get csr people-tech -o jsonpath='{.status.certificate}'| base64 -d > people-tech.crt