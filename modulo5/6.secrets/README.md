# Configuración de Secretos en Kubernetes con AWS Secrets Manager y Parameter Store

## Introducción

Los Secretos en Kubernetes proporcionan una solución para almacenar información sensible y confidencial, como contraseñas, API keys, SSH keys, tokens, etc.

## Requisitos Previos

1. Una cuenta de AWS.
2. AWS CLI configurado.
3. Un clúster de Kubernetes (puedes usar EKS, minikube, etc.).
4. `kubectl` instalado y configurado para interactuar con tu clúster de Kubernetes.

## Configuración de Secretos en AWS

### 1. Crear un Secreto en AWS Secrets Manager

Primero, crea un secreto en AWS Secrets Manager. Puedes usar la AWS CLI o la consola de AWS.

#### Usando la AWS CLI:

```sh
aws secretsmanager create-secret --name PeopleTechDataBaseSecret --secret-string '{"username":"dbuser","password":"dbpass"}'
```

#### Usando la Consola de AWS:

1. Ve a la consola de AWS Secrets Manager.
2. Haz clic en "Store a new secret".
3. Selecciona "Other type of secrets".
4. Ingresa la información del secreto.
5. Dale un nombre al secreto (por ejemplo, `PeopleTechDataBaseSecret`).
6. Guarda el secreto.

### 2. Crear un Parámetro en AWS Systems Manager Parameter Store

De manera similar, crea un parámetro en AWS Systems Manager Parameter Store.

#### Usando la AWS CLI:

```sh
aws ssm put-parameter --cli-input-json '{"Name": "/peopletech/config", "Value": "sha12.sad.adasddddda", "Type": "SecureString"}'
```

#### Usando la Consola de AWS:

1. Ve a la consola de AWS Systems Manager.
2. Haz clic en "Parameter Store" en el menú de la izquierda.
3. Haz clic en "Create parameter".
4. Ingresa el nombre del parámetro (por ejemplo, `/peopletech/config`).
5. Ingresa el valor del parámetro.
6. Selecciona "SecureString" como tipo de parámetro.
7. Guarda el parámetro.

## Configuración de Kubernetes

### 1. Crear un IAM Role para el Service Account

Configura un IAM Role que permita a tu Service Account en Kubernetes acceder a Secrets Manager y Parameter Store.

#### Crear la Política IAM
Reemplaza `<region>` y `<account-id>` con tu región y ID de cuenta de AWS en el archivo un archivo `iam_policy.json`:

Usa el siguiente comando para crear la política en AWS IAM:

```sh
aws iam create-policy --policy-name PeopleTechEKSSecretPolicy --policy-document file://iam_policy.json
```
#### Crear una Cuenta de Servicio IAM
Crea una cuenta de servicio IAM y asóciala con la política de IAM creada.

```sh
eksctl create iamserviceaccount \
--name secret-store \
--namespace default \
--cluster ${CLUSTER_NAME} \
--attach-policy-arn arn:aws:iam::<your-account-id>:policy/PeopleTechEKSSecretPolicy \
--override-existing-serviceaccounts \
--approve
```

### 2. Instalar el AWS Load Balancer Controller (Opcional)

Esto es opcional, pero si estás usando EKS, puedes instalar el AWS Load Balancer Controller para administrar los recursos de AWS desde Kubernetes.

### 3. Instalar el AWS Secrets and Configuration Provider (ASCP)

Primero, instala ASCP en tu clúster de Kubernetes. Puedes hacerlo siguiendo la guía oficial de AWS. Aquí te muestro cómo hacerlo con Helm.

#### Añadir el repositorio de Helm de ASCP

```sh
helm repo add secrets-store-csi-driver https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts
helm repo update
```

#### Instalar ASCP

```sh
helm install -n kube-system secrets-store-csi-driver secrets-store-csi-driver/secrets-store-csi-driver
```

### 4. Configurar el SecretProviderClass

Aplica el manifiesto:

```sh
kubectl apply -f 1.secret-provider-class.yaml
```

### 3. Configurar la Aplicación de Kubernetes

#### Crear un Deployment y un Service en Kubernetes

Configura tu Deployment para usar los secretos recuperados por ASCP. 

#### Aplicar el Manifiesto

Guarda el archivo YAML y aplícalo a tu clúster de Kubernetes:

```sh
kubectl apply -f 2.deployment.yaml
```

### Desplegar la Aplicación

Finalmente, despliega tu aplicación en el clúster de Kubernetes y verifica que los secretos se están utilizando correctamente.
