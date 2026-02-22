# CI/CD & Jenkins Interview Notes

## Table of Contents
1. [CI/CD Overview](#cicd-overview)
2. [CI/CD Pipeline Explained](#cicd-pipeline-explained)
3. [GitHub Actions Workflow](#github-actions-workflow)
4. [Jenkins Overview](#jenkins-overview)
5. [Maven & Build Tools](#maven--build-tools)
6. [Testing in CI/CD](#testing-in-cicd)
7. [Common Interview Questions](#common-interview-questions)

---

## CI/CD Overview

### What is CI/CD?

**CI (Continuous Integration)**: Automatically integrating code changes from multiple developers into a central repository several times a day, with automated tests running on each integration.

**CD (Continuous Delivery/Deployment)**: Automatically preparing code changes for release to production and deploying them automatically.

### Benefits of CI/CD:
- **Fast Feedback**: Developers know immediately if their code breaks something
- **Reduced Manual Work**: Automation removes repetitive tasks
- **Quality Assurance**: Automated tests catch bugs early
- **Faster Releases**: Code can be deployed to production multiple times per day
- **Reduced Risk**: Smaller, frequent deployments are safer than large, infrequent ones

---

## CI/CD Pipeline Explained

### What is a Pipeline?

A pipeline is a series of automated steps that code goes through from development to production.

### Basic Pipeline Stages:

```
Source Code → Build → Test → Coverage → Deploy → Monitor
```

### Your Node.js Project Pipeline (Real Example)

Your GitHub Actions workflow (`nodejs.yml`) demonstrates a real-world CI/CD pipeline:

#### Stage 1: **Trigger**
```yaml
on:
  push:
    branches: [ main ]
```
- Pipeline runs automatically when code is pushed to the main branch
- Eliminates manual intervention; developers just push code

#### Stage 2: **Checkout**
```yaml
- uses: actions/checkout@v4
```
- GitHub Actions fetches your source code from the repository
- This is the "Source Code" stage - everything starts here

#### Stage 3: **Setup Environment**
```yaml
- name: Set up Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
```
- Prepares the environment with required tools
- Similar to setting up a fresh machine with Node.js installed
- Ensures consistency across all builds

#### Stage 4: **Build**
```yaml
- name: Install dependencies
  run: npm install
```
- Installs all dependencies from `package.json`
- Your `package.json` specifies:
  ```json
  {
    "dependencies": {
      "jest": "^30.0.5"
    },
    "scripts": {
      "test": "jest --coverage"
    }
  }
  ```
- Without this step, your code can't run (no dependencies loaded)

#### Stage 5: **Test**
```yaml
- name: Run tests with coverage
  run: npm test -- --coverage
```
- Executes your test suite automatically
- Your tests in `index.test.js`:
  ```javascript
  test("adds negative numbers", () => {
    expect(sum(-1, -2)).toBe(-3);
  });
  
  test("Multiply numbers", () => {
    expect(multiply(2,3)).toBe(6)
  });
  ```
- If any test fails, the pipeline stops (fail fast principle)
- Coverage report is generated

#### Stage 6: **Artifact Upload**
```yaml
- name: Upload code coverage
  uses: actions/upload-artifact@v4
  with:
    name: code-coverage
    path: coverage/
```
- Saves the coverage report for review
- Coverage reports show how much of your code is tested
- Helps identify untested code paths

#### Stage 7: **Environment Variables & Secrets**
```yaml
- name: Show environment variables
  run: echo "Environment is $MY_ENV_VAR"
  env: 
    MY_ENV_VAR: "Develop"

- name: Use secret
  run: echo "API_KEY = ${{ secrets.API_KEY }}"
  env:
    API_KEY: ${{ secrets.API_KEY }}
```
- Environment variables: Configuration values that change per environment
- Secrets: Sensitive data like API keys, tokens, passwords
- **Important**: Secrets are masked in logs and never exposed

#### Stage 8: **Deployment** (Optional)
```yaml
- name: Deploy to Vercel
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  run: |
    npm install -g vercel
    vercel --prod --token $VERCEL_TOKEN --confirm --cwd .
```
- Deploys the application to production using Vercel
- Only runs if all previous steps succeed
- Demonstrates continuous deployment (CD) in action

### Why This Pipeline is Effective:

1. **Automation**: No manual steps, reducing human error
2. **Consistency**: Same process every time
3. **Visibility**: Logs show exactly what happened at each stage
4. **Fail Fast**: Stops immediately if tests fail
5. **Traceability**: Can see which commit caused a failure
6. **Scalability**: Can test on multiple Node versions if configured

---

## GitHub Actions Workflow

### What is GitHub Actions?

GitHub's built-in CI/CD platform that runs workflows based on events (push, pull request, schedule, etc.).

### Key Concepts:

**Workflow**: YAML file defining the automation process
- Located in `.github/workflows/` directory
- Triggered by events: `push`, `pull_request`, `schedule`, `workflow_dispatch`

**Job**: A set of steps running on the same runner
```yaml
jobs:
  test:  # Job name
    runs-on: ubuntu-latest  # Environment
```

**Step**: Individual task within a job
```yaml
steps:
  - uses: actions/checkout@v4  # Use a pre-built action
  - run: npm install           # Run custom command
```

**Action**: Reusable unit of code
- `actions/checkout@v4` checks out your code
- `actions/upload-artifact@v4` uploads files
- `actions/setup-node@v4` installs Node.js

### Your Workflow Structure:

```yaml
name: Node.js CI                    # Workflow name
on:                                 # Trigger conditions
  push:
    branches: [ main ]

jobs:
  test:                             # Job definition
    runs-on: ubuntu-latest          # Runner (VM environment)
    steps:                          # Steps to execute
      - uses: actions/checkout@v4
      - name: Set up Node.js
        uses: actions/setup-node@v4
      - # ... more steps
```

### Understanding Artifacts in Your Workflow:

```yaml
- name: Upload code coverage
  uses: actions/upload-artifact@v4
  with:
    name: code-coverage
    path: coverage/
```

**Why artifacts matter:**
- Your test generates `coverage/` folder with:
  - `coverage-final.json`: Machine-readable coverage data
  - `lcov.info`: Coverage data in LCOV format
  - `lcov-report/`: HTML report showing covered lines
- Artifacts are stored for 90 days by default
- Can be downloaded for analysis

---

## Jenkins Overview

### What is Jenkins?

Jenkins is a **self-hosted CI/CD server** that automates parts of your software development process. Unlike GitHub Actions (cloud-based), Jenkins runs on your own infrastructure.

### Jenkins vs GitHub Actions:

| Aspect | Jenkins | GitHub Actions |
|--------|---------|---|
| **Hosting** | Self-hosted (your server) | Cloud-hosted (GitHub) |
| **Setup** | Complex installation needed | Built into GitHub |
| **Plugins** | Extensive plugin ecosystem | Marketplace actions |
| **Control** | Full control over infrastructure | Limited to GitHub's offerings |
| **Cost** | Free but infrastructure costs | Free for public repos |
| **Learning Curve** | Steeper | Easier for GitHub users |

### Your Java Project Structure (Jenkins Ready)

Your project demonstrates Maven + JUnit testing, which is perfect for Jenkins pipelines:

```
Mave-Jenkins-Test/
├── pom.xml                          # Maven configuration (Build tool)
├── src/
│   ├── main/java/
│   │   └── com/jenkins/train/
│   │       └── JenkinsCalculator.java    # Source code
│   └── test/java/
│       └── com/jenkins/train/
│           └── JenkinsCalculatorTest.java # Unit tests
└── target/                          # Build artifacts (generated)
```

### Maven in Jenkins Pipeline

**Maven** is a build automation tool (like npm for Java). The `pom.xml` is key:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.jenkins.train</groupId>
    <artifactId>Mave-Jenkins-Test</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13.1</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

**Key Components:**
- `<groupId>`: Organization identifier (like company domain)
- `<artifactId>`: Project name
- `<version>`: Project version (SNAPSHOT = development, not final)
- `<dependencies>`: Required libraries
  - JUnit is added only for testing (`<scope>test</scope>`)

### A Typical Jenkins Pipeline for Your Java Project:

```groovy
pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/yourrepo/Mave-Jenkins-Test.git'
            }
        }
        
        stage('Build') {
            steps {
                sh 'mvn clean compile'  // Compiles the code
            }
        }
        
        stage('Test') {
            steps {
                sh 'mvn test'  // Runs your JUnit tests
            }
        }
        
        stage('Reports') {
            steps {
                junit '**/target/surefire-reports/*.xml'  // Parse test results
                publishHTML([reportDir: 'target/site/jacoco', 
                           reportFiles: 'index.html',
                           reportName: 'Code Coverage'])
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'  // Only deploy from main branch
            }
            steps {
                sh 'mvn deploy'  // Deploys to artifact repository
            }
        }
    }
    
    post {
        always {
            deleteDir()  // Clean up workspace
        }
    }
}
```

---

## Maven & Build Tools

### What is Maven?

Maven is a build automation tool that:
1. **Manages Dependencies**: Downloads required libraries automatically
2. **Compiles Code**: Converts Java source to bytecode
3. **Runs Tests**: Executes JUnit tests
4. **Packages Application**: Creates JAR/WAR files
5. **Deploys Application**: Uploads to repositories

### Maven Build Lifecycle:

```
clean → compile → test → package → deploy
```

#### Clean
```bash
mvn clean
```
- Removes the `target/` directory
- Starts fresh for a new build
- Ensures no stale compiled files

#### Compile
```bash
mvn compile
```
- Compiles `src/main/java/**/*.java` → Class files in `target/classes/`
- Resolves dependencies from `pom.xml`
- Your `JenkinsCalculator.java` becomes compiled bytecode

#### Test
```bash
mvn test
```
- Compiles test source code
- Runs all tests in `src/test/java/`
- **Your Test Example**:
  ```java
  public class JenkinsCalculatorTest {
      @Test
      public void addTest(){
          JenkinsCalculator myCal = new JenkinsCalculator();
          assertEquals(10, myCal.addNum(5,5));  // Assert: 5+5 should equal 10
      }
      
      @Test
      public void subTest(){
          JenkinsCalculator myCal = new JenkinsCalculator();
          assertEquals(2, myCal.subNum(4,2));   // Assert: 4-2 should equal 2
      }
  }
  ```
- If any test fails, the pipeline stops
- Output stored in `target/surefire-reports/`

#### Package
```bash
mvn package
```
- Creates JAR file from compiled code
- Name format: `ArtifactId-Version.jar`
- For your project: `Mave-Jenkins-Test-1.0-SNAPSHOT.jar`

#### Deploy
```bash
mvn deploy
```
- Uploads packaged artifact to artifact repository (Nexus, Artifactory)
- Makes it available for other projects to use as dependency

### Your Project's Build Output:

```
target/
├── classes/                         # Compiled production code
│   └── com/jenkins/train/JenkinsCalculator.class
├── test-classes/                    # Compiled test code
│   └── com/jenkins/train/JenkinsCalculatorTest.class
├── surefire-reports/                # Test reports
│   ├── com.jenkins.train.JenkinsCalculatorTest.txt
│   └── TEST-com.jenkins.train.JenkinsCalculatorTest.xml
├── maven-status/                    # Build metadata
│   └── maven-compiler-plugin/
│       ├── compile/
│       │   └── inputFiles.lst        # Source files that were compiled
│       └── testCompile/
│           └── default-testCompile/
└── Mave-Jenkins-Test-1.0-SNAPSHOT.jar  # Final packaged application
```

---

## Testing in CI/CD

### Why Testing is Critical in CI/CD

In CI/CD, tests are the **safety net** that prevents broken code from reaching production.

### Types of Tests:

#### 1. Unit Tests (Most Common in CI/CD)

**Definition**: Tests a single function/method in isolation

**Your Examples:**

**Java (JUnit)**:
```java
@Test
public void addTest(){
    JenkinsCalculator myCal = new JenkinsCalculator();
    assertEquals(10, myCal.addNum(5,5));
}
```
- Creates instance of `JenkinsCalculator`
- Tests the `addNum()` method
- Asserts the result is "10"
- If assertion fails, test fails, pipeline stops

**Node.js (Jest)**:
```javascript
test("adds negative numbers", () => {
  expect(sum(-1, -2)).toBe(-3);
});

test("Multiply numbers", () => {
  expect(multiply(2,3)).toBe(6)
});
```
- Tests individual functions
- `expect()` checks that function returns correct value
- Runs with `npm test -- --coverage`

#### 2. Integration Tests

Tests how multiple components work together (not in your current examples, but important for interviews).

#### 3. End-to-End Tests

Tests the entire application flow from user perspective (not in your current examples).

### Test Coverage

**What is Coverage?**

A metric showing what percentage of your code is executed by tests.

**Your Coverage Setup**:
```json
{
  "scripts": {
    "test": "jest --coverage"
  }
}
```

**Coverage Output** (in your `coverage/` folder):
- `coverage-final.json`: Machine-readable data
- `lcov.info`: Standard coverage format
- `lcov-report/index.html`: Visual report

**Example Coverage Report Structure**:
```
coverage/
├── lcov-report/
│   └── index.js.html          # Shows which lines were tested
│       - Green lines: Covered (tested)
│       - Red lines: Not covered (untested)
│       - Yellow lines: Partially covered
```

**Why it Matters for Interviews**:
- Code coverage >= 80% is industry standard
- Shows you write testable code
- Identifies edge cases you missed
- Demonstrates software quality mindset

---

## Common Interview Questions & Answers

### 1. What is the difference between CI and CD?

**Answer:**
- **CI (Continuous Integration)**: Developers integrate code multiple times per day. Automated tests run on each integration to catch issues early.
- **CD (Continuous Delivery)**: Code is automatically prepared for release (built, tested, packaged) but deployment to production is manual.
- **CD (Continuous Deployment)**: Code is automatically deployed to production without manual approval.

**Example from your work**: Your GitHub Actions workflow runs tests on every push (CI), and can automatically deploy to Vercel (CD).

### 2. Why should we use CI/CD?

**Answer:**
- **Speed**: Automation reduces cycle time from days to hours/minutes
- **Reliability**: Automated tests catch bugs before humans see them
- **Quality**: Consistent process every time
- **Feedback**: Developers know within minutes if their code is broken
- **Risk Reduction**: Small, frequent deployments are safer than big releases
- **Cost**: Less manual work, fewer production issues

### 3. Explain your CI/CD pipeline implementation

**Answer:**
"I implemented a GitHub Actions workflow for a Node.js application with these stages:

1. **Trigger**: Runs on every push to main branch
2. **Checkout**: Fetches the code
3. **Setup**: Installs Node.js 20
4. **Install**: Runs `npm install` to get dependencies from `package.json`
5. **Test**: Runs `npm test -- --coverage` using Jest
6. **Coverage Upload**: Saves coverage reports as artifacts
7. **Deployment**: Automatically deploys to Vercel on success

The workflow ensures code quality before production."

### 4. What happens if a test fails in your pipeline?

**Answer:**
"The entire pipeline stops. If any test fails:
- The Jest test runner returns a non-zero exit code
- GitHub Actions detects this and marks the job as failed
- The deployment step never runs
- Developers get notified and must fix the failing test
- Only after pushing the fix does the pipeline run again

This is the 'fail fast' principle - we catch issues immediately rather than letting bad code progress through the pipeline."

### 5. How would you implement this in Jenkins instead of GitHub Actions?

**Answer:**
"Jenkins would:
1. Poll the repository for changes (or use webhooks)
2. Check out the code on the Jenkins server
3. Compile with Maven: `mvn clean compile`
4. Run tests: `mvn test`
5. Generate reports from `target/surefire-reports/*.xml`
6. Package code: `mvn package`
7. Deploy the JAR file

Key differences from GitHub Actions:
- Jenkins runs on your own server (more control but more maintenance)
- Uses plugins instead of Actions from marketplace
- Requires Groovy-based Jenkinsfile instead of YAML
- No built-in secrets management (needs Jenkins credentials)

For your Java project, the Maven build cycle handles all compilation and testing automatically."

### 6. What are Maven goals and why do we need them?

**Answer:**
"Maven goals are specific tasks in the build lifecycle:

- `mvn clean`: Removes build artifacts
- `mvn compile`: Compiles source code (src/main/java)
- `mvn test`: Runs unit tests (src/test/java)
- `mvn package`: Creates JAR/WAR file
- `mvn deploy`: Uploads to repository

In your project's pom.xml, we specify:
- Java version 21 (compiler settings)
- JUnit dependency for testing
- Project artifact name and version

When Jenkins runs `mvn clean compile`, Maven:
1. Reads pom.xml
2. Downloads dependencies (JUnit in your case)
3. Compiles all Java files
4. Outputs to target/ directory"

### 7. Why use version control and automated testing together?

**Answer:**
"They work synergistically:
- **Version Control** (Git): Tracks every code change with commit messages
- **Automated Testing**: Validates each change automatically

Together they enable:
1. **Accountability**: You know who made what change and when
2. **Reversibility**: You can revert bad changes knowing tests will catch them
3. **Confidence**: Every merged code has passed tests
4. **Code Review**: PRs show test results before merging

Example from your work:
- You push code with a test failure
- GitHub Actions immediately runs your Jest tests
- It catches the bug before code reaches main branch
- You fix and push again
- Tests pass, code is merged safely"

### 8. What is a Dockerfile and how does it fit into CI/CD?

**Answer:**
"A Dockerfile defines how to package your application into a Docker container - a lightweight, isolated environment.

In CI/CD pipelines:
1. **Build Stage**: Docker image is created with all dependencies
2. **Test Stage**: Tests run in the same environment every time (consistency)
3. **Deploy Stage**: The tested image is deployed to production

Benefits:
- 'Works on my machine' problems disappear
- Same environment from dev to production
- Easy to scale (deploy same image multiple times)
- Easier than installing Java, Maven, dependencies manually

Your Jenkins pipeline could be enhanced:
```bash
docker build -t myapp:v1.0 .
docker run myapp:v1.0 mvn test
docker push myapp:v1.0  # Push to registry
```"

### 9. How do you handle secrets in CI/CD?

**Answer:**
"Secrets (API keys, passwords, tokens) must never be in code. GitHub Actions handles this:

```yaml
- name: Use secret
  run: echo ${{ secrets.API_KEY }}
  env:
    API_KEY: ${{ secrets.API_KEY }}
```

How it works:
1. Secrets are stored encrypted in GitHub
2. At runtime, secret value is injected into environment
3. Environment variables are masked in logs (shows ***)
4. Never written to code or logs

For Jenkins:
- Use Jenkins Credentials Plugin
- Store in Jenkins UI (encrypted)
- Reference in Jenkinsfile as `${CREDENTIALS}`

Best Practices:
- Rotate secrets regularly
- Use least privilege (token only needs necessary permissions)
- Different secrets for each environment (dev, staging, prod)
- Never commit secrets to git (add to .gitignore)"

### 10. How do you debug a pipeline failure?

**Answer:**
"Step-by-step debugging:

1. **Check workflow/build logs**: GitHub Actions/Jenkins shows exact error
2. **Identify stage**: Which step failed (build, test, deploy)?
3. **Reproduce locally**: Run same command on your machine
   ```bash
   npm test -- --coverage  # Reproduces GitHub Actions test step
   mvn clean test          # Reproduces Jenkins test step
   ```
4. **Read error message carefully**: Usually tells you exactly what's wrong
5. **Fix and push**: For GitHub Actions, just re-push
6. **Check artifacts**: Review test reports, coverage, logs
7. **Rollback if needed**: Revert commit if it breaks production

Example strategy:
- Your pipeline fails on `npm test`
- Look at logs, see 'Expected 6 but got 5'
- Run `npm test` locally to reproduce
- See which test is failing
- Check if you broke something in index.js
- Fix and commit
- Push triggers workflow again"

---

## Real-World Scenario Summary

### Your Node.js + GitHub Actions Setup:
1. **Developer** writes code for calculator functions (sum, multiply, subtract)
2. **Developer** writes Jest tests to verify functions work
3. **Push to GitHub** triggers workflow automatically
4. **GitHub Actions**:
   - Sets up Node.js
   - Installs dependencies
   - Runs all tests
   - Generates coverage report
   - Deploys to Vercel if successful
5. **Deployment**: App is live for users
6. **Failure**: If any test fails, deployment is blocked - code is safe

### Your Java + Maven + Jenkins Setup:
1. **Developer** writes Java calculator code with business logic
2. **Developer** writes JUnit tests for each method
3. **Push to Git** or **Jenkins webhook** triggers build
4. **Jenkins**:
   - Checks out code
   - Downloads dependencies via Maven
   - Compiles with `javac`
   - Runs JUnit tests
   - Generates test reports
   - Packages into JAR file
   - Deploys to application server
5. **Reports**: Team sees which tests passed/failed
6. **Notification**: Developers notified of failures

---

## Key Takeaways for Interview

1. **Understand the "why"**: CI/CD is about quality, speed, and confidence - not just automation
2. **Know both sides**: Cloud-based (GitHub Actions) and self-hosted (Jenkins)
3. **Understand build tools**: Maven for Java, npm for Node.js
4. **Testing is central**: All CI/CD is built around automated testing
5. **Real examples**: Be ready to explain your own projects in detail
6. **Common terms**: Pipeline, stage, artifact, deployment, coverage, secrets
7. **Troubleshooting**: Know how to debug failures by reading logs
8. **Best practices**: Keep secrets safe, test thoroughly, deploy frequently
9. **Trade-offs**: GitHub Actions is easy but limited; Jenkins is complex but powerful
10. **Security**: Understand secrets management, least privilege, SSH keys

---

## Quick Reference: Commands

### Node.js (npm/Jest)
```bash
npm install            # Install dependencies
npm test               # Run tests
npm test -- --coverage # Run tests with coverage report
npm run build          # Build for production
npm start              # Run application
```

### Java (Maven)
```bash
mvn clean              # Remove build artifacts
mvn compile            # Compile source code
mvn test               # Run unit tests
mvn package            # Create JAR/WAR
mvn deploy             # Upload to repository
mvn clean compile test # Chain multiple goals
```

### Git
```bash
git add .              # Stage changes
git commit -m "msg"    # Create commit
git push origin main   # Push to remote
git log                # View commits
git status             # Check status
```

### Docker (bonus knowledge)
```bash
docker build -t app:v1 .   # Create image
docker run app:v1          # Run container
docker push registry/app    # Push to registry
```

---

## Interview Tips

1. **Know your pipeline cold**: Be able to explain every line of your workflow
2. **Understand the "why" not just "what"**: Don't just say "we run tests" - say "tests catch bugs before production"
3. **Use real examples**: Reference your own code and projects
4. **Discuss trade-offs**: "GitHub Actions is cloud-hosted so it's easy to setup, but less control than Jenkins..."
5. **Show you understand failure modes**: "If a test fails, the deployment is blocked and developers get notified..."
6. **Practice the commands**: Know Maven and npm commands cold
7. **Discuss best practices**: Secrets, coverage targets, deployment strategies
8. **Connect to business value**: "CI/CD reduces time to market by 10x and catches bugs earlier when they're cheaper to fix"
9. **Ask clarifying questions**: "Are you looking for cloud-based CI/CD or self-hosted?" shows you understand the decision
10. **Mention security**: Secrets handling, least privilege access, audit logs

---

## Additional Resources to Research

- Jenkins Official Documentation: jenkins.io
- GitHub Actions Documentation: docs.github.com/actions
- Maven Official Guide: maven.apache.org
- JUnit 4 Documentation: junit.org
- Jest Testing Framework: jest.io
- Docker & Containerization
- GitOps and IaC concepts
- Kubernetes (container orchestration)
- Artifact repositories (Nexus, Artifactory)
- Monitoring and logging tools integration
