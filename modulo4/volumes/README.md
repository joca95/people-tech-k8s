### **Caso Práctico**

1. **Crear un PersistentVolume manual.**
2. **Configurar una StorageClass manual y un PV dinámico.**
3. **Crear un PersistentVolumeClaim.**
4. **Crear un Deployment que monte el PVC en 2 Pods.**
5. **Probar persistencia al escribir/leer archivos.**
6. **Recrear un Pod y verificar la persistencia.**

---
### **Consideraciones**
- Los pods deben ser creados en el mismo nodo ya que los tipos de volumenes que se usaran estarán en host de nodo y no se puede compartir entre nodos, para resolver esto se pueden usar volúmenes de red, NFS, EFS (AWS).
- Para KillerKoda, usar un escenario de un solo Node.
- Para Play K8s, usar un solo Node.
- Ubicarnos en el directorio `modulo4/volumes`

### **1. Crear un PersistentVolume manual**
Crea el directorio en el nodo para que se use con `hostPath`:
```bash
sudo mkdir -p /mnt/data/manual-pv
sudo chmod 777 /mnt/data/manual-pv
```

Define un PV, revisar manifiesto `manual-pv.yaml` 

Aplica el PV
```bash
kubectl apply -f manual-pv.yaml
```
Visualizar PVs, recordar que el PV es un recurso del cluster, mas no de un namespace.
```bash
kubectl get pv
```

---

### **2. Configurar una StorageClass manual y un PV dinámico**

1. **Crear la StorageClass:**

Define un StorageClass, revisar manifiesto `storageclass.yaml` 

Aplica la StorageClass:
```bash
kubectl apply -f storageclass.yaml
```

2. **Crear el PV asociado:**
Crea el directorio en el nodo para que se use con `hostPath`:
```bash
sudo mkdir -p /mnt/data/sc-pv
sudo chmod 777 /mnt/data/sc-pv
```

Define un PV, revisar manifiesto `sc-pv.yaml` 

Aplica el PV:
```bash
kubectl apply -f sc-pv.yaml
```

Visualizar PVs
```bash
kubectl get pv
```
---

### **3. Crear un PersistentVolumeClaim**

Define un PVC para consumir el PV manual, revisar manifiesto `pvc.yaml`

Aplica el PVC:
```bash
kubectl apply -f pvc.yaml
```

Visualizar PVCs
```bash
kubectl get pvc
```

Visualizar PVs
```bash
kubectl get pv
```

---

### **4. Crear un Deployment con 2 Pods**

Define un Deployment que use el PVC, revisar manifiesto deployment.yaml

Aplica el Deployment:
```bash
kubectl apply -f deployment.yaml
```

Visualizar deployments
```bash
kubectl get deployment
```

Visualizar pods
```bash
kubectl get pods
```

Visualizar PVCs
```bash
kubectl get pvc
```

Visualizar PVs
```bash
kubectl get pv
```

---

### **5. Probar persistencia de datos**

1. **Accede a uno de los Pods:**
```bash
POD_NAME=$(kubectl get pods -l app=pvc-test -o jsonpath="{.items[0].metadata.name}")
kubectl exec -it $POD_NAME -- sh
```

2. **Crea un archivo en el volumen compartido:**
```bash
echo "Hello from Pod 1" > /usr/share/nginx/html/hello.txt
cat /usr/share/nginx/html/hello.txt
exit
```

3. **Verifica el archivo en Host:**
```bash
cat /mnt/data/sc-pv/hello.txt
```

4. **Accede al segundo Pod y verifica el archivo:**
```bash
POD_NAME_2=$(kubectl get pods -l app=pvc-test -o jsonpath="{.items[1].metadata.name}")
kubectl exec -it $POD_NAME_2 -- sh
cat /usr/share/nginx/html/hello.txt
exit
```

---

### **6. Eliminar un Pod y verificar persistencia**

1. **Eliminar un Pod:**
```bash
kubectl delete pod $POD_NAME
```

Visualizar pods
```bash
kubectl get pods
```

2. **Verifica que el Pod se recrea automáticamente y accede al nuevo Pod:**
```bash
NEW_POD=$(kubectl get pods -l app=pvc-test -o jsonpath="{.items[0].metadata.name}")
kubectl exec -it $NEW_POD -- sh
```

3. **Comprueba que el archivo aún está presente:**
```bash
cat /usr/share/nginx/html/hello.txt
```
