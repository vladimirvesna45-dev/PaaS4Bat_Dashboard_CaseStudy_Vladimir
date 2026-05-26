# GitHub Actions CI/CD

## Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| [CI](../.github/workflows/ci.yml) | Push/PR to `main` | Backend pytest + frontend build |
| [Deploy](../.github/workflows/deploy.yml) | After CI succeeds on **push** to `main` | Build/push Docker images and redeploy Scaleway Serverless Containers |

## One-time setup: GitHub repository secrets

In the GitHub repo go to **Settings → Secrets and variables → Actions → New repository secret**.

| Secret | Description |
|--------|-------------|
| `SCW_ACCESS_KEY` | Scaleway API **Access Key** (Key Id), e.g. `SCW…` |
| `SCW_SECRET_KEY` | Scaleway API **Secret Key** (used for `docker login` password and CLI) |
| `SCW_DEFAULT_PROJECT_ID` | Project UUID from [Scaleway console](https://console.scaleway.com/project/settings) |
| `SCW_DEFAULT_ORGANIZATION_ID` | Organization UUID from project settings |
| `SCW_CONTAINER_API_ID` | Serverless Container UUID for `paas4bat-api` |
| `SCW_CONTAINER_WEB_ID` | Serverless Container UUID for `paas4bat-web` |
| `VITE_API_URL` | Public HTTPS URL of the API container (no trailing slash), baked into the frontend at build time |

### Finding container IDs

With the Scaleway CLI configured locally:

```bash
scw container container list region=fr-par
```

Or open each container in the [Scaleway console](https://console.scaleway.com/serverless-containers/containers) — the UUID is in the URL.

### `VITE_API_URL`

Use the stable public URL of your API Serverless Container, for example:

`https://<your-api-container>.functions.fnc.fr-par.scw.cloud`

It must match the URL you use when building the frontend manually. It does **not** change on every deploy unless you recreate the container.

### API credentials for Docker registry

Registry login uses:

- **Username:** `nologin`
- **Password:** your API **Secret Key** (`SCW_SECRET_KEY`)

The **Access Key** is only required for the Scaleway CLI redeploy steps.

## What deploy does

1. Checks out the commit that passed CI on `main`.
2. Builds `linux/amd64` images for `./backend` and `./frontend`.
3. Pushes to `rg.fr-par.scw.cloud/namespace-paas4bat/` with tags `latest` and the commit SHA.
4. Runs `scw container container redeploy` for the API and web containers so they pull the new `latest` images.

## Security

- Never commit API keys or secret keys to the repository.
- If a secret was shared in chat, email, or logs, **rotate it** in the Scaleway console and update GitHub secrets.
- Restrict repository access so only trusted collaborators can read Actions secrets.

## Manual deploy (fallback)

See [README.md](../README.md#scaleway-deployment) and [technical-report.md](technical-report.md) for local `docker build` / `docker push` steps.
