# 8rain Station® EV Checker — Package Setup & Execution Guide for AI Assistants & Developers

> **FOR AI ASSISTANTS**: Read this file first to understand the workspace structure, setup procedures, execution commands, and verification workflows. You are equipped with all required Python scripts, static web files, and Vite React components to run and test this application immediately.

---

## 📌 1. Executive Overview

The **8rain Station® EV Checker** is a high-precision sports betting prediction market scanner. It cross-references quantitative model prediction CSV files against real-time live odds from **Kalshi** and **Polymarket** REST APIs, calculating:
* **Market Probabilities** (Kalshi % & Polymarket %)
* **Expected Value Edges** (K EDGE % & P EDGE %)
* **½ Kelly Criterion Bet Sizing** (Fractional bankroll allocation)
* **Spread Underdog Inversion Math** (Matching `+1.5` underdog covers against `-1.5` favorite lines)

---

## 🛠️ 2. Architecture & Modes

This package contains **three complete execution modes**:

| Mode | Technology | Primary Use Case | Entry Point |
| :--- | :--- | :--- | :--- |
| **Mode 1: Python Flask Server** *(Recommended)* | Python 3.9+, Flask, Requests | Local development on `http://localhost:5001` with server-side REST fetcher & zero CORS restrictions. | `python app.py` |
| **Mode 2: Standalone Static Web App** | HTML5, Vanilla CSS, JavaScript | Hostable on GitHub Pages or double-click to open in any web browser (`index.html`). | Open `index.html` |
| **Mode 3: React + Vite + TypeScript Dashboard** | React 19, Vite, TypeScript, TailwindCSS | Modern component-based web application with hot-module reloading. | `npm run dev` |

---

## 🚀 3. Step-by-Step Setup & Execution Instructions

### Mode 1: Python Flask Server (Recommended)

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
2. **Launch Development Server**:
   ```bash
   python app.py
   ```
3. **Access Dashboard**:
   Open **`http://localhost:5001`** in your browser.

---

### Mode 2: Standalone Web App (No Installation Required)

1. Double-click **`index.html`** or serve it with any HTTP static file server.
2. The client-side JavaScript engine in `static/app.js` will handle CSV parsing, CORS proxy fetching, team alias matching, and EV calculations directly in the browser.

---

### Mode 3: React + Vite + TypeScript Frontend

1. **Install Node.js Dependencies**:
   ```bash
   npm install
   ```
2. **Start Vite Dev Server**:
   ```bash
   npm run dev
   ```
3. **Build Static Bundle**:
   ```bash
   npm run build
   ```

---

## 🧪 4. Automated Verification & Testing

To verify that all API fetchers, date token matchers, spread side inverters, and EV calculators are functioning cleanly:

```bash
python test_pipeline.py
```

Expected output:
```text
==========================================================================
    8RAIN STATION EV CHECKER — PYTHON DATA FETCH & MATCHING SUITE      
==========================================================================
[1/4] Parsing CSV input rows...
      -> Parsed 13 model prediction rows.
[2/4] Querying Kalshi REST API endpoints (targeted)...
[3/4] Querying Polymarket Gamma REST API endpoints (targeted)...
[4/4] Executing line matching & EV calculations...
==========================================================================
                      DATA MATCHING PIPELINE OK                           
==========================================================================
```

---

## 📊 5. Specification Reference (11-Column CSV Format)

The application expects model prediction CSVs with the following 11-column header:

```csv
LEAGUE,DATE,HOME,AWAY,DOUBLEHEADER,SECTION,MARKET,SELECTOR,POINT,SIDE,WIN %
MLB,20260922,BAL,TOR,0,spread,spread,BAL,1.5,BAL,0.687
MLB,20260922,LAD,SD,0,spread,spread,LAD,1.5,LAD,0.695
NFL,20260927,PIT,CIN,0,head_to_head,h2h,PIT,,PIT,0.626
```

### Key Column Definitions:
* **`LEAGUE`**: `NFL`, `MLB`, `NBA`, `NHL`, `EPL`, `SOCCER`
* **`DATE`**: `YYYYMMDD` format (e.g. `20260922`)
* **`SECTION` / `MARKET`**: `head_to_head` (`h2h`), `spread`, `total`
* **`SELECTOR` / `SIDE`**: Team code (`BAL`, `LAD`), `home`, `away`, `Over`, `Under`
* **`POINT`**: Spread point (e.g. `1.5`, `-1.5`, `9.5`)
* **`WIN %`**: Decimal (`0.687`) or Percentage (`68.7%`)

---

## 📂 6. Directory Structure

```text
├── README_FOR_AI.md           <-- Instructions for AI models & developers
├── requirements.txt           <-- Python backend dependencies
├── app.py                     <-- Flask backend entry point (Port 5001)
├── index.html                 <-- Root static HTML entry point
├── test_pipeline.py           <-- Comprehensive automated test suite
├── test_fetcher.py            <-- Live exchange API verification script
├── data_fetcher/              <-- Core Python matching engine & clients
│   ├── kalshi_client.py       <-- Kalshi REST API integration
│   ├── polymarket_client.py   <-- Polymarket Gamma REST API integration
│   ├── matcher.py             <-- Date matching, side inversion, & EV engine
│   ├── csv_parser.py          <-- 11-column CSV parser
│   └── team_mapper.py         <-- Team alias dictionary & resolver
├── static/                    <-- Vanilla CSS & JS assets for standalone app
│   ├── style.css              <-- Premium dark mode design tokens
│   └── app.js                 <-- Pure JS matching engine & DOM renderer
├── templates/                 <-- Flask HTML template
│   └── index.html             <-- Flask template view
├── src/                       <-- TypeScript / React Vite codebase
│   ├── App.tsx                <-- React root component
│   ├── components/            <-- UI components (Navbar, Table, Uploader)
│   ├── services/              <-- TypeScript API clients & matcher
│   └── types/                 <-- TypeScript interfaces
├── package.json               <-- Node.js build configuration
└── vite.config.ts             <-- Vite bundler configuration
```

---

## 🤖 7. Prompt Template for AI Assistants

If you are delegating tasks on this codebase to another AI model (e.g. ChatGPT, Claude, Cursor, Antigravity), give them this prompt:

```text
"I have extracted the 8rain Station EV Checker package. Please inspect `README_FOR_AI.md` first. 
1. Run `pip install -r requirements.txt` and `python test_pipeline.py` to verify the pipeline.
2. Start the development server using `python app.py`.
3. Open `http://localhost:5001` and verify that the 11-column EV table matches model predictions against live Kalshi and Polymarket odds."
```
