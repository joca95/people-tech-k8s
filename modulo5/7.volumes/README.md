# Uso de Volúmenes EBS en Kubernetes con Amazon EKS

Este documento proporciona una guía paso a paso para configurar y utilizar volúmenes EBS como almacenamiento persistente en un clúster de Kubernetes alojado en Amazon EKS.

## Prerrequisitos

Antes de comenzar, asegúrate de tener los siguientes requisitos:

1. **Cuenta de AWS**: Una cuenta activa de AWS.
2. **EKS Cluster**: Un clúster de Amazon EKS configurado y funcionando.
3. **kubectl**: La herramienta de línea de comandos `kubectl` configurada para interactuar con tu clúster de EKS.
4. **IAM Roles**: Los roles IAM necesarios para que el clúster de EKS pueda acceder y gestionar volúmenes EBS.

## Pasos para Configurar y Utilizar Volúmenes EBS en EKS

### 1. Crear un Volumen EBS

Primero, debes crear un volumen EBS en la misma región y zona de disponibilidad donde está ubicado tu clúster de EKS.

```sh
aws ec2 create-volume \
--availability-zone us-east-1a \
--size 50 \
--volume-type gp3
```

Anota el `VolumeId` del EBS creado, ya que lo necesitarás en los siguientes pasos.

### 3. Instalar el EBS CSI Driver

El EBS CSI (Container Storage Interface) Driver permite a Kubernetes gestionar volúmenes EBS. Instálalo usando Helm:

```sh
helm repo add aws-ebs-csi-driver https://kubernetes-sigs.github.io/aws-ebs-csi-driver
helm repo update
helm install aws-ebs-csi-driver aws-ebs-csi-driver/aws-ebs-csi-driver --namespace kube-system
```

### 4. Crear un PersistentVolume (PV)

Define un recurso `PersistentVolume` en Kubernetes que utilice el volumen EBS creado anteriormente.

Revisar `1.ebs-pv.yaml` y aplícalo con `kubectl`:

```sh
kubectl apply -f 1.ebs-pv.yaml
```

### 5. Crear un PersistentVolumeClaim (PVC)

Define un recurso `PersistentVolumeClaim` para solicitar almacenamiento del `PersistentVolume` creado.

Revisar `2.ebs-pvc.yaml` y aplícalo con `kubectl`:

```sh
kubectl apply -f 2.ebs-pvc.yaml
```

### 6. Usar el PVC en un Deployment

Vamos a definir un Deployment que crea dos pods de nginx y monta el almacenamiento persistente utilizando el `PersistentVolumeClaim` creado anteriormente. Esto permitirá que ambos pods compartan los archivos almacenados en el volumen EBS.

Revisar `3.deployment.yaml` y aplícalo con `kubectl`:

```sh
kubectl apply -f 3.deployment.yaml
```

### 7. Verificar el Estado

Verifica que los pods estén en ejecución y que el volumen EBS esté montado correctamente en ambos pods.

```sh
kubectl get pods
kubectl describe pod <pod-name>
```

### 8. Verificar que los Archivos se Comparten Correctamente

Para verificar que los archivos se están compartiendo correctamente entre los pods, puedes ejecutar un comando en uno de los pods para crear un archivo y luego verificar su existencia en el otro pod.

1. **Crear un archivo en el primer pod**:

```sh
kubectl exec -it <nginx-pod-1> -- /bin/sh -c "echo 'Hello from pod 1' > /usr/share/nginx/html/index.html"
```

2. **Verificar el archivo en el segundo pod**:

```sh
kubectl exec -it <nginx-pod-2> -- /bin/sh -c "cat /usr/share/nginx/html/index.html"
```

Deberías ver el contenido `Hello from pod 1`, lo que confirma que ambos pods están compartiendo el mismo volumen EBS.


### 9. Crear un `StorageClass` para EBS

Define un `StorageClass` que especifique los parámetros para los volúmenes EBS. Aquí hay un ejemplo de un `StorageClass`:

Revisar `4.ebs-sc.yaml` y aplícalo con `kubectl`:

```sh
kubectl apply -f 4.ebs-sc.yaml
```
