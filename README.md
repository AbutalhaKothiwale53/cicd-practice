# GitHub CI/CD Hands-on Guide

## 1. Hands-on: First Steps

### Step 1: Create a GitHub Account and New Repository

1. Go to [GitHub](https://github.com) and sign up if you don't have an account
2. Click 'New repository' and create one named `cicd-practice` (public or private)

### Step 2: Enable GitHub Actions (CI/CD) on Your Repo

1. In your new repo, click the 'Actions' tab
2. GitHub suggests workflow templates (start with "Simple Workflow" or click "set up a workflow yourself")

### Step 3: Your First Workflow (Beginner Level)

Let's set up a basic CI workflow that runs when you push code to your main branch.

1. Click "New workflow" and choose "set up a workflow yourself"
2. Paste the following YAML into the editor:

```yaml
name: Basic CI

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run a one-line script
        run: echo "Hello, GitHub Actions!"
```

## 2. Node.js Project with Test Workflow

### Step 1: Set Up Local Project

```bash
mkdir simple-node-app && cd simple-node-app
npm init -y
npm install jest
```

Create index.js:

```js
function sum(a, b) {
  return a + b;
}
module.exports = sum;
```

Update package.json:

```json
"scripts": {
  "test": "jest"
}
```

### Step 2: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial Node.js project with test"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 3: Node.js Test Workflow

Create .github/workflows/nodejs.yml:

```yaml
name: Node.js CI

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
```

This workflow runs on every push, installs dependencies, and runs your tests.

## 3. Extend and Improve

🧪 Add More Tests
Update index.test.js:

```js
test("adds negative numbers", () => {
  expect(sum(-1, -2)).toBe(-3);
});

test("adds 0 + 0 to equal 0", () => {
  expect(sum(0, 0)).toBe(0);
});
```

Push changes and check the CI result.

## 🚀 Simulate a Deployment

Add this step after tests in nodejs.yml:

```yaml
- name: Simulate deployment
  if: success()
  run: echo "Deploying to staging (simulated)..."
```

### 🔐 Use Environment Variables

```yaml
- name: Show environment variable
  run: echo "ENV IS $MY_ENV_VAR"
  env:
    MY_ENV_VAR: production
```

## 🌳 Deploy Only from Main Branch

```yaml
on:
  push:
    branches: [main]
```

## 4. Environment Key and Secret Key

- Environment Variables: Used to pass metadata and config values to your jobs/steps.
- Secrets: Encrypted environment variables stored securely in GitHub for sensitive info like API keys, tokens, passwords.

### Step 1: Add Secrets to Your Repository

- Go to your GitHub repository ➡️ Settings ➡️ Secrets and variables ➡️ Actions ➡️ New repository secret.
- Add a secret called API_KEY (you can make up a dummy key like dummy-api-key-1234).
- You can add as many secrets as needed (for example, DEPLOY_TOKEN).

### Step 2: Update Your Workflow to Use Secrets and Variables

Edit your .github/workflows/nodejs.yml file to use secrets and variables as environment variables in the workflow steps.

```yaml
name: Node.js CI with Secrets

on:
  push:
    branches:
      - main

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    env:
      GLOBAL_ENV_VAR: production
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Use environment variable
        run: echo "Global env var is $GLOBAL_ENV_VAR"

      - name: Use secret
        run: |
          echo "Using secret API key..."
          # For demonstration only: Never echo secrets in real workflows
          # echo "API_KEY = ${{ secrets.API_KEY }}"
        env:
          API_KEY: ${{ secrets.API_KEY }}

      - name: Simulate deployment with secrets
        run: |
          echo "Deploying with token..."
          # Example deploying command using $DEPLOY_TOKEN (if you have added it)
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```
___
# Deploying Code to Vercel via GitHub Actions

Follow these steps to deploy this project to Vercel with CI/CD and secrets integration.

### 1. Create a Vercel Account
- Go to vercel.com, sign up, and connect your GitHub account.
### 2. Import Your GitHub Repository to Vercel
- In the Vercel dashboard, click “New Project”.
- Import your repository (e.g., cicd-practice).
- Configure build settings (usually automatic for Node.js/React/Next.js).
- Complete setup; Vercel will assign a deployment URL like your-app.vercel.app.

### 3. Generate a Vercel Token
1. Log into your Vercel account.
2. Click your profile picture (top right) → Settings.
3. In the sidebar, click “Tokens”.
4. Click “Create” to make a new token.
5. Name your token, set expiration if needed, and click “Create Token”.
6. Copy the token immediately and save it securely. (You can’t see it again!)

### 4. Add the Token as a GitHub Secret
- In your GitHub repo, go to Settings → Secrets and variables → Actions → New repository secret.
- Name the secret VERCEL_TOKEN.
- Paste your copied Vercel token into the value field and save.

### 5. Configure GitHub Actions Workflow
Add the following workflow YAML file to .github/workflows/deploy.yml:
```yaml
name: Node.js CI & Deploy

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          npm install -g vercel
          vercel --prod --token $VERCEL_TOKEN --confirm --cwd .
```

### 6. Test Your Deployment
- Make a commit & push to main branch.
- Go to the Actions tab in GitHub to verify your workflow ran and deployed successfully.
- Check your live site at the Vercel-provided domain.