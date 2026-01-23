Spendify: Automated Expense Management System
👥 Group Information
CRITICAL: All names and IDs match the LMS exactly to prevent an automatic zero grade.

Student 1: A.R.F.Rashatha - ITBNM-2313-0066 - Role: DevOps Engineer

Student 2:U.Heerthana - ITBNM-2313-0031 - Role:Frontend Developer

Student 3: M.A.F.Farha - ITBNM-2313-0024- Role: Backend Developer

📝 Project Description
Spendify is a web-based financial tracking application designed for the "Systems Administration & Maintenance" module. It allows users to track daily expenses, manage tasks, and view spending history. The project focuses on a professional DevOps lifecycle, implementing automated CI/CD pipelines and a strict Git branching strategy.

🚀 Live Deployment
🔗 Live URL: https://vercel.com/fathimas-projects-a0977f3a/spendify-devops-project/7A9b56mvd7rrsYH4MwN1kUtSfDQV

🛠 Technologies Used
Frontend: HTML5, CSS3, JavaScript (ES6+)

Automation: GitHub Actions (CI/CD)

Version Control: Git & GitHub

Cloud Platform: Vercel

✨ Features
Expense Management: Add, delete, and track tasks.

Task Filtering: View active or completed tasks.

Responsive UI: Fully optimized for mobile and desktop.

CI/CD Pipeline: Automated testing and deployment on every merge to production.

🌿 Branch Strategy
We implemented the following branching model as required:

main: Protected production branch; only receives code via Pull Request.

develop: Integration branch where all features are merged before release.

feature/*: Individual branches for specific feature development.

🤝 Individual Contributions
A.R.F.Rashatha (DevOps Engineer)
Initialized the repository and configured branch protection rules.

Set up GitHub Actions for CI (ci.yml) and Deployment (deploy.yml).

Configured cloud deployment secrets (VERCEL_TOKEN, ORG_ID).

Handled the mandatory merge conflict resolution.

U.Heerthana (Frontend Developer)
Implemented UI/UX components and responsive styling.

Maintained project documentation and README.md.

Developed core application features and source code.

Created feature branches and managed Pull Requests with descriptions.

[Student 3 Name] (Backend Developer)

Conducted code reviews for team members.

Integrated backend components with logic.

⚙️ Setup Instructions
Prerequisites
Node.js (version 18 or higher)

Git

Installation
Bash

# Clone the repository
git clone https://github.com/Rashadha24/spendify-devops-project.git

# Navigate to project directory
cd spendify-devops-project

# Install dependencies
npm install

# Run development server
npm run dev

🔄 Deployment Process
The CI/CD pipeline is automated via GitHub Actions:

CI Pipeline: Runs on every push to check code quality and build status.

Deployment: Automatically triggers when code is merged from develop into main.

🛑 Merge Conflict Resolution
As required for full marks, we intentionally created a merge conflict by editing the same line in index.html across different branches. The DevOps Engineer resolved this manually by reviewing the changes and committing the final version to the develop branch.

