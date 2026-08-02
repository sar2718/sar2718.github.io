# Eduard Sultanov — Portfolio

Personal portfolio website for a backend developer focused on Go, Python, C, data pipelines and practical engineering.

Live site: [sar2718.github.io](https://sar2718.github.io)

## Features

- responsive single-page layout;
- English and Russian interface;
- project, education and hackathon sections;
- accessible keyboard navigation;
- resilient no-JavaScript navigation and content fallbacks;
- reduced-motion support;
- Open Graph social preview;
- no framework, build step or package dependencies.

## Local preview

Node.js 22 or newer is recommended for local checks and preview. No package installation is required.

```bash
npm run dev
```

Then open `http://127.0.0.1:4173`.

## Validation

Run the complete local validation before committing:

```bash
npm run check
```

The same validation runs automatically on pushes and pull requests through GitHub Actions.

## Deployment

The site is designed for GitHub Pages and can be served directly from the repository root on the `main` branch. If Pages is not configured yet, select **Deploy from a branch**, then choose **main** and **/(root)** under **Settings → Pages**.
