# ASCENT — Flask + Azure Deployment Guide

## Project Structure
```
ascent_flask/
├── app.py                  ← Flask backend (all calculations)
├── requirements.txt        ← Python dependencies
├── startup.txt             ← Azure startup command
├── web.config              ← Azure IIS config (Windows)
├── templates/
│   └── index.html          ← Main HTML page
└── static/
    ├── css/
    │   └── style.css       ← All styles
    └── js/
        └── app.js          ← Frontend logic + Plotly charts
```

---

## STEP 1 — Test Locally

```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run app
python app.py

# Open browser: http://localhost:5000
```

---

## STEP 2 — Push to GitHub

```bash
git init
git add .
git commit -m "ASCENT Flask app"
git remote add origin https://github.com/YOUR_USERNAME/ascent-flask.git
git push -u origin main
```

---

## STEP 3 — Deploy to Azure App Service

### Option A: Azure Portal (easiest)

1. Go to https://portal.azure.com
2. Click **"Create a resource"** → search **"Web App"**
3. Fill in:
   - **Subscription**: your subscription
   - **Resource Group**: Create new → name it `ascent-rg`
   - **Name**: `ascent-india` (must be globally unique)
   - **Publish**: Code
   - **Runtime stack**: Python 3.11
   - **Operating System**: Linux
   - **Region**: Central India (or nearest)
   - **Pricing plan**: B1 Basic (~₹1,200/month) or F1 Free (limited)
4. Click **Review + Create** → **Create**
5. Once created, go to your Web App → **Deployment Center**
6. Choose **GitHub** as source
7. Authorize and select your repo + branch (`main`)
8. Click **Save** — Azure will auto-deploy on every push!

### Option B: Azure CLI (faster after setup)

```bash
# Install Azure CLI: https://aka.ms/installazurecliwindows

# Login
az login

# Create resource group
az group create --name ascent-rg --location centralindia

# Create App Service plan (B1 = ~$13/month)
az appservice plan create \
  --name ascent-plan \
  --resource-group ascent-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group ascent-rg \
  --plan ascent-plan \
  --name ascent-india \
  --runtime "PYTHON:3.11"

# Set startup command
az webapp config set \
  --resource-group ascent-rg \
  --name ascent-india \
  --startup-file "gunicorn --bind=0.0.0.0:8000 --timeout 600 app:app"

# Deploy from local folder (ZIP deploy)
az webapp up \
  --resource-group ascent-rg \
  --name ascent-india \
  --runtime "PYTHON:3.11"
```

Your app will be live at: **https://ascent-india.azurewebsites.net**

---

## STEP 4 — Environment Variables (optional)

In Azure Portal → Your Web App → **Configuration** → **Application Settings**:

| Name | Value |
|------|-------|
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |
| `WEBSITE_RUN_FROM_PACKAGE` | `0` |

---

## STEP 5 — Custom Domain (optional)

In Azure Portal → Your Web App → **Custom domains**:
1. Click **Add custom domain**
2. Enter your domain (e.g., `ascent.wrlindia.org`)
3. Add the CNAME/TXT records to your DNS provider
4. Verify and bind

---

## Costs (Azure India region)

| Plan | Cost/month | RAM | CPU |
|------|-----------|-----|-----|
| F1 Free | ₹0 | 1 GB | Shared (60 min/day limit) |
| B1 Basic | ~₹1,200 | 1.75 GB | 1 core |
| B2 Basic | ~₹2,400 | 3.5 GB | 2 cores (recommended) |

---

## Troubleshooting

- **500 error on Azure**: Check logs at Portal → Web App → **Log stream**
- **Packages not installing**: Make sure `SCM_DO_BUILD_DURING_DEPLOYMENT=true` is set
- **Slow cold start**: Upgrade from F1 to B1 plan
- **Port issues**: Azure sets `PORT` env var automatically; our app reads it

---

## Key Differences: Streamlit vs Flask

| Feature | Streamlit | Flask |
|---------|-----------|-------|
| Frontend | Auto-generated | Custom HTML/CSS/JS |
| Interactivity | Python widgets | JavaScript + API calls |
| Deployment | share.streamlit.io | Any server / Azure |
| Scalability | Limited | Full control |
| Charts | st.plotly_chart | Plotly.js via JSON API |

---

## v2 — UI Refresh & Data Updates

### What's New
- **3-Level Location Dropdown**: State → District → City (654 cities across all Indian states/UTs)
- **Excel Export**: Download full scenario workbook (`.xlsx`) with 4 sheets: Scenarios, Base Emissions, Mitigation Budget, Summary
- **Modern UI**: Redesigned with DM Sans / Space Grotesk typography, refined card layout, teal-navy palette
- **openpyxl** added to `requirements.txt` for Excel generation

### New Dependency
```
openpyxl==3.1.4
```
Make sure to set `SCM_DO_BUILD_DURING_DEPLOYMENT=true` in Azure App Settings so pip installs it on deploy.
