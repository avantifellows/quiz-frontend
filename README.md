# Question Set Player

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![codecov](https://codecov.io/gh/avantifellows/content-set-player/branch/main/graph/badge.svg)](https://codecov.io/gh/avantifellows/content-set-player)
[![Cypress](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/simple/ux33ap/main&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/ux33ap/runs)
[![Discord](https://img.shields.io/discord/717975833226248303.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2&style=flat-square)](https://discord.gg/29qYD7fZtZ)

A generic player for playing different types of questions (mcq, subjective, images, audio etc.) in a mobile-friendly webapp.

**Table of Contents**

- [Project Setup](#project-setup)
  - [Pre-requisites](#pre-requisites)
    - [Pre-commit](#pre-commit)
  - [Installation](#installation)
  - [Compiles and hot-reloads for development](#compiles-and-hot-reloads-for-development)
  - [Compiles and minifies for production](#compiles-and-minifies-for-production)
  - [Run the unit tests](#run-the-unit-tests)
  - [Run the end-to-end tests](#run-the-end-to-end-tests)

## Project Setup

### Pre-requisites

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

```
npm install
pre-commit install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Run the unit tests

```
npm run test:unit
```

### Run the end-to-end tests

```
npx cypress run
```
