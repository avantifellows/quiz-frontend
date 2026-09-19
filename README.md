# Quiz Frontend

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![codecov](https://codecov.io/gh/avantifellows/quiz-frontend/branch/main/graph/badge.svg)](https://codecov.io/gh/avantifellows/quiz-frontend)
[![Cypress](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/simple/ux33ap/main&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/ux33ap/runs)
[![Discord](https://img.shields.io/discord/717975833226248303.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2&style=flat-square)](https://discord.gg/29qYD7fZtZ)

A generic quiz engine for serving different types of questions (mcq, subjective, images, audio etc.) in a mobile-friendly webapp. The backend can be found [here](https://github.com/avantifellows/quiz-backend).

**Table of Contents**

- [Infrastructure](#infrastructure)
- [Project Setup](#project-setup)
  - [Pre-requisites](#pre-requisites)
    - [Backend](#backend)
    - [Pre-commit](#pre-commit)
  - [Installation](#installation)
  - [Compile and setup hot-reloading for development](#compile-and-setup-hot-reloading-for-development)
  - [Build for deployment](#build-for-deployment)
    - [Staging](#staging)
    - [Production](#production)
  - [Deployment](#deployment)
  - [Run the unit tests](#run-the-unit-tests)
  - [Run the end-to-end tests](#run-the-end-to-end-tests)

## Infrastructure

The quiz frontend relies on the following infrastructure and architecture:

- **Environment Management**: Environment variables are used to configure backend endpoints (`VUE_APP_BACKEND`, `VUE_APP_PORTAL_BACKEND`, etc.). See `docs/ENV.md` for details.
- **Node Versioning**: The Node.js version is pinned to `20.12.0` via `.nvmrc` to ensure consistent builds across all developer environments.
- **Docker**: A `Dockerfile.dev` and `docker-compose.yml` are provided to easily spin up both the frontend and backend services together for local development.
- **CI/CD Pipelines**: Automated workflows in GitHub Actions (`.github/workflows`) handle linting, unit tests, end-to-end tests, and production/staging deployments to AWS S3. A weekly dependency audit workflow runs to catch vulnerabilities.
- **Main Entry Point**: The primary orchestrator component for the quiz application is located at `src/views/Player.vue`.

## Project Setup

### Pre-requisites

#### Backend

Ensure that the backend is up and running by following the setup instructions [here](https://github.com/avantifellows/quiz-backend#installation).

#### Pre-commit

The project uses `pre-commit` for identifying and fixing simple issues before you even make a commit.

1. Install pre-commit
   Use `pip` to install pre-commit

   ```sh
   pip install pre-commit
   ```

   Or using homebrew on macOS

   ```sh
   brew install pre-commit
   ```

   For more installation alternatives, check out [Pre-commit official documentation](https://pre-commit.com/#install).

2. Verify pre-commit installation
   ```sh
   pre-commit --version
   ```

### Installation

- Install the packages

```
npm install
```

- Install `pre-commit`

```
pre-commit install
```

- Copy `.env.example` to `.env.local` and set the appropriate values of the environment variables. The list of all environment variables along with their meanings can be found in [ENV.md](./docs/ENV.md)

### Compile and setup hot-reloading for development

```
npm run serve
```

You can access the web app at `http://localhost:8080/quiz/{quizId}?userId={userId}&apiKey={apikey}`. Here, `{quizId}` should be replaced by a valid ID corresponding to an actual quiz created using the backend and `{userId}` can be any valid user identifier. For now, there are no explicit checks in place for `userId`. So, you can use any valid string (eg: `20`). Please contact the repository developers for `{apiKey}`.

### Build for deployment

#### Staging

- Copy `.env.example` to `.env.staging` and set the appropriate values of the environment variables.

- Run the following command

```
npm run build -- --mode staging
```

#### Production

- Copy `.env.example` to `.env.production` and set the appropriate values of the environment variables.

- Run the following command

```
npm run build
```

### Deployment

The actual deployment happens through Github Actions. Look at `.github/workflows/deploy_to_s3_staging.yml` for understanding the deployment to `Staging` and `.github/workflows/deploy_to_s3_prod.yml` for `Production`. Make sure to set all the environment variables mentioned in `docs/ENV.md` in the `Production` and `Staging` environments in your Github repository.

### Run the unit tests

```
npm run test:unit
```
To run unit tests for individual spec files (say, for Header component), use:
```
npm run test:unit -- Header.spec.ts
```

### Run the end-to-end tests

```
npx cypress run
```
