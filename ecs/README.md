# Infraestructura ECS de la web

Plantillas y scripts para desplegar la web React/Nginx en **ECS Fargate**, con la API y la base de datos desplegadas desde el repo `turnofacil-api`.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `templates/td-web.tpl.json` | Task definition de la web (Nginx + React) |
| `templates/svc-web.tpl.json` | Servicio `turnofacil-web` con 1 réplica y alias `web:8080` |
| `render.sh` | Reemplaza `${VARIABLES}` y valida el JSON |
| `check-vars.sh` | Revisa herramientas y variables |

## Requisitos

La API debe estar desplegada y activa, porque Nginx resuelve `turnofacil-api` al arrancar.

## Variables y secretos de GitHub

### Secrets

| Nombre | Uso |
|---|---|
| `AWS_ACCESS_KEY_ID` | Credenciales AWS Academy |
| `AWS_SECRET_ACCESS_KEY` | Credenciales AWS Academy |
| `AWS_SESSION_TOKEN` | Token de sesión de Academy |

### Variables (opcionales)

> Los secrets son obligatorios. Las variables de red (`SUBNET1`, `SUBNET2`, `SG_WEB`, `LAB_ROLE_ARN`) son opcionales: el workflow las descubre por nombre si no están definidas.

| Nombre | Ejemplo |
|---|---|
| `AWS_REGION` | `us-east-1` |
| `ECS_CLUSTER` | `turnofacil-ecs` |
| `NAMESPACE` | `turnofacil.local` |
| `LOG_GROUP` | `/ecs/turnofacil` |
| `SUBNET1` | `subnet-...` |
| `SUBNET2` | `subnet-...` |
| `SG_WEB` | `sg-...` |
| `LAB_ROLE_ARN` | `arn:aws:iam::<cuenta>:role/LabRole` |

> Las credenciales de Academy caducan; actualízalas antes de cada despliegue.

## Render local

```bash
export LAB_ROLE_ARN=arn:aws:iam::<cuenta>:role/LabRole
export WEB_IMAGE_URI=<cuenta>.dkr.ecr.us-east-1.amazonaws.com/turnofacil-web:lab
export SUBNET1=subnet-...
export SUBNET2=subnet-...
export SG_WEB=sg-...

bash ecs/render.sh
ls ecs/out/
```

## Despliegue

Desde GitHub Actions: **Actions → Deploy Web - ECS Fargate → Run workflow**.

El workflow construye la imagen, la sube a ECR, registra la task definition, crea o actualiza el servicio y espera `services-stable`.

## Notas

- Solo la web tiene el puerto 8080 abierto a internet.
- `API_URL` por defecto es `http://turnofacil-api:8080`; se inyecta en la task definition.
- La imagen usa Nginx sin privilegios y escucha en 8080.
- La IP pública cambia cuando se reemplaza la tarea.
