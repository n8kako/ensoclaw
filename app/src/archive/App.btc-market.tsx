import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

const SEARCH_QUERY = 'Bitcoin Up or Down 5m';
const SEARCH_LIMIT = '200';
const MARKET_POLL_MS = 15_000;

interface GammaMarketRaw {
  id?: unknown;
  slug?: unknown;
  question?: unknown;
  outcomes?: unknown;
  outcomePrices?: unknown;
  clobTokenIds?: unknown;
  eventStartTime?: unknown;
  endDate?: unknown;
  acceptingOrders?: unknown;
  closed?: unknown;
  bestBid?: unknown;
  bestAsk?: unknown;
  lastTradePrice?: unknown;
  spread?: unknown;
  volume24hr?: unknown;
  oneHourPriceChange?: unknown;
}

interface GammaSearchEvent {
  markets?: GammaMarketRaw[] | null;
}

interface GammaSearchResponse {
  events?: GammaSearchEvent[] | null;
}

interface Market {
  id: string;
  slug: string;
  question: string;
  startTime: Date | null;
  endTime: Date | null;
  acceptingOrders: boolean;
  closed: boolean;
  bestBid: number | null;
  bestAsk: number | null;
  lastTradePrice: number | null;
  spread: number | null;
  volume24h: number | null;
  oneHourPriceChange: number | null;
  upPrice: number | null;
  downPrice: number | null;
  upTokenId: string | null;
  downTokenId: string | null;
}

function parseArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry));
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((entry) => String(entry));
      }
    } catch {
      return [];
    }
  }

  return [];
}

function parseNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return false;
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string') {
    return null;
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return null;
  }

  return new Date(timestamp);
}

function isFiniteNumber(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function normalizeMarket(raw: GammaMarketRaw): Market | null {
  const slug = typeof raw.slug === 'string' ? raw.slug : null;
  if (!slug || !slug.includes('btc-updown-5m')) {
    return null;
  }

  const outcomes = parseArray(raw.outcomes).map((outcome) => outcome.trim().toLowerCase());
  const outcomePrices = parseArray(raw.outcomePrices).map((price) => parseNumber(price));
  const clobTokenIds = parseArray(raw.clobTokenIds);

  const upIndex = outcomes.indexOf('up');
  const downIndex = outcomes.indexOf('down');

  const upPrice = upIndex >= 0 ? outcomePrices[upIndex] ?? null : null;
  const downPrice = downIndex >= 0 ? outcomePrices[downIndex] ?? null : null;
  const upTokenId = upIndex >= 0 ? clobTokenIds[upIndex] ?? null : null;
  const downTokenId = downIndex >= 0 ? clobTokenIds[downIndex] ?? null : null;

  const marketId = raw.id === undefined || raw.id === null ? slug : String(raw.id);
  const question = typeof raw.question === 'string' ? raw.question : slug;

  return {
    id: marketId,
    slug,
    question,
    startTime: parseDate(raw.eventStartTime),
    endTime: parseDate(raw.endDate),
    acceptingOrders: parseBoolean(raw.acceptingOrders),
    closed: parseBoolean(raw.closed),
    bestBid: parseNumber(raw.bestBid),
    bestAsk: parseNumber(raw.bestAsk),
    lastTradePrice: parseNumber(raw.lastTradePrice),
    spread: parseNumber(raw.spread),
    volume24h: parseNumber(raw.volume24hr),
    oneHourPriceChange: parseNumber(raw.oneHourPriceChange),
    upPrice,
    downPrice,
    upTokenId,
    downTokenId,
  };
}

async function fetchByStatus(status: 'active' | 'closed'): Promise<Market[]> {
  const params = new URLSearchParams({
    q: SEARCH_QUERY,
    limit_per_type: SEARCH_LIMIT,
    events_status: status,
  });

  const response = await fetch(`/gamma-api/public-search?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Gamma search failed (${response.status})`);
  }

  const payload = (await response.json()) as GammaSearchResponse;
  const markets = (payload.events ?? [])
    .flatMap((event) => event.markets ?? [])
    .map(normalizeMarket)
    .filter((market): market is Market => market !== null);

  return markets;
}

function formatProbability(value: number | null): string {
  if (!isFiniteNumber(value)) {
    return 'n/a';
  }

  return `${(value * 100).toFixed(1)}%`;
}

function formatSignedProbability(value: number | null): string {
  if (!isFiniteNumber(value)) {
    return 'n/a';
  }

  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(2)}%`;
}

function formatVolume(value: number | null): string {
  if (!isFiniteNumber(value)) {
    return '$0';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPrice(value: number | null): string {
  if (!isFiniteNumber(value)) {
    return 'n/a';
  }

  return value.toFixed(3);
}

function formatWindow(startTime: Date | null, endTime: Date | null): string {
  if (!startTime || !endTime) {
    return 'Unknown window';
  }

  const start = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(startTime);

  const end = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(endTime);

  return `${start} - ${end}`;
}

function formatCountdown(endTime: Date | null, nowMs: number): string {
  if (!endTime) {
    return 'No close time';
  }

  const delta = endTime.getTime() - nowMs;
  if (delta <= 0) {
    return 'Resolved';
  }

  const totalSeconds = Math.floor(delta / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m ${seconds}s`;
}

function statusLabel(market: Market): 'Live' | 'Queued' | 'Resolved' {
  if (market.closed) {
    return 'Resolved';
  }

  if (market.acceptingOrders) {
    return 'Live';
  }

  return 'Queued';
}

function App() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [loadingMarkets, setLoadingMarkets] = useState<boolean>(true);
  const [marketsError, setMarketsError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const loadMarkets = useCallback(async (silent: boolean) => {
    if (!silent) {
      setLoadingMarkets(true);
    }

    try {
      const [activeMarkets, closedMarkets] = await Promise.all([
        fetchByStatus('active'),
        fetchByStatus('closed'),
      ]);

      const merged = [...activeMarkets, ...closedMarkets];
      const deduped = new Map<string, Market>();

      for (const market of merged) {
        const existing = deduped.get(market.slug);
        if (!existing) {
          deduped.set(market.slug, market);
          continue;
        }

        const existingEnd = existing.endTime?.getTime() ?? 0;
        const incomingEnd = market.endTime?.getTime() ?? 0;
        if (incomingEnd >= existingEnd) {
          deduped.set(market.slug, market);
        }
      }

      const sorted = Array.from(deduped.values()).sort((a, b) => {
        const aTime = a.endTime?.getTime() ?? 0;
        const bTime = b.endTime?.getTime() ?? 0;
        return aTime - bTime;
      });

      setMarkets(sorted);
      setMarketsError(null);
      setLastSync(new Date());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load BTC 5m markets.';
      setMarketsError(message);
    } finally {
      if (!silent) {
        setLoadingMarkets(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadMarkets(false);
    const interval = window.setInterval(() => {
      void loadMarkets(true);
    }, MARKET_POLL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadMarkets]);

  useEffect(() => {
    if (markets.length === 0) {
      setSelectedSlug(null);
      return;
    }

    if (selectedSlug && markets.some((market) => market.slug === selectedSlug)) {
      return;
    }

    const defaultMarket = markets.find((market) => market.acceptingOrders && !market.closed) ?? markets[markets.length - 1];
    setSelectedSlug(defaultMarket.slug);
  }, [markets, selectedSlug]);

  const selectedMarket = useMemo(
    () => markets.find((market) => market.slug === selectedSlug) ?? null,
    [markets, selectedSlug],
  );

  const liveMarkets = useMemo(
    () => markets.filter((market) => market.acceptingOrders && !market.closed),
    [markets],
  );

  const upcomingMarkets = useMemo(
    () => markets.filter((market) => !market.closed),
    [markets],
  );

  const resolvedMarkets = useMemo(
    () => markets.filter((market) => market.closed).sort((a, b) => (b.endTime?.getTime() ?? 0) - (a.endTime?.getTime() ?? 0)),
    [markets],
  );

  const metrics = useMemo(() => {
    const liveUpPrices = liveMarkets.map((market) => market.upPrice).filter(isFiniteNumber);
    const liveSpreads = liveMarkets.map((market) => market.spread).filter(isFiniteNumber);
    const liveVolumes = liveMarkets.map((market) => market.volume24h).filter(isFiniteNumber);

    const avgUpProbability =
      liveUpPrices.length > 0
        ? liveUpPrices.reduce((sum, value) => sum + value, 0) / liveUpPrices.length
        : null;

    const avgSpread =
      liveSpreads.length > 0
        ? liveSpreads.reduce((sum, value) => sum + value, 0) / liveSpreads.length
        : null;

    const totalVolume = liveVolumes.reduce((sum, value) => sum + value, 0);

    const bullishCount = liveUpPrices.filter((value) => value > 0.5).length;

    return {
      liveCount: liveMarkets.length,
      avgUpProbability,
      avgSpread,
      totalVolume,
      bullishCount,
    };
  }, [liveMarkets]);

  return (
    <div className="dashboard">
      <div className="backdrop-gradient" />
      <div className="grid-overlay" />

      <header className="hero">
        <div>
          <p className="eyebrow">Polymarket BTC Microscope</p>
          <h1>BTC 5M Radar</h1>
          <p className="hero-copy">
            Live obsession layer for Bitcoin five-minute up/down windows. Watch odds, spread, and momentum without leaving one screen.
          </p>
        </div>

        <div className="hero-actions">
          <button
            className="refresh-button"
            type="button"
            onClick={() => {
              void loadMarkets(false);
            }}
            disabled={loadingMarkets}
          >
            {loadingMarkets ? 'Syncing…' : 'Refresh'}
          </button>
          <span className="sync-timestamp">
            {lastSync
              ? `Last sync ${new Intl.DateTimeFormat('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  second: '2-digit',
                }).format(lastSync)}`
              : 'Waiting for first sync'}
          </span>
        </div>
      </header>

      {marketsError ? <div className="error-banner">{marketsError}</div> : null}

      <section className="metrics-grid">
        <article className="metric-card">
          <span className="metric-label">Live 5m Windows</span>
          <strong>{metrics.liveCount}</strong>
        </article>
        <article className="metric-card">
          <span className="metric-label">Avg Up Probability</span>
          <strong>{formatProbability(metrics.avgUpProbability)}</strong>
        </article>
        <article className="metric-card">
          <span className="metric-label">Avg Spread</span>
          <strong>{formatProbability(metrics.avgSpread)}</strong>
        </article>
        <article className="metric-card">
          <span className="metric-label">Live 24h Volume</span>
          <strong>{formatVolume(metrics.totalVolume)}</strong>
        </article>
        <article className="metric-card">
          <span className="metric-label">Bullish Windows</span>
          <strong>{metrics.bullishCount}</strong>
        </article>
      </section>

      <main className="layout">
        <section className="focus-panel">
          {selectedMarket ? (
            <>
              <div className="focus-head">
                <span className={`status-pill status-${statusLabel(selectedMarket).toLowerCase()}`}>
                  {statusLabel(selectedMarket)}
                </span>
                <a
                  className="market-link"
                  href={`https://polymarket.com/market/${selectedMarket.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Market
                </a>
              </div>

              <h2>{selectedMarket.question}</h2>
              <p className="window-time">{formatWindow(selectedMarket.startTime, selectedMarket.endTime)}</p>

              <div className="countdown">{formatCountdown(selectedMarket.endTime, nowMs)}</div>

              <div className="probability-stack">
                <div>
                  <span>Up</span>
                  <strong>{formatProbability(selectedMarket.upPrice)}</strong>
                </div>
                <div>
                  <span>Down</span>
                  <strong>{formatProbability(selectedMarket.downPrice)}</strong>
                </div>
              </div>

              <div className="up-bar-track">
                <div
                  className="up-bar-fill"
                  style={{ width: `${Math.max(0, Math.min(100, (selectedMarket.upPrice ?? 0) * 100))}%` }}
                />
              </div>

              <div className="book-stats">
                <article>
                  <span>Best Bid</span>
                  <strong>{formatPrice(selectedMarket.bestBid)}</strong>
                </article>
                <article>
                  <span>Best Ask</span>
                  <strong>{formatPrice(selectedMarket.bestAsk)}</strong>
                </article>
                <article>
                  <span>Last Trade</span>
                  <strong>{formatPrice(selectedMarket.lastTradePrice)}</strong>
                </article>
                <article>
                  <span>1h Delta</span>
                  <strong>{formatSignedProbability(selectedMarket.oneHourPriceChange)}</strong>
                </article>
              </div>

              <div className="official-embed-shell">
                <div className="official-embed-heading">
                  <h3>Official Polymarket Embed</h3>
                  <span>Live</span>
                </div>
                <div className="official-embed-frame">
                  <polymarket-market-embed
                    key={selectedMarket.slug}
                    market={selectedMarket.slug}
                    chart="true"
                    volume="true"
                    theme="dark"
                    width={620}
                    height={410}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="empty-panel">No BTC 5m markets found yet.</p>
          )}
        </section>

        <section className="tape-panel">
          <div className="tape-section">
            <div className="tape-header">
              <h3>Live + Upcoming</h3>
              <span>{upcomingMarkets.length}</span>
            </div>
            <div className="market-list">
              {upcomingMarkets.slice(0, 28).map((market) => (
                <button
                  key={market.slug}
                  className={`market-row ${selectedMarket?.slug === market.slug ? 'market-row-active' : ''}`}
                  type="button"
                  onClick={() => {
                    setSelectedSlug(market.slug);
                  }}
                >
                  <div>
                    <p className="market-row-title">{market.question}</p>
                    <p className="market-row-window">{formatWindow(market.startTime, market.endTime)}</p>
                  </div>
                  <div className="market-row-meta">
                    <span className="market-prob">Up {formatProbability(market.upPrice)}</span>
                    <span className="market-status">{statusLabel(market)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="tape-section">
            <div className="tape-header">
              <h3>Recently Resolved</h3>
              <span>{resolvedMarkets.length}</span>
            </div>
            <div className="market-list">
              {resolvedMarkets.slice(0, 20).map((market) => (
                <button
                  key={market.slug}
                  className={`market-row ${selectedMarket?.slug === market.slug ? 'market-row-active' : ''}`}
                  type="button"
                  onClick={() => {
                    setSelectedSlug(market.slug);
                  }}
                >
                  <div>
                    <p className="market-row-title">{market.question}</p>
                    <p className="market-row-window">{formatWindow(market.startTime, market.endTime)}</p>
                  </div>
                  <div className="market-row-meta">
                    <span className="market-prob">Last {formatPrice(market.lastTradePrice)}</span>
                    <span className="market-status">Resolved</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
