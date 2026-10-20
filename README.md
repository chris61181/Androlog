# AndroLog — Precision TRT Tracking Web & Android App

AndroLog is a personal, clinical-grade TRT (Testosterone Replacement Therapy) tracking application designed for precision protocols (such as GameDay Men's Health) and diagnostic lab tracking (AccessLabs).

---

## Automated Android APK Builds via GitHub Actions

This repository includes a ready-to-run GitHub Actions workflow (`.github/workflows/build-apk.yml`) that automatically compiles an installable Android APK (`AndroLog.apk`) using Capacitor.

### 1. Automatic Update on Git Push
Whenever you push code updates to GitHub:
```bash
git add .
git commit -m "Update AndroLog features"
git push
```
GitHub Actions will automatically trigger the **Build Android APK** workflow, bundle the web app, compile the debug APK, and publish it.

### 2. Manual Trigger via GitHub Web UI
You can also rebuild the APK at any time without making code changes:
1. Go to your repository on GitHub.
2. Click the **Actions** tab at the top.
3. Select **Build Android APK** in the left sidebar.
4. Click the **Run workflow** dropdown button, choose your branch (`main`), and click **Run workflow**.

### 3. Where to Download Your New APK
Once the workflow run completes (green checkmark, ~2-3 minutes):
- **Option A — Releases (Recommended)**: Go to the **Releases** tab (`/releases`) on your GitHub repository. The latest `AndroLog.apk` is attached to the **latest** release tag.
- **Option B — Workflow Artifacts**: Open the completed workflow run under the **Actions** tab, scroll down to the **Artifacts** section at the bottom, and download **AndroLog-APK**.

### 4. Repository Permissions Setup (One-time)
To allow GitHub Actions to attach the APK to GitHub Releases:
1. In your GitHub repo, go to **Settings** → **Actions** → **General**.
2. Scroll to **Workflow permissions**.
3. Select **Read and write permissions**.
4. Click **Save**.

---

## Google Authentication (Calendar & Drive Sync)

AndroLog integrates directly with Google Workspace (Google Calendar & Google Drive):
- **Web / PWA**: Supports popup and seamless full-screen redirection.
- **Android APK**: The GitHub Actions workflow configures Android WebView settings to support OAuth popups and clean user-agent headers, preventing Google's `403 disallowed_useragent` error.
- **Firebase Authorized Domains**: If signing in from a custom domain or hosting URL, ensure your domain (e.g. `localhost` or custom domain) is listed under **Firebase Console → Authentication → Settings → Authorized domains**.


