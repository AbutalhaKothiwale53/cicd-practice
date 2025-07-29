# GitHub CI/CD Hands-on Guide

CI/CD: Node.js projects, automated testing and deployments, variables/secrets, notifications, caching, artifacts, Slack/email, and advanced workflows.

---

## 1. Hands-on: First Steps

**CI/CD?**  
- _CI_ (Continuous Integration): automatically test and merge code with each change.  
- _CD_ (Continuous Deployment/Delivery): automatically deploy after a successful build.

### Step 1: Create a GitHub Account and New Repository

- Sign up: [GitHub](https://github.com)
- Click **New repository**, name it `cicd-practice` (public/private).

### Step 2: Enable GitHub Actions (CI/CD)

- Click the **Actions** tab.
- Choose a suggested template or “set up a workflow yourself”.

### Step 3: Your First Workflow

```yaml
name: Basic CI
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Hello, GitHub Actions!"
```

---

## 2. Node.js Project with Test Workflow

**Why?**  
Automate testing for every code change.

### Step 1: Set Up Local Project

```bash
mkdir simple-node-app \&\& cd simple-node-app
npm init -y
npm install jest
```

**`index.js`**:

```javascript
function sum(a, b) {
  return a + b;
}
module.exports = sum;
```

**Add to `package.json`**:

```json
"scripts": {
"test": "jest"
}
```

**`index.test.js`**:

```javascript
const sum = require("./index");
test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3);
});
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

`.github/workflows/nodejs.yml`:

```yaml
name: Node.js CI
on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm install
      - run: npm test
```

---
## 3. Extend & Improve

### 🧪 Add More Tests

**`index.test.js`**:

```javascript
test("adds negative numbers", () => {
  expect(sum(-1, -2)).toBe(-3);
});
test("adds 0 + 0 to equal 0", () => {
  expect(sum(0, 0)).toBe(0);
});
```

Push changes and view CI result.

### 🚀 Simulate a Deployment

Add after tests in `nodejs.yml`:

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

### 🌳 Deploy Only from Main Branch

Restrict workflow:

```yaml
on:
  push:
    branches: [main]
```

---

## 4. Use Secrets and Variables

- **Environment Variables**: Share metadata/config.
- **Secrets**: Store credentials/tokens securely (never in code).

### Step 1: Add Secrets

GitHub repo → **Settings > Secrets and variables > Actions > New repository secret**

- e.g., `API_KEY`, `DEPLOY_TOKEN`

### Step 2: Use Secrets/Vars in Workflow

```yaml
jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    env:
      GLOBAL_ENV_VAR: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm install
      - run: npm test
      - run: echo "Global env var is $GLOBAL_ENV_VAR"
      - run: |
          echo "Using secret API key..."
        env:
          API_KEY: ${{ secrets.API_KEY }}
      - run: echo "Deploying with token..."
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

---

## 5. Deploying to Vercel via GitHub Actions

Automated cloud deployment for Node/React/Next.js.

### Step 1: Create Vercel Account

- [vercel.com](https://vercel.com/), sign up and connect GitHub.

### Step 2: Import Your Repo

- Dashboard: **New Project** → import your GitHub repo.

### Step 3: Generate a Vercel Token

1. Log in to Vercel.
2. Profile (top right) → **Settings** → **Tokens** → **Create**.
3. Name and create token. **Copy it!**

### Step 4: Add Token as Secret

GitHub repo → **Settings > Secrets and variables > Actions → New repository secret**

- Name: `VERCEL_TOKEN`
- Value: (your token)

### Step 5: Workflow for Deploy

`.github/workflows/deploy.yml`:

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
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm test

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

### Step 6: Test Deployment

- Commit & push to `main`.
- Check **Actions** tab for run.
- Visit your Vercel domain.

---

## 6. Advanced: Notifications (Slack & Email)

**Why?**  
CI/CD notifications alert you/team on build success or failure.

### 🟦 Slack Notifications

1. [How to send detailed Slack notifications (Step by step)](https://hackernoon.com/how-to-send-detailed-slack-notifications-from-github-actions-v89k9h9)

   - Create Slack App, enable **Incoming Webhooks**.
   - Note the webhook URL.
   - Add `SLACK_WEBHOOK_URL` as a repo secret.

2. Add to workflow:

```yaml
- name: Notify Slack
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
  run: |
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"✅ CI/CD workflow succeeded!"}' \
      $SLACK_WEBHOOK_URL
```

- For only failures: `if: failure()`
- For only success: `if: success()`

### 📧 Email Notifications (Optional)

- Use [`dawidd6/action-send-mail`](https://github.com/dawidd6/action-send-mail) with SMTP creds in secrets.

---

## 7. Caching Dependencies

**Why?**  
Speed up workflows by restoring node_modules if dependencies haven’t changed.

```yaml
- name: Cache dependencies
  uses: actions/cache@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
- run: npm install
```

---

## 8. Uploading & Downloading Build Artifacts

**Why?**  
Artifacts save build/test output for later download or other jobs.

```yaml
- name: Upload test coverage report
  uses: actions/upload-artifact@v4
  with:
    name: coverage-report
    path: coverage/
```

---
## 9. Matrix Builds: Multiple Node.js Versions
Test on many environments (e.g., Node 18 & 20) in parallel—real-world reliability!

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm install
      - run: npm test
```

---

## 10. Recap & Interview Readiness

- **Create repos & enable Actions**
- **Automate Node.js tests**
- **Use secrets, environment vars**
- **Deploy to Vercel**
- **Get Slack/email notifications**
- **Speed up with caching**
- **Store/download artifacts**
