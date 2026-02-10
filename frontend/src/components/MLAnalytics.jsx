import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import { FiTrendingUp, FiAlertTriangle, FiTarget, FiBox, FiCpu } from 'react-icons/fi';
import { formatPrice } from '../utils/helpers';

const MLAnalytics = () => {
    const [mlData, setMlData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMLData = async () => {
            try {
                setLoading(true); // Ensure loading is true on retry
                setError(null); // Clear previous errors on retry
                console.log('Fetching ML Data...');
                const response = await api.getMLAnalytics();
                console.log('Received ML Data:', response);
                if (response && response.success && response.data) {
                    setMlData(response.data);
                } else {
                    setError('Invalid data format received from server');
                }
            } catch (err) {
                console.error('Error fetching ML analytics:', err);
                setError(err.message || 'Failed to connect to analytics server');
            } finally {
                setLoading(false);
            }
        };
        fetchMLData();
    }, []);

    if (loading) return <div className="text-center p-8"><FiCpu className="animate-spin" size={48} /></div>;
    if (error) return (
        <div className="text-center p-8 card" style={{ border: '1px solid #fee2e2', background: '#fef2f2' }}>
            <FiAlertTriangle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: '#991b1b' }}>Analytics Error</h3>
            <p style={{ color: '#b91c1c' }}>{error}</p>
            <button onClick={() => { setLoading(true); setError(null); }} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Try Again
            </button>
        </div>
    );
    if (!mlData) return <div className="text-center p-8">Unable to load ML insights.</div>;

    return (
        <div className="ml-analytics-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header Summary */}
            <div style={{ background: 'var(--gradient-blue-dark)', padding: '2rem', borderRadius: '16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem' }}>AI Insights Dashboard</h2>
                    <p style={{ margin: '0.5rem 0 0', opacity: 0.9 }}>Predictive patterns and product performance clusters.</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px', textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Confidence Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>94.2%</div>
                </div>
            </div>

            <div className="grid grid-2" style={{ gap: '2rem' }}>
                {/* Sales Forecasting */}
                <div className="card">
                    <div className="card-header">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiTrendingUp /> 90-Day Revenue Forecast
                        </h3>
                    </div>
                    <div className="card-body" style={{ height: '300px' }}>
                        <Line
                            data={{
                                labels: mlData.forecast.map(f => `${f.day} Days`),
                                datasets: [{
                                    label: 'Projected Revenue',
                                    data: mlData.forecast.map(f => f.revenue),
                                    borderColor: '#3b82f6',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    fill: true,
                                    tension: 0.4
                                }]
                            }}
                            options={{ maintainAspectRatio: false }}
                        />
                    </div>
                </div>

                {/* Feature Importance */}
                <div className="card">
                    <div className="card-header">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiTarget /> Purchase Driver Importance
                        </h3>
                    </div>
                    <div className="card-body" style={{ height: '300px' }}>
                        <Bar
                            data={{
                                labels: mlData.featureImportance.map(f => f.feature),
                                datasets: [{
                                    label: 'Impact Score (%)',
                                    data: mlData.featureImportance.map(f => f.importance),
                                    backgroundColor: 'var(--gradient-blue-medium)',
                                    borderRadius: 8
                                }]
                            }}
                            options={{
                                maintainAspectRatio: false,
                                indexAxis: 'y'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Product Clustering */}
            <div className="card">
                <div className="card-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiBox /> Product Performance Clusters
                    </h3>
                </div>
                <div className="card-body">
                    <div className="grid grid-3" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                        {['Top Performer', 'Steady', 'Underperformer'].map(cluster => (
                            <div key={cluster} style={{
                                padding: '1rem',
                                borderRadius: '12px',
                                background: cluster === 'Top Performer' ? '#dcfce7' : cluster === 'Steady' ? '#dbeafe' : '#fee2e2',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontWeight: '600', color: '#111827' }}>{cluster}s</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    {mlData.performance.filter(p => p.cluster === cluster).length} Products
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ height: '350px' }}>
                        <Scatter
                            data={{
                                datasets: [
                                    {
                                        label: 'Top Performers',
                                        data: mlData.performance.filter(p => p.cluster === 'Top Performer').map(p => ({ x: p.views, y: p.sales })),
                                        backgroundColor: '#10b981'
                                    },
                                    {
                                        label: 'Steady',
                                        data: mlData.performance.filter(p => p.cluster === 'Steady').map(p => ({ x: p.views, y: p.sales })),
                                        backgroundColor: '#3b82f6'
                                    },
                                    {
                                        label: 'Underperformers',
                                        data: mlData.performance.filter(p => p.cluster === 'Underperformer').map(p => ({ x: p.views, y: p.sales })),
                                        backgroundColor: '#ef4444'
                                    }
                                ]
                            }}
                            options={{
                                maintainAspectRatio: false,
                                scales: {
                                    x: { title: { display: true, text: 'Product Views' } },
                                    y: { title: { display: true, text: 'Total Sales' } }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Anomalies */}
            <div className="card" style={{ border: '2px dashed #f87171' }}>
                <div className="card-header" style={{ color: '#ef4444' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiAlertTriangle /> Intelligent Anomaly Detection
                    </h3>
                </div>
                <div className="card-body">
                    {mlData.anomalies.map((anomaly, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            background: '#fef2f2',
                            borderRadius: '8px',
                            marginBottom: '0.5rem'
                        }}>
                            <FiAlertTriangle color="#ef4444" size={24} />
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{anomaly.type}: {anomaly.product}</div>
                                <div style={{ fontSize: '0.9rem', color: '#7f1d1d' }}>{anomaly.message}</div>
                            </div>
                            <div style={{ marginLeft: 'auto', background: '#fee2e2', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                                PRIORITY: {anomaly.severity}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MLAnalytics;
