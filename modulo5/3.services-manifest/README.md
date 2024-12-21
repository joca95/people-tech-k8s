# Despliegue de Aplicaciones y Configuración de ALB en Kubernetes

Este documento proporciona una guía paso a paso para desplegar una aplicación Tetris en un clúster de Kubernetes utilizando varios tipos de servicios y configurando el controlador de AWS ALB (Application Load Balancer).

## Prerequisitos

1. **Cuenta de AWS**: Necesitas una cuenta de AWS con permisos suficientes para crear y administrar recursos.
2. **Kubernetes Cluster**: Asegúrate de tener un clúster de Kubernetes en funcionamiento.
3. **kubectl**: Instala y configura `kubectl` para interactuar con tu clúster de Kubernetes.
4. **AWS CLI**: Instala y configura la CLI de AWS para autenticarte y gestionar tus recursos de AWS desde la línea de comandos.

```sh
# Instalar AWS CLI
pip install awscli

# Configurar AWS CLI
aws configure
```

## Despliegue de la Aplicación Tetris

### 1. Despliegue del Pod con Deployment

Aplica el manifiesto para crear el Deployment del pod de Tetris:

```sh
kubectl apply -f 1.tetris-deployment.yaml
```

Utiliza el siguiente comando para exponer el deployment en tu máquina local:
```sh
kubectl port-forward deployment.apps/tetris-deployment 8080:3000
```

### 2. Servicio ClusterIP

Aplica el manifiesto para crear un servicio ClusterIP para el pod de Tetris:

```sh
kubectl apply -f 2.tetris-service-cluster-ip.yaml
```
**Acceder al Servicio ClusterIP**

Para acceder al servicio ClusterIP, usa un pod en el mismo clúster para realizar solicitudes HTTP al servicio o utiliza el siguiente comando para exponer el service en tu máquina local:
```sh
kubectl port-forward service/tetris-service-clusterip 8080:80
```
E ingresa por navegador al [localhost:8080](localhost:8080)

### 3. Servicio NodePort

Aplica el manifiesto para crear un servicio NodePort para el pod de Tetris:

```sh
kubectl apply -f 3.tetris-service-node-port.yaml
```

Visualiza la ip pública del nodo:
```sh
kubectl get nodes -o wide
```
**NOTA:** Asegúrate de abrir el puerto 30036 en el security group del nodo.

**Acceder al Servicio NodePort**

Para acceder al servicio NodePort, ve a `http://<node-ip>:30036` en tu navegador.

## Configuración del Controlador de ALB en AWS

### 1. Instalar el AWS Load Balancer Controller

Sigue estos pasos para instalar el controlador de AWS ALB en tu clúster de Kubernetes:

1. **Crear la Política de IAM**:

Crear IAM OIDC Provider para EKS
```shell
eksctl utils associate-iam-oidc-provider --region=us-east-1 --cluster=testpt-eks --approve
```

Crea la política de IAM con el archivo `iam_policy.json`:

```sh
aws iam create-policy --policy-name PeopleTechAWSLoadBalancerControllerIAMPolicy --policy-document file://iam_policy.json
```

2. **Crear un Rol de IAM para el Controlador**:

Asocia el rol de IAM con tu clúster EKS:

```sh
eksctl create iamserviceaccount \
--cluster=testpt-eks \
--namespace=kube-system \
--name=aws-load-balancer-controller \
--attach-policy-arn=arn:aws:iam::<your-account-id>:policy/PeopleTechAWSLoadBalancerControllerIAMPolicy \
--override-existing-serviceaccounts \
--approve
```

3. **Instalar los CRDs del Controlador**:

```sh
kubectl apply -k github.com/aws/eks-charts/stable/aws-load-balancer-controller/crds?ref=master
```

4. **Instalar el Helm Chart**:

Agrega el repositorio de EKS y luego instala el controlador:

```sh
helm repo add eks https://aws.github.io/eks-charts
helm repo update
helm upgrade -i aws-load-balancer-controller \
eks/aws-load-balancer-controller \
-n kube-system \
--set clusterName=testpt-eks \
--set serviceAccount.create=false \
--set serviceAccount.name=aws-load-balancer-controller \
--set region=us-east-1 \
--set vpcId=<your-vpc-id>
```

### 4. Servicio LoadBalancer

Aplica el manifiesto para crear un servicio LoadBalancer para el pod de Tetris:

```sh
kubectl apply -f 4.tetris-service-load-balancer.yaml
```

**Acceder al Servicio LoadBalancer**

Para acceder al servicio LoadBalancer, ve a la URL del balanceador de carga proporcionada por AWS. Puedes obtener esta URL con el siguiente comando:

```sh
kubectl get svc tetris-service-loadbalancer -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### 5. Eliminar recursos
```sh
kubectl delete -f .
```