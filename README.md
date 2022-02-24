# Content Set Player

A generic player for playing different types of content (questions, etc.) in a mobile-friendly webapp.

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
