import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiUsers, FiShoppingCart, FiDollarSign, FiTrendingUp, FiDownload, FiBarChart2, FiRefreshCw } from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { api } from '../utils/api';
import { formatPrice, formatDate, getStatusColor } from "../utils/helpers";
import { constructImageUrl } from '../utils/imageUtils';
import MLAnalytics from '../components/MLAnalytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('line');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [view, setView] = useState('overview'); // 'overview' or 'ml'

  useEffect(() => {
    loadAnalytics();

    // Set up real-time polling every 60 seconds
    const intervalId = setInterval(() => {
      loadAnalytics();
    }, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await api.getAnalytics();
      const normalized = data && typeof data === 'object' && 'data' in data ? data.data : data;
      setAnalytics(normalized);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('AdminDashboard: Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Local tiny fallback image to avoid external placeholder DNS failures
  const createFallbackImage = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 50;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, 50, 50);
      ctx.strokeStyle = '#d1d5db';
      ctx.strokeRect(0, 0, 50, 50);
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 10px Inter, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Product', 25, 25);
      return canvas.toDataURL();
    } catch {
      return 'data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
    }
  };

  // Prepare safe chart datasets
  const salesByMonth = Array.isArray(analytics?.salesByMonth)
    ? analytics.salesByMonth.map(item => ({
      month: item.month || '',
      sales: Number(item.sales || 0),
      orders: Number(item.orders || 0),
      growth: Number(item.growth || 0)
    }))
    : [];

  const salesByCategory = Array.isArray(analytics?.salesByCategory)
    ? analytics.salesByCategory.map(item => ({
      name: item.name || 'Unknown',
      value: Number(item.value != null ? item.value : item.sales || 0),
      sales: Number(item.sales || 0),
      orders: Number(item.orders || 0),
      percentage: Number(item.percentage || 0)
    }))
    : [];

  const downloadExcelReport = () => {
    try {
      const workbook = XLSX.utils.book_new();

      const summaryData = [
        ['Analytics Report - Generated on', new Date().toISOString()],
        [''],
        ['Summary Statistics'],
        ['Metric', 'Value'],
        ['Total Products', analytics?.totalProducts || 0],
        ['Total Orders', analytics?.totalOrders || 0],
        ['Total Users', analytics?.totalUsers || 0],
        ['Total Revenue', analytics?.totalRevenue || 0],
        ['Average Order Value', analytics?.totalRevenue && analytics?.totalOrders
          ? (analytics.totalRevenue / analytics.totalOrders).toFixed(2)
          : 0
        ],
        ['Products per User', analytics?.totalProducts && analytics?.totalUsers
          ? (analytics.totalProducts / analytics.totalUsers).toFixed(2)
          : 0
        ]
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      if (analytics?.salesByMonth && analytics.salesByMonth.length > 0) {
        const salesData = analytics.salesByMonth.map(item => ({
          'Month': item.month,
          'Sales (₹)': item.sales,
          'Orders': item.orders || 0,
          'Growth (%)': item.growth || 0
        }));
        const salesSheet = XLSX.utils.json_to_sheet(salesData);
        XLSX.utils.book_append_sheet(workbook, salesSheet, 'Monthly Sales');
      }

      if (analytics?.recentOrders && analytics.recentOrders.length > 0) {
        const ordersData = analytics.recentOrders.map(order => ({
          'Order ID': order.id,
          'Customer Name': order.userName,
          'Customer Email': order.userEmail || 'N/A',
          'Order Date': formatDate(order.date),
          'Total Amount (₹)': order.total,
          'Status': order.status,
          'Items Count': order.itemsCount || 'N/A',
          'Payment Method': order.paymentMethod || 'N/A'
        }));
        const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
        XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Recent Orders');
      }

      if (analytics?.topProducts && analytics.topProducts.length > 0) {
        const productsData = analytics.topProducts.map((product, index) => ({
          'Rank': index + 1,
          'Product ID': product.id,
          'Product Name': product.name,
          'Price (₹)': product.price,
          'Rating': product.rating,
          'Total Sales': product.totalSales || 'N/A',
          'Stock Quantity': product.stock || 'N/A',
          'Category': product.category || 'N/A'
        }));
        const productsSheet = XLSX.utils.json_to_sheet(productsData);
        XLSX.utils.book_append_sheet(workbook, productsSheet, 'Top Products');
      }

      if (analytics?.salesByCategory && analytics.salesByCategory.length > 0) {
        const categoryData = analytics.salesByCategory.map(category => ({
          'Category': category.name,
          'Sales (₹)': category.sales,
          'Percentage (%)': category.percentage,
          'Orders': category.orders || 0
        }));
        const categorySheet = XLSX.utils.json_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(workbook, categorySheet, 'Sales by Category');
      }

      if (analytics?.userStats && analytics.userStats.length > 0) {
        const usersData = analytics.userStats.map(user => ({
          'User ID': user.id,
          'Name': user.name,
          'Email': user.email,
          'Role': user.role || 'user',
          'Join Date': formatDate(user.joinDate),
          'Total Orders': user.totalOrders || 0,
          'Total Spent (₹)': user.totalSpent || 0,
          'Status': user.status || 'Active'
        }));
        const usersSheet = XLSX.utils.json_to_sheet(usersData);
        XLSX.utils.book_append_sheet(workbook, usersSheet, 'Top Users');
      }

      // Add user metrics summary
      if (analytics?.userMetrics) {
        const userMetricsData = [
          ['User Metrics Summary'],
          [''],
          ['Metric', 'Value'],
          ['Total Users', analytics.totalUsers || 0],
          ['Admin Users', analytics.userMetrics.adminCount || 0],
          ['Regular Users', analytics.userMetrics.regularUserCount || 0],
          ['New Users This Month', analytics.userMetrics.newUsersThisMonth || 0],
          ['Average Orders Per User', analytics.userMetrics.averageOrdersPerUser || 0]
        ];
        const userMetricsSheet = XLSX.utils.aoa_to_sheet(userMetricsData);
        XLSX.utils.book_append_sheet(workbook, userMetricsSheet, 'User Metrics');
      }

      const fileName = `admin-analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      alert('Analytics report downloaded successfully!');
    } catch (error) {
      console.error('Error generating Excel report:', error);
      alert('Error generating report. Please try again.');
    }
  };

  const downloadSalesDataCSV = () => {
    try {
      if (!analytics?.salesByMonth || analytics.salesByMonth.length === 0) {
        alert('No sales data available to download.');
        return;
      }

      const csvContent = [
        ['Month', 'Sales (₹)', 'Orders', 'Growth (%)'],
        ...analytics.salesByMonth.map(item => [
          item.month,
          item.sales,
          item.orders || 0,
          item.growth || 0
        ])
      ];

      const csvString = csvContent.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Error downloading CSV. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid var(--border-light)',
          borderTop: '4px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1rem',
          fontWeight: '500',
        }}>Loading dashboard data...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: '12px',
          padding: '2rem',
          border: '1px solid var(--border-light)',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'var(--bg-secondary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            border: '2px solid var(--primary)',
          }}>
            <FiBarChart2 size={28} color="var(--primary)" />
          </div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '0.75rem',
          }}>Unable to load analytics data</h3>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
            lineHeight: '1.5',
          }}>
            We encountered an issue while loading your dashboard data.
            Please check your connection and try again.
          </p>
          <button
            onClick={loadAnalytics}
            className="btn btn-primary"
            style={{
              padding: '0.625rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <FiRefreshCw size={18} className="refresh-icon" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <div style={{
          display: 'flex',
          background: 'var(--bg-secondary)',
          padding: '0.25rem',
          borderRadius: '12px',
          border: '1px solid var(--border-light)'
        }}>
          <button
            onClick={() => setView('overview')}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              background: view === 'overview' ? 'var(--primary)' : 'transparent',
              color: view === 'overview' ? 'white' : 'var(--text-secondary)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            General Overview
          </button>
          <button
            onClick={() => setView('ml')}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              background: view === 'ml' ? 'var(--primary)' : 'transparent',
              color: view === 'ml' ? 'white' : 'var(--text-secondary)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FiTrendingUp />
            ML-Powered Insights
          </button>
        </div>
      </div>

      {view === 'overview' ? (
        <>
          {/* Overview Stats */}
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <FiPackage size={32} color="var(--primary)" />
              </div>
              <span className="stat-number">{analytics.totalProducts || 0}</span>
              <span className="stat-label">Total Products</span>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <FiShoppingCart size={32} color="var(--success)" />
              </div>
              <span className="stat-number">{analytics.totalOrders || 0}</span>
              <span className="stat-label">Total Orders</span>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <FiUsers size={32} color="var(--danger)" />
              </div>
              <span className="stat-number">{analytics.totalUsers || 0}</span>
              <span className="stat-label">Total Users</span>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <FiDollarSign size={32} color="var(--accent)" />
              </div>
              <span className="stat-number">{formatPrice(analytics.totalRevenue || 0)}</span>
              <span className="stat-label">Total Revenue</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Quick Actions</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={downloadExcelReport}
                    className="btn btn-sm btn-success"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <FiDownload size={16} />
                    Download Report
                  </button>
                  <button
                    onClick={loadAnalytics}
                    className="btn btn-sm btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <FiRefreshCw size={16} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-3" style={{ gap: '1.5rem' }}>
                <Link to="/admin/products" className="btn btn-primary" style={{
                  padding: '2rem 1rem',
                  flexDirection: 'column',
                  height: 'auto',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease'
                }}>
                  <FiPackage size={32} style={{ marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Manage Products</span>
                </Link>

                <Link to="/admin/orders" className="btn btn-secondary" style={{
                  padding: '2rem 1rem',
                  flexDirection: 'column',
                  height: 'auto',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease'
                }}>
                  <FiShoppingCart size={32} style={{ marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Manage Orders</span>
                </Link>

                <Link to="/admin/users" className="btn btn-success" style={{
                  padding: '2rem 1rem',
                  flexDirection: 'column',
                  height: 'auto',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease'
                }}>
                  <FiUsers size={32} style={{ marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Manage Users</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
            {/* Sales Chart */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Sales Analysis</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setChartType('line')}
                      className={`btn btn-sm ${chartType === 'line' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Line
                    </button>
                    <button
                      onClick={() => setChartType('bar')}
                      className={`btn btn-sm ${chartType === 'bar' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Bar
                    </button>
                    <button onClick={downloadSalesDataCSV} className="btn btn-sm btn-success">
                      <FiDownload />
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {salesByMonth.length > 0 ? (
                  <div style={{
                    height: '300px',
                    width: '100%',
                    position: 'relative',
                  }}>
                    {chartType === 'line' ? (
                      <Line
                        data={{
                          labels: salesByMonth.map(item => item.month),
                          datasets: [
                            {
                              label: 'Sales Revenue',
                              data: salesByMonth.map(item => item.sales),
                              borderColor: 'var(--primary)',
                              backgroundColor: 'rgba(30, 58, 138, 0.1)',
                              tension: 0.1,
                              fill: true,
                            },
                            salesByMonth[0] && salesByMonth[0].orders !== undefined ? {
                              label: 'Total Orders',
                              data: salesByMonth.map(item => item.orders),
                              borderColor: '#10b981',  // Emerald-500 (secondary)
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              tension: 0.1,
                              fill: true,
                            } : null,
                          ].filter(Boolean),
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            tooltip: {
                              callbacks: {
                                label: function (context) {
                                  let label = context.dataset.label || '';
                                  if (label) {
                                    label += ': ';
                                  }
                                  if (context.datasetIndex === 0) {
                                    label += formatPrice(context.parsed.y);
                                  } else {
                                    label += context.parsed.y;
                                  }
                                  return label;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                            }
                          }
                        }}
                      />
                    ) : (
                      <Bar
                        data={{
                          labels: salesByMonth.map(item => item.month),
                          datasets: [
                            {
                              label: 'Sales Revenue',
                              data: salesByMonth.map(item => item.sales),
                              backgroundColor: 'var(--primary)',
                              borderColor: 'var(--primary)',
                              borderWidth: 1,
                            },
                            salesByMonth[0] && salesByMonth[0].orders !== undefined ? {
                              label: 'Total Orders',
                              data: salesByMonth.map(item => item.orders),
                              backgroundColor: '#10b981',  // Emerald-500 (secondary)
                              borderColor: '#10b981',
                              borderWidth: 1,
                            } : null,
                          ].filter(Boolean),
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            tooltip: {
                              callbacks: {
                                label: function (context) {
                                  let label = context.dataset.label || '';
                                  if (label) {
                                    label += ': ';
                                  }
                                  if (context.datasetIndex === 0) {
                                    label += formatPrice(context.parsed.y);
                                  } else {
                                    label += context.parsed.y;
                                  }
                                  return label;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                            }
                          }
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-center" style={{ padding: '2rem 0' }}>
                    <FiTrendingUp size={48} color="var(--gray-400)" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--gray-500)' }}>
                      No sales data available for charting. Data will appear here once available.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="card">
              <div className="card-header">
                <h3>Sales by Category</h3>
              </div>
              <div className="card-body">
                {salesByCategory.length > 0 ? (
                  <div style={{
                    height: '300px',
                    width: '100%',
                    position: 'relative',
                  }}>
                    <Pie
                      data={{
                        labels: salesByCategory.map(item => `${item.name} (${item.percentage}%)`),
                        datasets: [
                          {
                            data: salesByCategory.map(item => item.value),
                            backgroundColor: [
                              '#1e3a8a',  // var(--primary)
                              '#3b82f6',  // var(--primary-light)
                              '#60a5fa',  // Sky-400
                              '#93c5fd',  // var(--primary-lighter)
                              '#2563eb',  // Blue-600
                              '#1d4ed8',  // Blue-700
                            ],
                            borderColor: '#ffffff',  // White borders for clean separation
                            borderWidth: 3,
                            hoverOffset: 8,  // Modern hover effect
                            hoverBorderWidth: 4,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                            labels: {
                              boxWidth: 15,
                              padding: 12,
                              font: {
                                size: 13,
                                family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                                weight: '500',
                              },
                              color: '#1e293b',
                              usePointStyle: true,
                              pointStyle: 'circle',
                            }
                          },
                          tooltip: {
                            backgroundColor: '#1e293b',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#475569',
                            borderWidth: 1,
                            padding: 12,
                            displayColors: true,
                            boxWidth: 12,
                            boxHeight: 12,
                            boxPadding: 6,
                            usePointStyle: true,
                            callbacks: {
                              label: function (context) {
                                const label = context.label || '';
                                const value = formatPrice(context.parsed);
                                return ` ${label}: ${value}`;
                              }
                            }
                          }
                        },
                        animation: {
                          animateRotate: true,
                          animateScale: true,
                          duration: 1000,
                          easing: 'easeInOutQuart',
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center" style={{ padding: '2rem 0' }}>
                    <FiBarChart2 size={48} color="var(--gray-400)" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--gray-500)' }}>
                      No category data available. Data will appear here once available.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: '2rem' }}>
            {/* Recent Orders */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Recent Orders</h3>
                  <Link to="/admin/orders" className="btn btn-sm btn-secondary">
                    View All
                  </Link>
                </div>
              </div>
              <div className="card-body">
                {!analytics.recentOrders || analytics.recentOrders.length === 0 ? (
                  <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '2rem 0' }}>
                    No recent orders
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {analytics.recentOrders.map((order) => (
                      <div
                        key={order.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1rem',
                          backgroundColor: 'var(--gray-50)',
                          borderRadius: 'var(--border-radius)'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                            Order #{order.id}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                            {order.userName} • {formatDate(order.date)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                            {formatPrice(order.total)}
                          </div>
                          <span className={`badge badge-${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Products */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Top Rated Products</h3>
                  <Link to="/admin/products" className="btn btn-sm btn-secondary">
                    View All
                  </Link>
                </div>
              </div>
              <div className="card-body">
                {!analytics.topProducts || analytics.topProducts.length === 0 ? (
                  <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '2rem 0' }}>
                    No products found
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {analytics.topProducts.map((product, index) => (
                      <div
                        key={product.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem',
                          backgroundColor: 'var(--gray-50)',
                          borderRadius: 'var(--border-radius)'
                        }}
                      >
                        <div
                          style={{
                            width: '30px',
                            height: '30px',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}
                        >
                          {index + 1}
                        </div>
                        <img
                          src={constructImageUrl(product.image)}
                          alt={product.name}
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                            borderRadius: 'var(--border-radius)'
                          }}
                          onError={(e) => {
                            if (!e.target.src.startsWith('data:')) {
                              e.target.src = createFallbackImage();
                            }
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                            {product.name}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                            {formatPrice(product.price)} • ⭐ {product.rating}
                            {product.totalSales && (
                              <span> • {product.totalSales} sold</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Statistics Section */}
          {analytics.userStats && analytics.userStats.length > 0 && (
            <div className="card" style={{ marginTop: '2rem' }}>
              <div className="card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Top Users by Spending</h3>
                  <Link to="/admin/users" className="btn btn-sm btn-secondary">
                    View All Users
                  </Link>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {analytics.userStats.slice(0, 5).map((user, index) => (
                    <div
                      key={user.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        backgroundColor: 'var(--gray-50)',
                        borderRadius: 'var(--border-radius)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div
                          style={{
                            width: '30px',
                            height: '30px',
                            backgroundColor: user.role === 'admin' ? 'var(--danger)' : 'var(--primary)',
                            color: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                            {user.name}
                            {user.role === 'admin' && (
                              <span className="badge badge-danger" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                                Admin
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                          {formatPrice(user.totalSpent || 0)}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                          {user.totalOrders || 0} orders
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <MLAnalytics />
      )}
    </div>
  );
};

export default AdminDashboard;
