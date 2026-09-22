document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const kalshiKeyInput = document.getElementById('kalshiKeyInput');
    const saveKeyBtn = document.getElementById('saveKeyBtn');
    const kalshiPill = document.getElementById('kalshiPill');
    const polyPill = document.getElementById('polyPill');
    const refreshBtn = document.getElementById('refreshBtn');
    const refreshSpinner = document.getElementById('refreshSpinner');
    
    const csvTextArea = document.getElementById('csvTextArea');
    const csvFileInput = document.getElementById('csvFileInput');
    const resetSampleBtn = document.getElementById('resetSampleBtn');
    const calculateBtn = document.getElementById('calculateBtn');
    
    const posEvOnlyToggle = document.getElementById('posEvOnlyToggle');
    const minEdgeInput = document.getElementById('minEdgeInput');
    const sortSelect = document.getElementById('sortSelect');
    const rowCountText = document.getElementById('rowCountText');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    
    const tableBody = document.getElementById('tableBody');
    const tableEmptyState = document.getElementById('tableEmptyState');

    // Team Alias Dictionary
    const TEAM_ALIASES = {
        'BAL': ['BAL', 'BALTIMORE', 'ORIOLES', 'RAVENS'],
        'TOR': ['TOR', 'TORONTO', 'BLUE JAYS'],
        'LAD': ['LAD', 'LOS ANGELES', 'DODGERS', 'LA DODGERS'],
        'SD':  ['SD', 'SAN DIEGO', 'PADRES'],
        'NYY': ['NYY', 'NEW YORK YANKEES', 'YANKEES', 'NY YANKEES'],
        'BOS': ['BOS', 'BOSTON', 'RED SOX'],
        'ATL': ['ATL', 'ATLANTA', 'BRAVES', 'FALCONS'],
        'CIN': ['CIN', 'CINCINNATI', 'REDS', 'BENGALS'],
        'PIT': ['PIT', 'PITTSBURGH', 'PIRATES', 'STEELERS'],
        'SF':  ['SF', 'SAN FRANCISCO', 'GIANTS', '49ERS'],
        'ARI': ['ARI', 'ARIZONA', 'DIAMONDBACKS', 'CARDINALS'],
        'IND': ['IND', 'INDIANAPOLIS', 'COLTS'],
        'HOU': ['HOU', 'HOUSTON', 'ASTROS', 'TEXANS'],
        'COL': ['COL', 'COLORADO', 'ROCKIES'],
        'MIL': ['MIL', 'MILWAUKEE', 'BREWERS'],
        'TBL': ['TBL', 'TAMPA BAY', 'RAYS'],
        'FLA': ['FLA', 'FLORIDA', 'PANTHERS'],
        'PHI': ['PHI', 'PHILADELPHIA', 'PHILLIES', 'EAGLES'],
        'CHC': ['CHC', 'CHICAGO CUBS', 'CUBS'],
        'CWS': ['CWS', 'CHICAGO WHITE SOX', 'WHITE SOX'],
        'CLE': ['CLE', 'CLEVELAND', 'GUARDIANS', 'BROWNS'],
        'DET': ['DET', 'DETROIT', 'TIGERS', 'LIONS'],
        'KC':  ['KC', 'KANSAS CITY', 'ROYALS', 'CHIEFS'],
        'MIN': ['MIN', 'MINNESOTA', 'TWINS', 'VIKINGS'],
        'NYM': ['NYM', 'NEW YORK METS', 'METS'],
        'SEA': ['SEA', 'SEATTLE', 'MARINERS', 'SEAHAWKS'],
        'TEX': ['TEX', 'TEXAS', 'RANGERS'],
        'WAS': ['WAS', 'WASHINGTON', 'NATIONALS'],
        'WSH': ['WSH', 'WASHINGTON', 'COMMANDERS'],
        'GB':  ['GB', 'GREEN BAY', 'PACKERS'],
        'MIA': ['MIA', 'MIAMI', 'MARLINS', 'DOLPHINS'],
        'NE':  ['NE', 'NEW ENGLAND', 'PATRIOTS'],
        'DEN': ['DEN', 'DENVER', 'BRONCOS'],
        'LV':  ['LV', 'LAS VEGAS', 'RAIDERS'],
        'LAC': ['LAC', 'LOS ANGELES CHARGERS', 'CHARGERS'],
        'DAL': ['DAL', 'DALLAS', 'COWBOYS'],
        'NYG': ['NYG', 'NEW YORK GIANTS', 'GIANTS'],
        'CHI': ['CHI', 'CHICAGO BEARS', 'BEARS'],
        'NO':  ['NO', 'NEW ORLEANS', 'SAINTS'],
        'TB':  ['TB', 'TAMPA BAY BUCCANEERS', 'BUCCANEERS'],
        'LAR': ['LAR', 'LOS ANGELES RAMS', 'RAMS']
    };

    const DEFAULT_CSV = `LEAGUE,DATE,HOME,AWAY,DOUBLEHEADER,SECTION,MARKET,SELECTOR,POINT,SIDE,WIN %
MLB,20260922,BAL,TOR,,head_to_head,h2h,,home,0.5333
MLB,20260922,BAL,TOR,,head_to_head,h2h,,away,0.4667
MLB,20260922,BAL,TOR,,spread,spread,,+1.5,home,0.6867
MLB,20260922,BAL,TOR,,spread,spread,,-1.5,away,0.3133
MLB,20260922,BAL,TOR,,total,total,,7.5,over,0.5275
MLB,20260922,LAD,SD,,spread,spread,,+1.5,LAD,0.6950
MLB,20260922,ATL,CIN,,total,total,,9.5,under,0.5300
NFL,20260927,PIT,CIN,,head_to_head,h2h,,PIT,0.6260
NFL,20260927,SF,ARI,,head_to_head,h2h,,SF,0.9110`;

    if (!csvTextArea.value.trim()) {
        csvTextArea.value = DEFAULT_CSV;
    }

    // State
    let rawLines = [];
    let kalshiApiKey = localStorage.getItem('kalshi_api_key') || '';

    if (kalshiApiKey) {
        kalshiKeyInput.value = kalshiApiKey;
    }

    // Save API key
    saveKeyBtn.addEventListener('click', () => {
        kalshiApiKey = kalshiKeyInput.value.trim();
        localStorage.setItem('kalshi_api_key', kalshiApiKey);
        alert('Kalshi API Key saved!');
        fetchAndCalculate(true);
    });

    // Reset Sample Slate
    resetSampleBtn.addEventListener('click', () => {
        csvTextArea.value = DEFAULT_CSV;
        fetchAndCalculate(false);
    });

    // Handle File Upload
    csvFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                csvTextArea.value = event.target.result;
                fetchAndCalculate(false);
            };
            reader.readAsText(file);
        }
    });

    // Trigger Calculation / Refresh
    calculateBtn.addEventListener('click', () => fetchAndCalculate(false));
    refreshBtn.addEventListener('click', () => fetchAndCalculate(true));

    // Filters & Sorting Triggers
    posEvOnlyToggle.addEventListener('change', renderTable);
    minEdgeInput.addEventListener('input', renderTable);
    sortSelect.addEventListener('change', renderTable);
    clearFiltersBtn.addEventListener('click', () => {
        posEvOnlyToggle.checked = true;
        minEdgeInput.value = 0;
        sortSelect.value = 'k_edge_desc';
        renderTable();
    });

    // Main API Fetch & Calculation Function
    async function fetchAndCalculate(forceRefresh = false) {
        refreshSpinner.classList.remove('hidden');
        refreshBtn.disabled = true;
        
        updateStatusPill(kalshiPill, 'connecting', 'Kalshi: Connecting...');
        updateStatusPill(polyPill, 'connecting', 'Poly: Connecting...');

        try {
            // Attempt Flask API endpoint if running locally
            let isLocalBackend = false;
            try {
                const res = await fetch('/api/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        csv_text: csvTextArea.value,
                        kalshi_key: kalshiApiKey,
                        force_refresh: forceRefresh
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data && data.success) {
                        isLocalBackend = true;
                        rawLines = data.lines || [];
                        
                        updateStatusPill(
                            kalshiPill,
                            data.kalshi_status === 'connected' ? 'connected' : 'error',
                            data.kalshi_status === 'connected' ? `Kalshi: Connected (${data.kalshi_count})` : 'Kalshi: Offline'
                        );
                        updateStatusPill(
                            polyPill,
                            data.poly_status === 'connected' ? 'connected' : 'error',
                            data.poly_status === 'connected' ? `Poly: Connected (${data.poly_count})` : 'Poly: Offline'
                        );
                        renderTable();
                    }
                }
            } catch (e) {}

            if (!isLocalBackend) {
                // Pure Client-side Execution for GitHub Pages
                await runClientSideFetchAndMatch();
            }

        } catch (err) {
            console.error('Calculation error:', err);
            updateStatusPill(kalshiPill, 'error', 'Kalshi: Connection Error');
            updateStatusPill(polyPill, 'error', 'Poly: Connection Error');
        } finally {
            refreshSpinner.classList.add('hidden');
            refreshBtn.disabled = false;
        }
    }

    async function runClientSideFetchAndMatch() {
        const parsedRows = parseCsvInput(csvTextArea.value);
        
        const [kalshiRes, polyRes] = await Promise.all([
            fetchKalshiClientSide(kalshiApiKey),
            fetchPolymarketClientSide()
        ]);

        updateStatusPill(
            kalshiPill,
            kalshiRes.markets.length > 0 ? 'connected' : 'error',
            kalshiRes.markets.length > 0 ? `Kalshi: Connected (${kalshiRes.count})` : 'Kalshi: Offline'
        );
        updateStatusPill(
            polyPill,
            polyRes.markets.length > 0 ? 'connected' : 'error',
            polyRes.markets.length > 0 ? `Poly: Connected (${polyRes.count})` : 'Poly: Offline'
        );

        rawLines = matchRowsClientSide(parsedRows, kalshiRes.markets, polyRes.markets);
        renderTable();
    }

    // Client-side CSV Parser
    function parseCsvInput(text) {
        if (!text || !text.trim()) return [];
        const lines = text.split('\n');
        const rows = [];
        let headers = null;
        
        for (let i = 0; i < lines.length; i++) {
            const clean = lines[i].trim();
            if (!clean || clean.startsWith('#')) continue;
            
            const parts = clean.split(',').map(p => p.trim());
            const upperStr = clean.toUpperCase();
            
            if (!headers && (upperStr.includes('LEAGUE') || upperStr.includes('WIN %') || upperStr.includes('MARKET'))) {
                headers = parts.map(h => h.toUpperCase());
                continue;
            }

            if (!headers) {
                headers = ['LEAGUE', 'DATE', 'HOME', 'AWAY', 'DOUBLEHEADER', 'SECTION', 'MARKET', 'SELECTOR', 'POINT', 'SIDE', 'WIN %'];
            }

            const getVal = (kw) => {
                const idx = headers.indexOf(kw);
                return (idx !== -1 && idx < parts.length) ? parts[idx] : '';
            };

            const league = getVal('LEAGUE') || 'MLB';
            const date = getVal('DATE') || '20260922';
            const home = getVal('HOME');
            const away = getVal('AWAY');
            const section = getVal('SECTION') || 'head_to_head';
            const market = getVal('MARKET') || 'h2h';
            const selector = getVal('SELECTOR');
            const point = getVal('POINT');
            const side = getVal('SIDE') || 'home';
            const winStr = getVal('WIN %') || getVal('MODEL_PROB') || getVal('WIN');

            const winPct = parseFloat(winStr ? winStr.replace('%', '') : '0.5');
            if (isNaN(winPct)) continue;

            const winPctDecimal = winPct > 1.0 ? winPct / 100.0 : winPct;

            rows.push({
                league: league.toUpperCase(),
                date: date,
                home: home.toUpperCase(),
                away: away.toUpperCase(),
                section: section.toLowerCase(),
                market: market.toLowerCase(),
                selector: selector,
                point: point,
                side: side.toLowerCase(),
                winPctDecimal: winPctDecimal
            });
        }
        return rows;
    }

    // Client-side Kalshi Fetcher (with CORS Proxy Chain)
    async function fetchKalshiClientSide(apiKey) {
        const seriesList = ['KXNFLGAME', 'KXMLBGAME', 'KXNBAGAME', 'KXNHLGAME', 'KXEPLGAME', 'KXNFLTOTAL', 'KXMLBTOTAL', 'KXNBATOTAL', 'KXNHLTOTAL', 'KXNFLSPREAD', 'KXMLBSPREAD', 'KXNBASPREAD', 'KXNHLSPREAD'];
        let rawMarkets = [];

        for (const s of seriesList) {
            const targetUrl = `https://api.elections.kalshi.com/trade-api/v2/markets?series_ticker=${s}&status=open&limit=200`;
            try {
                let data = null;
                // Direct fetch
                let res = await fetch(targetUrl).catch(() => null);
                if (res && res.ok) {
                    data = await res.json();
                } else {
                    // AllOrigins CORS Proxy
                    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
                    res = await fetch(proxyUrl).catch(() => null);
                    if (res && res.ok) data = await res.json();
                }

                if (data && data.markets) {
                    rawMarkets.push(...data.markets);
                }
            } catch (e) {}
        }

        // Fallback open query if series empty
        if (rawMarkets.length === 0) {
            const fallbackUrl = `https://api.elections.kalshi.com/trade-api/v2/markets?status=open&limit=250`;
            try {
                let res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(fallbackUrl)}`).catch(() => null);
                if (res && res.ok) {
                    const data = await res.json();
                    if (data && data.markets) rawMarkets.push(...data.markets);
                }
            } catch (e) {}
        }

        const unique = new Map();
        rawMarkets.forEach(m => {
            if (m && m.ticker) unique.set(m.ticker, m);
        });

        const parsed = Array.from(unique.values()).map(m => {
            let price = 0;
            if (m.yes_ask_dollars !== undefined && parseFloat(m.yes_ask_dollars) > 0) price = parseFloat(m.yes_ask_dollars);
            else if (m.last_price_dollars !== undefined && parseFloat(m.last_price_dollars) > 0) price = parseFloat(m.last_price_dollars);
            else if (m.yes_bid_dollars !== undefined && parseFloat(m.yes_bid_dollars) > 0) price = parseFloat(m.yes_bid_dollars);
            else if (m.yes_ask !== undefined && m.yes_ask > 0) price = m.yes_ask > 1 ? m.yes_ask / 100 : m.yes_ask;

            return {
                exchange: 'kalshi',
                ticker: m.ticker,
                title: m.title || m.ticker,
                price: price,
                floor_strike: m.floor_strike,
                cap_strike: m.cap_strike,
                url: `https://kalshi.com/markets/${m.ticker}`
            };
        });

        return { markets: parsed, count: parsed.length };
    }

    // Client-side Polymarket Fetcher
    async function fetchPolymarketClientSide() {
        const url = 'https://gamma-api.polymarket.com/events?limit=100&active=true&closed=false';
        let parsed = [];
        try {
            const res = await fetch(url);
            if (res.ok) {
                const events = await res.json();
                if (Array.isArray(events)) {
                    events.forEach(evt => {
                        const eventTitle = evt.title || '';
                        const markets = evt.markets || [];
                        markets.forEach(m => {
                            let price = 0.5;
                            try {
                                if (typeof m.outcomePrices === 'string') {
                                    const arr = JSON.parse(m.outcomePrices);
                                    price = parseFloat(arr[0]) || 0.5;
                                } else if (Array.isArray(m.outcomePrices)) {
                                    price = parseFloat(m.outcomePrices[0]) || 0.5;
                                }
                            } catch (e) {}

                            const fullTitle = `${eventTitle} ${m.groupItemTitle || m.question || ''}`;
                            parsed.push({
                                exchange: 'polymarket',
                                ticker: m.slug || evt.slug || m.id,
                                title: fullTitle,
                                price: price,
                                url: `https://polymarket.com/event/${evt.slug}`
                            });
                        });
                    });
                }
            }
        } catch (e) {}
        return { markets: parsed, count: parsed.length };
    }

    // Client-side Matcher Engine with Side Resolution & Alias Matching
    function matchRowsClientSide(rows, kalshiMarkets, polyMarkets) {
        return rows.map(r => {
            const pModel = r.winPctDecimal;

            // Resolve Side & Target Team Code
            let sideRaw = (r.side || 'home').toLowerCase();
            let targetTeamCode = '';
            let sideDisplay = r.side || '';

            if (sideRaw === 'home') {
                targetTeamCode = r.home;
                sideDisplay = r.home;
            } else if (sideRaw === 'away') {
                targetTeamCode = r.away;
                sideDisplay = r.away;
            } else if (sideRaw === 'over' || sideRaw === 'under') {
                targetTeamCode = '';
                sideDisplay = sideRaw.charAt(0).toUpperCase() + sideRaw.slice(1);
            } else {
                targetTeamCode = sideRaw.toUpperCase();
                sideDisplay = targetTeamCode;
            }

            // Market Display
            let sectionStr = (r.section || r.market || 'h2h').toLowerCase();
            let marketDisplay = 'H2H';
            if (sectionStr.includes('spread')) {
                marketDisplay = r.point ? `SPREAD (${r.point})` : 'SPREAD';
            } else if (sectionStr.includes('total')) {
                marketDisplay = r.point ? `TOTAL (${r.point})` : 'TOTAL';
            }

            // Match Kalshi & Polymarket
            const kMatch = findBestMatchClientSide(r, targetTeamCode, kalshiMarkets);
            const pMatch = findBestMatchClientSide(r, targetTeamCode, polyMarkets);

            // Date Format
            let dateFormatted = 'Sep 22';
            if (r.date && r.date.length >= 8) {
                const months = { '01':'Jan', '02':'Feb', '03':'Mar', '04':'Apr', '05':'May', '06':'Jun', '07':'Jul', '08':'Aug', '09':'Sep', '10':'Oct', '11':'Nov', '12':'Dec' };
                const m = r.date.substring(4, 6);
                const d = parseInt(r.date.substring(6, 8), 10);
                dateFormatted = `${months[m] || 'Sep'} ${d}`;
            }

            // Kalshi Edge
            let kalshiProbPct = '—';
            let kalshiEdgePct = '—';
            let kalshiEdgeVal = -999;
            let kalshiUrl = kMatch ? kMatch.url : null;
            if (kMatch && kMatch.price > 0) {
                kalshiProbPct = `${(kMatch.price * 100).toFixed(1)}%`;
                kalshiEdgeVal = parseFloat(((pModel - kMatch.price) * 100).toFixed(1));
                kalshiEdgePct = kalshiEdgeVal > 0 ? `+${kalshiEdgeVal.toFixed(1)}%` : `${kalshiEdgeVal.toFixed(1)}%`;
            }

            // Poly Edge
            let polyProbPct = '—';
            let polyEdgePct = '—';
            let polyEdgeVal = -999;
            let polyUrl = pMatch ? pMatch.url : null;
            if (pMatch && pMatch.price > 0) {
                polyProbPct = `${(pMatch.price * 100).toFixed(1)}%`;
                polyEdgeVal = parseFloat(((pModel - pMatch.price) * 100).toFixed(1));
                polyEdgePct = polyEdgeVal > 0 ? `+${polyEdgeVal.toFixed(1)}%` : `${polyEdgeVal.toFixed(1)}%`;
            }

            // Half Kelly
            let halfKellyPct = '—';
            let halfKellyVal = 0;
            const validProbs = [];
            if (kMatch && kMatch.price > 0) validProbs.push(kMatch.price);
            if (pMatch && pMatch.price > 0) validProbs.push(pMatch.price);

            if (validProbs.length > 0) {
                const bestMarketProb = Math.min(...validProbs);
                if (bestMarketProb < 1.0 && pModel > bestMarketProb) {
                    const fullKelly = (pModel - bestMarketProb) / (1.0 - bestMarketProb);
                    const halfKelly = fullKelly * 0.5;
                    if (halfKelly > 0) {
                        halfKellyVal = parseFloat((halfKelly * 100).toFixed(1));
                        halfKellyPct = `${halfKellyVal.toFixed(1)}%`;
                    }
                }
            }

            const isPosEv = kalshiEdgeVal > 0 || polyEdgeVal > 0;

            return {
                date_formatted: dateFormatted,
                home_team: r.home,
                away_team: r.away,
                market_display: marketDisplay,
                side_display: sideDisplay,
                model_prob: pModel,
                model_prob_pct: `${(pModel * 100).toFixed(1)}%`,
                kalshi_prob_pct: kalshiProbPct,
                kalshi_edge_pct: kalshiEdgePct,
                kalshi_edge_val: kalshiEdgeVal,
                kalshi_url: kalshiUrl,
                poly_prob_pct: polyProbPct,
                poly_edge_pct: polyEdgePct,
                poly_edge_val: polyEdgeVal,
                poly_url: polyUrl,
                half_kelly_pct: halfKellyPct,
                half_kelly_val: halfKellyVal,
                is_pos_ev: isPosEv
            };
        });
    }

    function findBestMatchClientSide(row, targetTeamCode, markets) {
        if (!markets || markets.length === 0) return null;
        
        const homeCode = (row.home || '').toUpperCase();
        const awayCode = (row.away || '').toUpperCase();
        const section = (row.section || row.market || '').toLowerCase();
        const pointVal = row.point ? parseFloat(row.point.replace('+', '')) : null;
        const sideRaw = (row.side || '').toLowerCase();

        const homeAliases = TEAM_ALIASES[homeCode] || [homeCode];
        const awayAliases = TEAM_ALIASES[awayCode] || [awayCode];
        const targetAliases = TEAM_ALIASES[targetTeamCode] || (targetTeamCode ? [targetTeamCode] : []);

        let best = null;
        let highestScore = 0;

        for (const m of markets) {
            let score = 0;
            const titleUpper = (m.title || '').toUpperCase();
            const tickerUpper = (m.ticker || '').toUpperCase();

            // Match Home & Away Team Aliases
            const matchHome = homeAliases.some(a => titleUpper.includes(a) || tickerUpper.includes(a));
            const matchAway = awayAliases.some(a => titleUpper.includes(a) || tickerUpper.includes(a));

            if (matchHome) score += 150;
            if (matchAway) score += 150;

            // Match Target Side Team
            if (targetAliases.length > 0) {
                const matchTarget = targetAliases.some(a => titleUpper.includes(a) || tickerUpper.includes(a));
                if (matchTarget) score += 200;
            }

            // Total Over/Under Match
            if (section.includes('total')) {
                if (sideRaw === 'over' && (titleUpper.includes('OVER') || tickerUpper.includes('OVER'))) score += 100;
                if (sideRaw === 'under' && (titleUpper.includes('UNDER') || tickerUpper.includes('UNDER'))) score += 100;
            }

            // Strike Point Tolerance Match (0.1 tolerance)
            if (pointVal !== null && !isNaN(pointVal)) {
                const absPt = Math.abs(pointVal);
                if (m.floor_strike !== undefined && Math.abs(parseFloat(m.floor_strike) - absPt) <= 0.1) {
                    score += 150;
                } else if (titleUpper.includes(absPt.toString()) || tickerUpper.includes(absPt.toString())) {
                    score += 150;
                }
            }

            if (score > highestScore && score >= 250) {
                highestScore = score;
                best = m;
            }
        }

        if (!best) return null;

        // Spread underdog price inversion
        let price = best.price;
        const isUnderdogSpread = section.includes('spread') && (sideRaw.includes('+') || (pointVal !== null && pointVal > 0));
        if (isUnderdogSpread && price > 0 && price < 1) {
            price = Math.round((1.0 - price) * 1000) / 1000;
        }

        return { ...best, price: price };
    }

    function updateStatusPill(pillElement, state, text) {
        const dot = pillElement.querySelector('.dot');
        const textSpan = pillElement.querySelector('.pill-text');

        textSpan.textContent = text;
        dot.className = 'dot';
        if (state === 'connected') dot.classList.add('dot-green');
        else if (state === 'error') dot.classList.add('dot-red');
        else dot.classList.add('dot-yellow');
    }

    // Render & Filter Table Rows
    function renderTable() {
        const showPosOnly = posEvOnlyToggle.checked;
        const minEdge = parseFloat(minEdgeInput.value) || 0;
        const sortBy = sortSelect.value;

        let filtered = rawLines.filter(row => {
            if (showPosOnly && !row.is_pos_ev) return false;
            
            const maxEdge = Math.max(
                row.kalshi_edge_val > -900 ? row.kalshi_edge_val : -999,
                row.poly_edge_val > -900 ? row.poly_edge_val : -999
            );

            if (maxEdge < minEdge) return false;

            return true;
        });

        // Sorting Logic
        filtered.sort((a, b) => {
            if (sortBy === 'k_edge_desc') return b.kalshi_edge_val - a.kalshi_edge_val;
            if (sortBy === 'p_edge_desc') return b.poly_edge_val - a.poly_edge_val;
            if (sortBy === 'model_prob_desc') return b.model_prob - a.model_prob;
            if (sortBy === 'matchup_asc') return `${a.home_team} ${a.away_team}`.localeCompare(`${b.home_team} ${b.away_team}`);
            return 0;
        });

        rowCountText.textContent = `Showing ${filtered.length} / ${rawLines.length} rows`;

        if (filtered.length === 0) {
            tableBody.innerHTML = '';
            tableEmptyState.classList.remove('hidden');
            return;
        }

        tableEmptyState.classList.add('hidden');

        tableBody.innerHTML = filtered.map(row => {
            const posClass = row.is_pos_ev ? 'row-pos-ev' : '';

            // Kalshi Edge Tag
            let kalshiEdgeTag = `<span class="badge-edge-neg">${row.kalshi_edge_pct}</span>`;
            if (row.kalshi_edge_val > 0) {
                kalshiEdgeTag = `<span class="badge-edge-pos">${row.kalshi_edge_pct}</span>`;
            }

            // Poly Edge Tag
            let polyEdgeTag = `<span class="badge-edge-neg">${row.poly_edge_pct}</span>`;
            if (row.poly_edge_val > 0) {
                polyEdgeTag = `<span class="badge-edge-pos">${row.poly_edge_pct}</span>`;
            }

            // Kelly Tag
            let kellyTag = `<span class="font-mono">—</span>`;
            if (row.half_kelly_val > 0) {
                kellyTag = `<span class="badge-kelly">${row.half_kelly_pct}</span>`;
            }

            // Link Buttons
            let kalshiBtn = row.kalshi_url ? `<a href="${row.kalshi_url}" target="_blank" rel="noopener" class="exchange-link link-kalshi">Kalshi ↗</a>` : '';
            let polyBtn = row.poly_url ? `<a href="${row.poly_url}" target="_blank" rel="noopener" class="exchange-link link-poly">Poly ↗</a>` : '';

            return `
                <tr class="${posClass}">
                    <td class="font-mono">${row.date_formatted}</td>
                    <td class="matchup-cell">${row.home_team} vs ${row.away_team}</td>
                    <td class="font-mono">${row.market_display}</td>
                    <td class="side-cell">${row.side_display}</td>
                    <td class="font-mono">${row.model_prob_pct}</td>
                    <td class="font-mono">${row.kalshi_prob_pct}</td>
                    <td>${kalshiEdgeTag}</td>
                    <td class="font-mono">${row.poly_prob_pct}</td>
                    <td>${polyEdgeTag}</td>
                    <td>${kellyTag}</td>
                    <td>
                        <div class="link-buttons">
                            ${kalshiBtn}
                            ${polyBtn}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Initial load
    fetchAndCalculate(false);
});
