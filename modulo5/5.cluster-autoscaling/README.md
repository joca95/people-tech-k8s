# Configuración del Escalado Automático de Clúster (CAS) en Kubernetes

Este documento proporciona una guía paso a paso para configurar el escalado automático de clúster (Cluster Autoscaler, CAS) en un clúster de Kubernetes.

## Prerequisitos

1. **Kubernetes Cluster**: Asegúrate de tener un clúster de Kubernetes en funcionamiento.
2. **kubectl**: Instala y configura `kubectl` para interactuar con tu clúster de Kubernetes.
3. **Proveedor de Nube**: El Cluster Autoscaler requiere integración con un proveedor de nube compatible (AWS, Google Cloud, Azure, etc.).

## Prueba Manual de Escalamiento o Modificación del ASG

### Verificar el Estado Actual del ASG

Exportar variables de entorno
```shell
CLUSTER_NAME=testpt-k8s
AWS_REGION=us-east-1
ACCOUNT_ID=<ACCOUNT_ID>
```

Utiliza el siguiente comando para describir los grupos de autoescalado y verificar sus configuraciones actuales.

```sh
aws autoscaling \
describe-auto-scaling-groups \
--query "AutoScalingGroups[? Tags[? (Key=='eks:cluster-name') && Value=='$CLUSTER_NAME']].[AutoScalingGroupName, MinSize, MaxSize, DesiredCapacity]" \
--output table
```

### Aumentar la Capacidad Máxima de las Instancias (Opcional)

1. **Obtener el Nombre del Auto Scaling Group (ASG)**:

```sh
export ASG_NAME=$(aws autoscaling describe-auto-scaling-groups --query "AutoScalingGroups[? Tags[? (Key=='eks:cluster-name') && Value=='$CLUSTER_NAME']].AutoScalingGroupName" --output text)
```

2. **Actualizar los Valores del Auto Scaling Group**:

```sh
aws autoscaling \
update-auto-scaling-group \
--auto-scaling-group-name ${ASG_NAME} \
--min-size 1 \
--desired-capacity 2 \
--max-size 5
```

3. **Verificar los Nuevos Valores**:

```sh
aws autoscaling \
describe-auto-scaling-groups \
--query "AutoScalingGroups[? Tags[? (Key=='eks:cluster-name') && Value=='$CLUSTER_NAME']].[AutoScalingGroupName, MinSize,MaxSize,DesiredCapacity]" \
--output table
```

## Configuración del Escalado Automático de Clúster

### Paso 1: Configuración del Proveedor de Nube

#### Amazon EKS

1. **Configurar la Política de IAM**:
Crea una política de IAM con los permisos necesarios para el Cluster Autoscaler.

Crea la política utilizando la AWS CLI:

```sh
aws iam create-policy --policy-name PeopleTechAmazonEKSClusterAutoscalerPolicy --policy-document file://iam_policy.json
```

2. **Crear una Cuenta de Servicio IAM**:
Crea una cuenta de servicio IAM y asóciala con la política de IAM creada.

```sh
eksctl create iamserviceaccount \
--name cluster-autoscaler \
--namespace kube-system \
--cluster ${CLUSTER_NAME} \
--attach-policy-arn arn:aws:iam::<your-account-id>:policy/PeopleTechAmazonEKSClusterAutoscalerPolicy \
--override-existing-serviceaccounts \
--approve
```

### Paso 2: Desplegar el Cluster Autoscaler

1. **Descargar el Manifiesto de Deployment**:
Descarga el manifiesto de Cluster Autoscaler desde el repositorio oficial.

```sh
curl -o cluster-autoscaler-autodiscover.yaml https://raw.githubusercontent.com/kubernetes/autoscaler/refs/heads/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml
```

2. **Modificar el Manifiesto**:
Edita el archivo `cluster-autoscaler-autodiscover.yaml` para configurar tu clúster.

- Asegúrate de especificar el nombre de tu clúster en la línea de comando del contenedor de Cluster Autoscaler:
```yaml
- --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/<your-cluster-name>
```

3. **Aplicar el Manifiesto**:
Despliega el Cluster Autoscaler en tu clúster de Kubernetes.

```sh
kubectl apply -f cluster-autoscaler-autodiscover.yaml
```

### Paso 3: Verificar la Configuración

1. **Verificar los Pods del Cluster Autoscaler**:
Asegúrate de que los pods del Cluster Autoscaler estén en ejecución.

```sh
kubectl get pods -n kube-system -l app=cluster-autoscaler
```

2. **Verificar los Logs del Cluster Autoscaler**:
Revisa los logs de los pods del Cluster Autoscaler para asegurarte de que esté funcionando correctamente.

```sh
kubectl logs -f deployment/cluster-autoscaler -n kube-system
```


1. **Crear una Aplicación de Ejemplo**:
Vamos a desplegar una aplicación de ejemplo, en este caso, un despliegue de php.
Aplica el siguiente comando.
```sh
kubectl create deployment php-apache --image=us.gcr.io/k8s-artifacts-prod/hpa-example
kubectl set resources deploy php-apache --requests=cpu=400m
kubectl expose deploy php-apache --port 80
kubectl get pod -l app=php-apache
```

## Prueba de Escalado Automático de Clúster

1. **Modificar el deploy php-apache**:
Aplica el siguiente comando.
```sh
kubectl set resources deploy php-apache --requests=cpu=400m
```

2. **Reconfigura el HPA**:
Vamos a modificar el HPA que escalará el despliegue de PHPApache basado en el uso de CPU, con hasta 15 réplicas.
Aplicar el manifiesto
```sh
kubectl apply -f 1.hpa.yaml
```

3. **Verificar el HPA**:
Asegúrate de que el HPA esté configurado y funcionando correctamente:

```sh
kubectl get hpa
```

## Configuración Adicional

### Configuración de Opciones de Escalado

Puedes ajustar las opciones de escalado del Cluster Autoscaler mediante parámetros adicionales en el contenedor.

- **--scan-interval**: Intervalo de tiempo entre escaneos de escalado.
- **--scale-down-enabled**: Habilitar o deshabilitar el escalado hacia abajo.
- **--scale-down-delay-after-add**: Tiempo de espera antes de permitir el escalado hacia abajo después de agregar un nodo.

Ejemplo de configuración:

```yaml
- --scan-interval=10s
- --scale-down-enabled=true
- --scale-down-delay-after-add=10m
```

### Configuración de Etiquetas de Autoescalado

Asegúrate de que tus grupos de autoescalado (ASG) estén etiquetados correctamente para que el Cluster Autoscaler pueda descubrirlos automáticamente.

- **Etiqueta de Autoescalador de Clúster**:
```sh
k8s.io/cluster-autoscaler/enabled
```

- **Etiqueta del Nombre del Clúster**:
```sh
k8s.io/cluster-autoscaler/<your-cluster-name>
```