# TurnoFácil Web

SPA de reservas construida con React y desplegada en AWS ECS Fargate con Nginx.

Forma parte de TurnoFácil junto con la API:

- API: https://github.com/maxrodriguezg/turnofacil-api
- Web: https://github.com/vf-organization/turnofacil-web

## Stack

- React 19
- Vite 8
- Nginx sin privilegios
- Vitest + Testing Library
- Docker multi-stage
- GitHub Actions
- SonarCloud + Snyk

## Desarrollo local

```bash
npm ci
npm run dev
```

La web usa el proxy `/api` hacia `http://localhost:8080`.

## Pruebas

```bash
npm run lint
npm run test:coverage
npm run build
```

Cobertura actual: **97.53%**.

## Docker

```bash
docker build -t turnofacil-web .
docker run -p 8080:8080 -e API_URL=http://api:8080 turnofacil-web
```

## Despliegue en ECS

Workflow: `Deploy Web - ECS Fargate`.

- Build de la imagen.
- Push a ECR.
- Registro de task definition.
- Actualización del servicio ECS.
- Espera a `services-stable`.
- Publicación de `DeploymentDurationSeconds` en CloudWatch.

La API debe estar activa antes del despliegue porque Nginx resuelve `turnofacil-api` al arrancar.

## CI/CD y calidad

- Lint, tests, cobertura y build.
- SonarCloud con Quality Gate bloqueante.
- Snyk para dependencias e imagen.
- Actions fijadas a SHA completo.
- `npm ci --ignore-scripts`.

## Branch protection

`main` y `develop` requieren PR y checks obligatorios:

- `Lint, tests y SonarCloud`
- `Seguridad de dependencias (Snyk)`
- `Imagen Docker`

## Observabilidad

- Comparte el dashboard `Dashboard-Mesh-turnofacil` con la API.
- Métricas: requests, latencia, 2XX/5XX, CPU/memoria y logs.
- Métricas custom: `CoveragePercent` y `DeploymentDurationSeconds`.

Dashboard:

https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=Dashboard-Mesh-turnofacil

## Limitaciones

- La IP pública cambia cuando ECS reemplaza la tarea.
- Las credenciales de AWS Academy expiran.
- X-Ray está bloqueado por permisos de `LabRole`.
