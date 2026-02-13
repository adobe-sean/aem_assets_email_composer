# Email Composer POC – AEM Micro-Frontend Asset Selector

A small **single-page application** that acts as an **email composer** and integrates the [AEM Micro-Frontend Asset Selector](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/manage/asset-selector/overview-asset-selector) so you can **browse and insert images from an AEM Assets repository** into the email body.

## Features

- **Email composer**: To, Subject, and rich body (with inline images).
- **Insert image from AEM**: Button opens the Asset Selector in a modal; you sign in with Adobe IMS (if needed), pick an image, and it’s inserted into the body.
- **Configurable**: IMS Client ID, IMS Org, scope, redirect URL, and optional repository ID are stored in the browser (localStorage) so the app can work with your AEM Assets instance.

## Prerequisites

- Your organization must be **provisioned** for the Asset Selector (AEM Assets as a Cloud Service). If not, your admin must open a **P2 support ticket** in the Admin Console and provide:
  - Program ID and Environment ID for the AEM CS instance
  - **Domain names** where this app will be hosted (e.g. `https://yourusername.github.io` or your custom domain)
- After provisioning you will receive **imsClientId**, **imsScope**, and a **redirectUrl** that must be allowed for your app’s URL.

Additional requirements from Adobe:

- The app must run on **HTTPS** (not `http://localhost`; for local dev you can use a custom domain like `https://yourcompany.localhost` and add it to the redirect allow list).
- Popups must be allowed (IMS login uses a popup when configured that way).

## Quick start

1. **Install and run locally**

   ```bash
   npm install
   npm run dev
   ```

   Then open the URL Vite prints (e.g. `http://localhost:5173`).  
   For real IMS login you must serve the app over HTTPS and use a URL that is in your IMS redirect allow list.

2. **Configure the Asset Selector**

   - Click **Config** in the header.
   - Enter your **IMS Client ID**, **IMS Org**, and optionally **IMS Scope** and **Redirect URL** (defaults to current page URL).
   - Click **Save**.

3. **Insert an image**

   - Click **Insert image from AEM**.
   - Sign in with Adobe if prompted.
   - Browse or search assets, select an image, and click **Select**; it will be inserted into the email body.

## Build and deploy (GitHub Pages)

The app is intended to be deployed on **GitHub Pages** only.

- **Build**

  ```bash
  npm run build
  ```

  Output is in the `dist/` folder. The app uses `base: './'` in Vite so it works when served from a subpath (e.g. `https://username.github.io/repo-name/`).

- **Deploy to GitHub Pages**

  1. Push the repo to GitHub.
  2. In the repo go to **Settings → Pages**.
  3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
  4. Push to `main` (or run the “Deploy to GitHub Pages” workflow manually). The included workflow builds the app and deploys the `dist/` folder.

  **Alternative (branch deploy):** run `npm run build`, commit the contents of `dist/` to a `gh-pages` branch or a `docs/` folder, then in **Settings → Pages** choose **Deploy from a branch** and select that branch/folder.

  **Important:** Add the **exact URL** where the app is served (e.g. `https://yourusername.github.io/aem-asset-selector-poc/`) to your IMS client’s **allowed redirect URLs** so the Asset Selector login works.

## Project structure

- `index.html` – Shell and script tag for the AEM Asset Selector UMD bundle.
- `src/main.js` – App logic: config load/save, IMS registration, open modal, render Asset Selector, handle selection and insert image into the body.
- `src/main.css` – Styles for the composer and modal.

## References

- [Asset Selector overview](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/manage/asset-selector/overview-asset-selector)
- [Integrate with non-Adobe app](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/manage/asset-selector/asset-selector-integration/integrate-asset-selector-non-adobe-app)
- [Asset Selector properties](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/manage/asset-selector/asset-selector-properties)
- [Adobe examples (Vanilla JS)](https://github.com/adobe/aem-assets-selectors-mfe-examples)

## License

MIT (or your chosen license).
