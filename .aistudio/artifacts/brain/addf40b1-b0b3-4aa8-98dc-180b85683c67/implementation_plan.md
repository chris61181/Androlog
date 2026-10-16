# AndroLog — Precision TRT Tracker & Cloud Sync Plan

AndroLog is a personal precision Testosterone Replacement Therapy (TRT) management web application and Android APK designed for friction-free protocol tracking, deltoid injection rotation, longitudinal AccessLabs biomarker analytics, and Google Drive cloud backup.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The application architecture has been aligned with your customized clinical protocol and workflow:

- **Confirmed Protocol**: Testosterone Cypionate 120 mg/week administered as 60 mg every Thursday and Sunday using 27g 1/2" shallow intramuscular injections into the deltoids (No AI).
- **Injection Site Discipline**: Rotation schedule focused on alternating Right Deltoid and Left Deltoid, tracking rested and cooling states.
- **Biomarker Trajectory**: Pre-loaded with your five 2026 baseline trough panels (September, June, May, April, March) tracking Total Testosterone progress toward the ~1000 ng/dL trough target alongside Estradiol (E2), Free Testosterone, PSA, and natural aromatization ratio.
- **Google Drive Storage**: Full client-side Google Drive v3 cloud synchronization saving complete snapshots and CSV history directly to an `AndroLog TRT` root folder in your Drive.
- **Android Deployment**: GitHub Actions workflow ready to bundle the app into a native Android APK via Capacitor.

---

### 1. Overview & Core Concept

- **What It Does**: Provides an ultra-focused, single-page web app and installable Android APK that tracks TRT injections, calculates real-time syringe draw metrics (mL and U-100 units), monitors remaining vial volume, visualizes multi-panel blood draw trends, and securely backs up records to Google Drive.
- **Target Audience / Context**: Personal health tracking following the GameDay Men's Health protocol with diagnostic blood panels from AccessLabs and Labcorp.
- **Key Value**: Eliminates manual logging friction, prevents injection site fatigue, ensures consistent dosing cadence with calendar pin highlights, and safeguards all health records in Google Drive.

---

### 2. User Experience & Visual Design

#### Visual Identity & Design Tokens
- **Theme**: Dark athletic & clinical UI with high contrast and zero visual clutter.
- **Color Palette**:
  - Background: Deep navy `#051424` (`bg-brand-dark`)
  - Elevated Surfaces & Cards: `#0d1c2d` (`bg-brand-surface`), `#132338` (`bg-brand-card`)
  - Border Accents: `#1f344d` (`border-brand-border`)
  - Primary Accent: Precision Cyan `#0ea5e9` (`text-brand-cyan`, `bg-brand-cyan`)
  - Status Indicators: Emerald `#34d399` (Safe / Optimal / Rested), Amber `#fbbf24` (Recent / Warning), Red `#f87171` (Elevated / Danger)
  - Typography: `Space Grotesk` font family for modern clinical readability.

#### Five Core Application Views
1. **Dashboard (Home)**:
   - Protocol banner displaying weekly dose (120 mg), compound (200 mg/mL), pin schedule (`60mg Thu & Sun`), needle spec (`27g 1/2" Delt`), remaining vial volume, and next rested depot.
   - Quick Log Dose card with a live **Syringe Draw Helper** showing exact volume and insulin syringe graduation (e.g., `0.30 mL / 30 Units on U-100`).
   - Injection history feed with inline pin editing, deletion with vial refund, and one-tap CSV export.
2. **Interactive Calendar**:
   - Monthly calendar grid highlighting scheduled Thursday & Sunday pin days.
   - Pinned date badges, day inspection panel, and a "Log Pin on This Day" shortcut for backdating missed injections.
3. **Site Rotation Manager**:
   - Dedicated deltoid rotation tracker ranking injection sites by rested duration (`Up Next • Rested`, `Rested`, `Last Pinned • Cooling down`).
4. **Biomarker Trajectory (Labs)**:
   - Longitudinal SVG trendline charting Total Testosterone and Estradiol over time against your ~1000 ng/dL trough target.
   - Interactive panel selector pills for 2026 baseline draws and future labs.
   - Detailed panel view displaying Total T, E2, Direct Free T, PSA, T:E2 aromatization ratio, Hematocrit (HCT), SHBG, and draw notes.
   - New trough blood draw logging form.
5. **Settings & Google Drive Cloud Sync**:
   - Injection site management (add custom sites, remove sites).
   - Google Drive cloud sync card featuring official Google Sign-In, snapshot backup, CSV saving, backup file browser, and auto-sync toggle.
   - Protocol adjustments (weekly dose, concentration, vial volume, syringe specs).
   - Local JSON backup export/import and one-click default setup restore.

---

### 3. Key Product Decisions & Trade-Offs

- **Client-Side Google Drive REST API vs. Custom Backend**:
  - *Chosen Approach*: Direct browser-to-Google Drive v3 API using Firebase Auth for token acquisition.
  - *Why*: Eliminates server-side storage of personal health data, ensures zero monthly hosting/database costs, and provides full user ownership of health files in their own Google Drive account.
  - *Security*: OAuth access tokens are cached strictly in runtime memory and cleared immediately on sign-out; never written to localStorage.
- **In-Memory + LocalStorage Dual Layer**:
  - *Chosen Approach*: Instant local persistence via browser `localStorage` (`androlog_config`, `androlog_doses`, `androlog_sites`, `androlog_labs_v3`), augmented by remote Drive snapshots.
  - *Why*: Enables instant offline operation as an Android PWA or Capacitor APK without requiring internet connectivity for daily logging.
- **Syringe Draw Helper Calculation**:
  - *Chosen Approach*: Automatic conversion: `mL = dose (mg) / concentration (mg/mL)`, and `Units = mL * 100` for standard U-100 1mL insulin syringes.
  - *Why*: Prevents dosing calculation errors when measuring small volume deltoid pins (0.30 mL).
- **Mandatory User Confirmation for Destructive Actions**:
  - *Chosen Approach*: Custom styled dark confirmation modals for deleting cloud backups, deleting historical doses, or restoring snapshots over local data.
  - *Why*: Prevents accidental data loss while matching the application aesthetic.

---

### 4. Technical Architecture & Data Strategy

#### System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ANDROLOG CLIENT (UI)                             │
├─────────────────────┬──────────────────────┬────────────────────────────────┤
│   DASHBOARD VIEW    │    CALENDAR VIEW     │          LABS VIEW             │
│ • Quick Dose Form   │ • Thu/Sun Pin Marks  │ • Total T / E2 SVG Trajectory  │
│ • Syringe Helper    │ • Day Inspector      │ • Date Selector Pills          │
│ • History List      │ • Missed Pin Logger  │ • T:E2 Aromatization Ratio     │
├─────────────────────┴──────────────────────┴────────────────────────────────┤
│                    SETTINGS & GOOGLE DRIVE CLOUD SYNC                       │
│ • Official Google Sign-In  • Backup to Drive  • Restore / Delete from Drive │
│ • Auto-Sync on Pin Toggle  • Custom Sites     • Local JSON & CSV Export     │
└──────────────────────┬───────────────────────────────┬──────────────────────┘
                       │                               │
                       ▼                               ▼
       ┌──────────────────────────────┐ ┌──────────────────────────────┐
       │     LOCAL STORAGE LAYER      │ │    GOOGLE DRIVE CLOUD API    │
       │ • androlog_config            │ │ • Firebase Auth Client SDK   │
       │ • androlog_doses             │ │ • In-Memory Access Token     │
       │ • androlog_sites             │ │ • Root Folder: "AndroLog TRT"│
       │ • androlog_labs_v3           │ │ • JSON Snapshots & CSV Dumps │
       │ • androlog_auto_sync         │ │ • REST v3 Files & Upload API │
       └──────────────────────────────┘ └──────────────────────────────┘
                       │
                       ▼
       ┌──────────────────────────────┐
       │   CAPACITOR ANDROID BUILD    │
       │ • .github/workflows/build-apk│
       │ • Standalone APK Release     │
       └──────────────────────────────┘
```

#### Core Data Entities
1. **Config (`androlog_config`)**:
   - `weeklyDose`: number (e.g., 120)
   - `schedule`: string (e.g., "60mg Thu & Sun")
   - `needle`: string (e.g., "27g 1/2\" Delt")
   - `compound`: string (e.g., "Testosterone Cypionate")
   - `concentration`: number (e.g., 200 mg/mL)
   - `vialVolume`: number (e.g., 10.00 mL)
2. **Dose Entry (`androlog_doses`)**:
   - `dose`: number (mg)
   - `site`: string (e.g., "Right Deltoid")
   - `dateText`: formatted human string
   - `timestamp`: epoch millisecond integer
3. **Lab Panel (`androlog_labs_v3`)**:
   - `date`: string (YYYY-MM-DD)
   - `provider`: string (e.g., "AccessLabs • GameDay")
   - `totalT`: number (ng/dL)
   - `e2`: number (pg/mL)
   - `freeT`: number | null
   - `freeTUnit`: string
   - `psa`: number | null (ng/mL)
   - `hct`: number | null (%)
   - `shbg`: number | null (nmol/L)
   - `notes`: string
4. **Cloud Snapshot Payload**:
   - `app`: "AndroLog"
   - `version`: "1.0"
   - `exportedAt`: ISO 8601 string
   - `config`, `sites`, `doses`, `labs`

---

### 5. Verification & Delivery Checklist

- [x] Protocol verified: 120 mg/wk, 60 mg Thu/Sun, 27g 1/2" Deltoids.
- [x] Longitudinal trajectory SVG graph rendering 5 baseline 2026 panels with ~1000 ng/dL target.
- [x] Syringe Draw Helper dynamically converting mg to mL and U-100 units on input.
- [x] Google Drive v3 integration active with "AndroLog TRT" folder, backup snapshot, CSV saving, and file listing.
- [x] Local CSV export and JSON backup/restore functional.
- [x] Destructive actions protected by confirmation modals.
- [x] Android APK build workflow (`build-apk.yml`) configured for GitHub Actions.
