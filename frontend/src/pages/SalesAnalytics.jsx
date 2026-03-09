import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, Tooltip, Legend,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import {
  FiTrendingUp, FiTrendingDown, FiAlertTriangle,
  FiPackage, FiDollarSign, FiShoppingCart,
  FiRefreshCw, FiAlertCircle, FiCheckCircle, FiBarChart2,
  FiLoader, FiInbox
} from 'react-icons/fi';
import API, { api } from '../utils/api';

/* ─── CONSTANTS ─────────────────────────────────────────────────────────── */

const CATEGORY_COLORS = ['#1e3a8a', '#3b82f6', '#b45309', '#d97706', '#8b5cf6', '#10b981', '#f43f5e', '#06b6d4'];

/* ─── HELPER FUNCTIONS ───────────────────────────────────────────────── */

const formatINR = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

const formatK = (val) => {
  if (!val) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
};

/* ─── CUSTOM TOOLTIP ─────────────────────────────────────────────────── */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem',
      boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: '0.875rem', fontWeight: 700 }}>
          {p.name}: {p.dataKey === 'revenue' ? formatINR(p.value || 0) : (p.value || 0).toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem',
      boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 700 }}>{d.name}</p>
      <p style={{ color: d.payload.fill, fontSize: '0.8rem', marginTop: 4 }}>
        Units: {d.value.toLocaleString('en-IN')}
      </p>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
        Revenue: {formatINR(d.payload.revenue)}
      </p>
      <p style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>
        Share: {d.payload.pct}%
      </p>
    </div>
  );
};

/* ─── LOADING SPINNER ────────────────────────────────────────────────── */

const Spinner = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
    <FiRefreshCw size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Loading live data…</span>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

/* ─── EMPTY STATE ────────────────────────────────────────────────────── */

const EmptyState = ({ message }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem' }}>
    <FiInbox size={36} color="var(--text-tertiary)" />
    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', textAlign: 'center' }}>{message}</span>
  </div>
);

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────── */

const SalesAnalytics = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  const [chartStyle, setChartStyle] = useState('area');
  const [isMounted, setIsMounted] = useState(false);
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    // Increased delay for layout to fully settle in complex grids
    const timer = setTimeout(() => setChartKey(prev => prev + 1), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Real data state
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Stock restock state (UI-only optimistic update)
  const [stockItems, setStockItems] = useState([]);
  const [restockingIds, setRestockingIds] = useState(new Set());

  /* ── Fetch real data ── */
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/analytics/sales-dashboard');
      const data = res.data?.data;
      if (!data) throw new Error('Invalid response from server');
      setDashData(data);
      setStockItems(data.lowStockProducts || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Sales dashboard fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  // SECTION 1: Effects & Polling
  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 120000); // 2 mins
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  /* ── Derived data ── */
  const chartData = useMemo(() => {
    if (!dashData) return [];
    if (timeframe === 'daily') return dashData.dailyData || [];
    if (timeframe === 'weekly') return dashData.weeklyData || [];
    return dashData.monthlyData || [];
  }, [dashData, timeframe]);

  // KPIs — prefer server-computed totals (all-time) but recalc AOV from chart window
  const kpis = useMemo(() => {
    if (!dashData) return { totalRev: 0, totalOrders: 0, aov: 0 };
    // Use chart-window sums for Revenue / Orders cards so they update with timeframe
    const windowRev = chartData.reduce((s, d) => s + (d.revenue || 0), 0);
    const windowOrders = chartData.reduce((s, d) => s + (d.orders || 0), 0);
    const aov = windowOrders > 0 ? Math.round(windowRev / windowOrders) : 0;
    return { totalRev: windowRev, totalOrders: windowOrders, aov };
  }, [dashData, chartData]);

  const pieData = useMemo(() => {
    if (!dashData?.categoryData?.length) return [];
    const total = dashData.categoryData.reduce((s, d) => s + (d.units || 0), 0);
    return dashData.categoryData.map(d => ({
      ...d,
      pct: total > 0 ? ((d.units / total) * 100).toFixed(1) : '0.0',
    }));
  }, [dashData]);

  const totalUnits = useMemo(() => pieData.reduce((s, d) => s + (d.units || 0), 0), [pieData]);

  const criticalStock = stockItems.filter(p => p.stock < 5);
  const warningStock = stockItems.filter(p => p.stock >= 5 && p.stock < 10);

  /* ── Restock handler (Actual backend call) ── */
  const handleRestock = async (id) => {
    setRestockingIds(prev => new Set([...prev, id]));
    try {
      const product = stockItems.find(p => p.id?.toString() === id?.toString());
      if (product) {
        const newStock = (product.stock || 0) + 25;
        await api.updateProduct(id, { stock: newStock });
        setStockItems(prev => prev.map(p => p.id?.toString() === id?.toString() ? { ...p, stock: newStock } : p));
      }
    } catch (err) {
      console.error('Restock error:', err);
      alert('Failed to update stock. Please try again.');
    } finally {
      setRestockingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  /* ── Render ── */
  if (error && !dashData) {
    return (
      <div className="admin-page-wrapper" style={{ padding: '2rem 0' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <FiAlertCircle size={40} color="var(--danger)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Failed to Load Analytics</h3>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchDashboard}>
            <FiRefreshCw size={14} style={{ marginRight: 6 }} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-wrapper">

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>Sales &amp; Analytics</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastUpdated && (
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            className="btn btn-sm btn-ghost"
            onClick={fetchDashboard}
            disabled={loading}
            title="Refresh data"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <FiRefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: 'var(--success)',
              boxShadow: '0 0 6px var(--success)', display: 'inline-block'
            }} />
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', fontWeight: 600 }}>Live Data</span>
          </div>
        </div>
      </div>

      {loading && !dashData ? (
        <Spinner />
      ) : (
        <>
          {/* ══════════════════ SECTION 1: REVENUE REPORTS ══════════════════ */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0 }}>Revenue Reports</h3>
                <div style={{ display: 'flex', gap: 6, background: 'var(--bg-tertiary)', borderRadius: 10, padding: 4, border: '1px solid var(--border-light)' }}>
                  {['daily', 'weekly', 'monthly'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={timeframe === t ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}
                      style={{ fontSize: '0.8125rem' }}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="card-body">

              {/* KPI Stats */}
              <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card" style={{ borderLeftColor: 'var(--primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-md)',
                      background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FiDollarSign size={20} color="var(--primary)" />
                    </div>
                  </div>
                  <span className="stat-number">{formatK(kpis.totalRev)}</span>
                  <span className="stat-label">Revenue ({timeframe})</span>
                </div>

                <div className="stat-card" style={{ borderLeftColor: 'var(--warning)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-md)',
                      background: 'var(--warning-50)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FiShoppingCart size={20} color="var(--warning)" />
                    </div>
                  </div>
                  <span className="stat-number">{kpis.totalOrders.toLocaleString('en-IN')}</span>
                  <span className="stat-label">Orders ({timeframe})</span>
                </div>

                <div className="stat-card" style={{ borderLeftColor: 'var(--accent)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-50)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FiTrendingUp size={20} color="var(--accent)" />
                    </div>
                  </div>
                  <span className="stat-number">{formatK(kpis.aov)}</span>
                  <span className="stat-label">Avg. Order Value</span>
                </div>
              </div>

              {/* Chart toggle */}
              <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem' }}>
                {['area', 'bar'].map(s => (
                  <button
                    key={s}
                    onClick={() => setChartStyle(s)}
                    className={chartStyle === s ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}
                    style={{ fontSize: '0.8rem' }}
                  >
                    {s === 'area' ? '📈 Area' : '📊 Bar'}
                  </button>
                ))}
              </div>

              {/* Chart */}
              {chartData.length === 0 ? (
                <EmptyState message={`No ${timeframe} order data found yet. Start receiving orders to see charts here.`} />
              ) : (
                <div style={{ height: '400px', width: '100%', minWidth: '300px', position: 'relative', display: 'block', overflow: 'hidden' }}>
                  {isMounted && chartData.length > 0 && (
                    <ResponsiveContainer key={`rev-chart-${chartKey}-${chartStyle}`} width="100%" height={400} minHeight={300} aspect={2.5}>
                      {chartStyle === 'area' ? (
                        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <defs>
                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#b45309" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#b45309" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                          <XAxis
                            dataKey="label"
                            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
                            axisLine={{ stroke: 'var(--border-light)' }}
                            tickLine={false}
                            dy={10}
                          />
                          <YAxis
                            yAxisId="rev"
                            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={formatK}
                          />
                          <YAxis
                            yAxisId="ord"
                            orientation="right"
                            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend verticalAlign="top" height={36} iconType="circle" />
                          <Area
                            yAxisId="rev"
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#1e3a8a"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#revGrad)"
                            activeDot={{ r: 8, strokeWidth: 0 }}
                            isAnimationActive={false}
                          />
                          <Area
                            yAxisId="ord"
                            type="monotone"
                            dataKey="orders"
                            name="Orders"
                            stroke="#b45309"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#ordGrad)"
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      ) : (
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                          <XAxis
                            dataKey="label"
                            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
                            axisLine={{ stroke: 'var(--border-light)' }}
                            tickLine={false}
                            dy={10}
                          />
                          <YAxis
                            yAxisId="rev"
                            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={formatK}
                          />
                          <YAxis
                            yAxisId="ord"
                            orientation="right"
                            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend verticalAlign="top" height={36} iconType="circle" />
                          <Bar
                            yAxisId="rev"
                            dataKey="revenue"
                            name="Revenue"
                            fill="#1e3a8a"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={40}
                            isAnimationActive={false}
                          />
                          <Bar
                            yAxisId="ord"
                            dataKey="orders"
                            name="Orders"
                            fill="#b45309"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={40}
                            isAnimationActive={false}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ════════════ SECTION 2 & 3: BEST SELLERS + LOW-STOCK ═════════ */}
          <div className="grid grid-2" style={{ gap: '2rem', marginBottom: '2rem' }}>

            {/* SECTION 2: Best-Selling Products */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ margin: 0 }}>Best-Selling Products</h3>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Top 5 by units sold (all orders)</p>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {!dashData?.bestSellers?.length ? (
                  <EmptyState message="No order data yet. Best sellers will appear once orders come in." />
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table" style={{ boxShadow: 'none', borderRadius: 0 }}>
                      <thead>
                        <tr>
                          {['#', 'Product', 'Units', 'Revenue'].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dashData.bestSellers.map((p, idx) => (
                          <tr key={String(p.id)}>
                            <td style={{ fontWeight: 700, color: 'var(--text-tertiary)' }}>
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{p.name}</div>
                              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: 2 }}>{p.sku} · {p.category}</div>
                            </td>
                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                              {(p.unitsSold || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                              {formatK(p.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: Low Stock Alerts */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Low Stock Alerts</h3>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Products with stock &lt; 10 units</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <span className="badge badge-danger">🔴 {criticalStock.length} Critical</span>
                    <span className="badge badge-warning">🟡 {warningStock.length} Warning</span>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {stockItems.length === 0 ? (
                  <EmptyState message="All products are well-stocked! No low-stock alerts at this time." />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 360, overflowY: 'auto' }}>
                    {[...stockItems].sort((a, b) => a.stock - b.stock).map(p => {
                      const pId = String(p.id);
                      const isRestocking = restockingIds.has(pId);
                      const isCritical = p.stock < 5;
                      const isRestocked = p.stock >= 10;

                      return (
                        <div key={pId} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                          padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)',
                          background: isRestocked ? 'var(--success-50)' : isCritical ? 'var(--danger-50)' : 'var(--warning-50)',
                          border: `1px solid ${isRestocked ? 'var(--secondary-light)' : isCritical ? 'var(--danger-light)' : 'var(--accent-light)'}`,
                          transition: 'all 0.2s',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 'var(--radius-md)', flexShrink: 0,
                              background: isRestocked ? 'var(--success-dark)' : isCritical ? 'var(--danger)' : 'var(--warning)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {isRestocked
                                ? <FiCheckCircle color="#fff" size={16} />
                                : <FiAlertCircle color="#fff" size={16} />
                              }
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {p.name}
                              </div>
                              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', marginTop: 2 }}>
                                SKU: {p.sku}&nbsp;·&nbsp;
                                <span style={{ fontWeight: 700, color: isRestocked ? 'var(--success-dark)' : isCritical ? 'var(--danger-dark)' : 'var(--warning-dark)' }}>
                                  {p.stock} units left
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => !isRestocking && !isRestocked && handleRestock(pId)}
                            disabled={isRestocking || isRestocked}
                            className={`btn btn-sm ${isRestocked ? 'btn-ghost' : isCritical ? 'btn-danger' : 'btn-secondary'}`}
                            style={{ flexShrink: 0, opacity: isRestocking ? 0.7 : 1 }}
                          >
                            {isRestocked ? '✓ In Stock' : isRestocking ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FiRefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} /> Ordering…
                              </span>
                            ) : 'Restock'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ════════════════ SECTION 4: SALES BY CATEGORY ════════════════ */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ margin: 0 }}>Sales by Category</h3>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Revenue &amp; unit distribution across product categories</p>
            </div>
            <div className="card-body">
              {pieData.length === 0 ? (
                <EmptyState message="No category sales data yet. Complete orders will populate this chart." />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '2rem', alignItems: 'center' }}>

                  {/* Donut Chart */}
                  <div style={{ height: '400px', width: '100%', minWidth: '300px', position: 'relative', display: 'block', overflow: 'hidden', alignSelf: 'stretch' }}>
                    {isMounted && pieData.length > 0 && (
                      <ResponsiveContainer key={`pie-chart-${chartKey}`} width="100%" height={400} minHeight={300} aspect={1}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%" cy="50%"
                            innerRadius="55%"
                            outerRadius="80%"
                            paddingAngle={3}
                            dataKey="units"
                            nameKey="name"
                            stroke="none"
                            isAnimationActive={false}
                          >
                            {pieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomPieTooltip />} />
                          <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
                            fill="var(--text-primary)" fontSize={13} fontWeight={700}>
                            {totalUnits.toLocaleString('en-IN')}
                          </text>
                          <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle"
                            fill="var(--text-tertiary)" fontSize={10}>
                            Total Units
                          </text>
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Legend + Stats */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {pieData.map((d, i) => (
                      <div key={d.name} style={{
                        display: 'flex', alignItems: 'center', gap: '0.875rem',
                        padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)',
                        transition: 'all 0.2s', cursor: 'default',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <div style={{
                          width: 12, height: 12, borderRadius: 3, flexShrink: 0,
                          background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize' }}>{d.name}</div>
                          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', marginTop: 2 }}>
                            {(d.units || 0).toLocaleString('en-IN')} units · {formatINR(d.revenue)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ color: CATEGORY_COLORS[i % CATEGORY_COLORS.length], fontWeight: 800, fontSize: '1rem' }}>{d.pct}%</div>
                          <div style={{ width: 60, height: 4, background: 'var(--border-light)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                            <div style={{
                              width: `${d.pct}%`, height: '100%', borderRadius: 2,
                              background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                            }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SalesAnalytics;
