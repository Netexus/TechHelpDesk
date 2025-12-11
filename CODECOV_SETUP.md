# Codecov Setup Instructions

## Step 1: Add CODECOV_TOKEN to GitHub Secrets

1. Go to your GitHub repository: `https://github.com/Netexus/TechHelpDesk`
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `CODECOV_TOKEN`
5. Value: Paste your Codecov token
6. Click **Add secret**

## Step 2: Push the changes

Once you've added the secret, push these changes to GitHub:

```bash
git add .github/workflows/test-coverage.yml codecov.yml
git commit -m "ci: add Codecov integration"
git push
```

## Step 3: Verify

1. Go to **Actions** tab in your GitHub repository
2. You should see the "Test Coverage" workflow running
3. Once complete, check your Codecov dashboard at: `https://codecov.io/gh/Netexus/TechHelpDesk`

## Step 4: Add Coverage Badge (Optional)

Add this to your README.md to display coverage badge:

```markdown
[![codecov](https://codecov.io/gh/Netexus/TechHelpDesk/branch/main/graph/badge.svg)](https://codecov.io/gh/Netexus/TechHelpDesk)
```

## What happens now?

- Every push to `main` will trigger tests and upload coverage
- Every Pull Request will show coverage changes
- You can view detailed coverage reports at codecov.io
- Frontend and Backend coverage are tracked separately with flags

## Troubleshooting

If the workflow fails:
- Check that `CODECOV_TOKEN` is correctly added as a secret
- Verify that tests run locally with `npm run test:cov` (Backend) and `npm run test` (Frontend)
- Check the Actions tab for detailed error logs
