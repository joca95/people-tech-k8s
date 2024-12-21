# Interacción con un Clúster de EKS

Este documento proporciona una guía completa para interactuar con un clúster de Amazon EKS (Elastic Kubernetes Service). Incluye los prerequisitos, herramientas necesarias, creación de volúmenes EBS, uso de AWS Secrets Manager y Parameter Store, implementación de HPA (Horizontal Pod Autoscaler) y CAS (Cluster AutoScaler), y configuración de un Balanceador de Carga de Aplicaciones como Service y como Ingress.

## Prerequisitos

1. **Cuenta de AWS**: Necesitas una cuenta de AWS con permisos suficientes para crear recursos de EKS.
2. **CLI de AWS**: Instala y configura la CLI de AWS para interactuar con los servicios de AWS desde la línea de comandos.
```sh
# Instalar AWS CLI
pip install awscli

# Configurar AWS CLI
aws configure
```
3. **kubectl**: Instala la herramienta kubectl para interactuar con tu clúster de Kubernetes.
```sh
# Instalar kubectl
curl -o kubectl https://amazon-eks.s3.us-west-2.amazonaws.com/1.21.14/2021-12-13/bin/linux/amd64/kubectl
chmod +x ./kubectl
mkdir -p $HOME/bin && cp ./kubectl $HOME/bin/kubectl && export PATH=$PATH:$HOME/bin
echo 'export PATH=$PATH:$HOME/bin' >> ~/.bashrc
```
4. **eksctl**: Instala eksctl para crear y administrar clústeres de EKS.
```sh
# Instalar eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/download/v0.91.0/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
```
Para windows: [text](https://eksctl.io/installation/#for-windows)

## Creación del Clúster EKS

1. **Crear el clúster**: Utiliza eksctl para crear un clúster de EKS.
```sh
eksctl create cluster --name my-cluster --region us-west-2 --nodegroup-name standard-workers --node-type t3.medium --nodes 3
```

2. **Configurar kubectl para usar el clúster EKS**: Una vez creado el clúster, configura kubectl para interactuar con él.
```sh
aws eks --region us-west-2 update-kubeconfig --name my-cluster
```

## Creación de Volúmenes EBS

1. **Definir el PersistentVolume**:
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: my-ebs-volume
spec:
  capacity:
    storage: 10Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: manual
  awsElasticBlockStore:
    volumeID: <your-volume-id>
    fsType: ext4
```
- **PersistentVolume**: Define el volumen persistente en Kubernetes utilizando un volumen EBS existente.

2. **Definir el PersistentVolumeClaim**:
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-ebs-claim
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: manual
  resources:
    requests:
      storage: 10Gi
```
- **PersistentVolumeClaim**: Solicita el uso del volumen persistente definido anteriormente.

## Uso de AWS Secrets Manager y Parameter Store

1. **Instalar el CSI Driver**:
```sh
kubectl apply -k "github.com/aws/secrets-store-csi-driver-provider-aws/deploy/kubernetes/overlays/stable/ecr/?ref=main"
```
- **CSI Driver**: Permite a Kubernetes acceder a los secretos almacenados en AWS Secrets Manager y Parameter Store.

2. **Definir el SecretProviderClass**:
```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: aws-secrets
spec:
  provider: aws
  parameters:
    objects: |
      - objectName: "arn:aws:secretsmanager:us-west-2:123456789012:secret:mysecret"
        objectType: "secretsmanager"
```
- **SecretProviderClass**: Configura cómo Kubernetes debe acceder a los secretos de AWS.

3. **Montar el secreto en un Pod**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
spec:
  containers:
    - name: mycontainer
      image: nginx
      volumeMounts:
        - name: secrets-store-inline
          mountPath: "/mnt/secrets-store"
          readOnly: true
  volumes:
    - name: secrets-store-inline
      csi:
        driver: secrets-store.csi.k8s.io
        readOnly: true
        volumeAttributes:
          secretProviderClass: "aws-secrets"
```
- **Pod**: Muestra cómo montar los secretos desde AWS en un contenedor.

## Implementación de HPA (Horizontal Pod Autoscaler)

1. **Instalar Metrics Server**:
```sh
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```
- **Metrics Server**: Proporciona métricas de uso de recursos de los nodos y pods en Kubernetes.

2. **Definir HPA**:
```yaml
apiVersion: autoscaling/v2beta2
kind: HorizontalPodAutoscaler
metadata:
  name: my-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-deployment
  minReplicas: 1
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50
```
- **HorizontalPodAutoscaler**: Ajusta automáticamente el número de pods en un despliegue en función del uso de recursos.

## Implementación de CAS (Cluster AutoScaler)

1. **Instalar Cluster Autoscaler**:
```sh
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml
```
- **Cluster Autoscaler**: Ajusta automáticamente el número de nodos en el clúster en función de la carga de trabajo.

2. **Editar el Deployment**:
```sh
kubectl -n kube-system edit deployment.apps/cluster-autoscaler
# Agregar las siguientes líneas en el spec:
# ...
# spec:
#   containers:
#   - name: cluster-autoscaler
#     image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.21.0
#     command:
#       - ./cluster-autoscaler
#       - --v=4
#       - --stderrthreshold=info
#       - --cloud-provider=aws
#       - --skip-nodes-with-local-storage=false
#       - --expander=least-waste
#       - --nodes=1:10:<your-instance-group-name>
#       - --balance-similar-node-groups
#       - --skip-nodes-with-system-pods=false
```

## Uso de Balanceador de Carga de Aplicaciones como Service y como Ingress

1. **Definir el Service**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
spec:
  selector:
    app: my-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: LoadBalancer
```
- **Service**: Expone una aplicación ejecutándose en un conjunto de Pods como un servicio de red.

2. **Definir el Ingress**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
spec:
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-service
                port:
                  number: 80
```
- **Ingress**: Administra el acceso externo a los servicios en un clúster de Kubernetes, típicamente a través de HTTP y HTTPS.