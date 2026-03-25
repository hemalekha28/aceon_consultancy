import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiUsers, FiShoppingCart, FiDollarSign, FiTrendingUp, FiDownload, FiBarChart2, FiRefreshCw, FiTag } from 'react-icons/fi';
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
  Filler,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { formatPrice, formatDate, getStatusColor } from "../utils/helpers";
import { constructImageUrl } from '../utils/imageUtils';
import { useAdminAnalytics } from '../context/adminAnalyticsContext';

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
  Filler
);

const AdminDashboard = () => {
  const {
    analytics,
    prediction,
    demandForecast,
    sleepAnalytics,
    loading,
    lastUpdated,
    refreshAnalytics,
  } = useAdminAnalytics();
  const [chartType, setChartType] = useState('line');

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
            onClick={refreshAnalytics}
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
    <div style={{ 
      background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)',
      minHeight: '100vh',
      padding: '2rem 0'
    }}>
      <div style={{ padding: '0 2rem', width: '100%', maxWidth: '100%' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700', background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Admin Dashboard</h1>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card" style={{ background: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderLeft: '4px solid #0ea5e9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <FiPackage size={32} color="#0ea5e9" />
          </div>
          <span className="stat-number" style={{ color: '#0ea5e9' }}>{analytics.totalProducts || 0}</span>
          <span className="stat-label">Total Products</span>
        </div>

        <div className="stat-card" style={{ background: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <FiShoppingCart size={32} color="#06b6d4" />
          </div>
          <span className="stat-number" style={{ color: '#06b6d4' }}>{analytics.totalOrders || 0}</span>
          <span className="stat-label">Total Orders</span>
        </div>

        <div className="stat-card" style={{ background: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderLeft: '4px solid #14b8a6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <FiUsers size={32} color="#14b8a6" />
          </div>
          <span className="stat-number" style={{ color: '#14b8a6' }}>{analytics.totalUsers || 0}</span>
          <span className="stat-label">Total Users</span>
        </div>

        <div className="stat-card" style={{ background: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderLeft: '4px solid #36d1c4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <FiDollarSign size={32} color="#36d1c4" />
          </div>
          <span className="stat-number" style={{ color: '#36d1c4' }}>{formatPrice(analytics.totalRevenue || 0)}</span>
          <span className="stat-label" style={{ color: '#36d1c4' }}>Total Revenue</span>
        </div>
      </div>

      {/* Sales Prediction Summary */}
      {prediction && (
        <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
          <div className="card-body" style={{ padding: '1.5rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', opacity: 0.9 }}>
                  <FiTrendingUp />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Sales Forecast (Next Month)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{formatPrice(prediction.prediction.nextMonthRevenue)}</span>
                  <span style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: 700, 
                    color: prediction.prediction.growthPercentage >= 0 ? '#4ade80' : '#f87171',
                    background: 'rgba(255,255,255,0.1)',
                    padding: '4px 10px',
                    borderRadius: '20px'
                  }}>
                    {prediction.prediction.growthPercentage >= 0 ? '+' : ''}{prediction.prediction.growthPercentage}%
                  </span>
                </div>
                <p style={{ margin: '10px 0 0', opacity: 0.8, fontSize: '0.9rem' }}>
                  Based on historical trends, we expect <strong>{prediction.prediction.nextMonthOrders} orders</strong> next month.
                </p>
              </div>
              <Link to="/admin/analytics" className="btn" style={{ background: 'white', color: 'var(--primary)', fontWeight: 600 }}>
                View Full Analytics
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* Smart Demand & Sleep Insights Grid */}
      <div className="grid grid-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
        {/* Demand Prediction Card */}
        <div className="card">
          <div className="card-header" style={{ borderLeft: '4px solid #7C5CFC' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiTrendingUp color="#7C5CFC" /> Smart Demand Prediction
            </h3>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '1.25rem' }}>
              AI-driven unit forecast for next month based on historical category trends.
            </p>
            {!demandForecast ? (
              <p>Loading forecast...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {demandForecast.slice(0, 3).map((item, idx) => (
                  <div key={item.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--primary)' }}>
                        {idx + 1}. {item.category.replace('-', ' ')}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px' }}>
                        {item.predictedUnits} units
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: item.trend === 'Increasing' ? 'var(--success-dark)' : 'var(--text-tertiary)',
                        background: item.trend === 'Increasing' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.05)',
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}>
                        {item.trend} demand
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: '1.25rem', padding: '10px', background: 'rgba(124, 92, 252, 0.05)', borderRadius: '8px', border: '1px dashed rgba(124, 92, 252, 0.3)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                💡 <strong>Strategy:</strong> Prepare stock for high-demand items to avoid lost sales.
              </p>
            </div>
          </div>
        </div>

        {/* Customer Sleep Insights Card */}
        <div className="card">
          <div className="card-header" style={{ borderLeft: '4px solid #4FACFE' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiUsers color="#4FACFE" /> Customer Sleep Profile
            </h3>
          </div>
          <div className="card-body">
            {!sleepAnalytics ? (
              <p>Loading sleep profiles...</p>
            ) : (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>Sleeper Positons</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {sleepAnalytics.positions.map(pos => (
                      <div key={pos.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600 }}>{pos.label} Sleepers</span>
                          <span>{pos.percentage}%</span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                          <div style={{ height: '100%', background: '#4FACFE', borderRadius: '4px', width: `${pos.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Top Quiz Recommendation</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>{sleepAnalytics.topRecommendation}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: '2rem', background: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
        <div className="card-header" style={{ background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)', color: 'white', borderBottom: 'none', borderRadius: '12px 12px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: 'white', margin: 0 }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={downloadExcelReport}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s',
                  boxShadow: '0 2px 8px rgba(14, 165, 233, 0.2)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(14, 165, 233, 0.2)'; }}
              >
                <FiDownload size={16} />
                Download Report
              </button>
              <button
                onClick={refreshAnalytics}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: '#f0f9ff',
                  color: '#0ea5e9',
                  border: '2px solid #0ea5e9',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e0f2fe'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f0f9ff'; }}
              >
                <FiRefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-4" style={{ gap: '1.5rem' }}>
            <Link to="/admin/products" className="btn btn-primary" style={{
              padding: '2rem 1rem',
              flexDirection: 'column',
              height: 'auto',
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)',
              color: 'white',
              textDecoration: 'none',
              border: 'none',
              boxShadow: '0 4px 12px rgba(54, 209, 196, 0.3)',
              cursor: 'pointer',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(14, 165, 233, 0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)'; }}
            >
              <FiPackage size={32} style={{ marginBottom: '0.5rem', color: 'white' }} />
              <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Manage Products</span>
            </Link>

            <Link to="/admin/orders" style={{
              padding: '2rem 1rem',
              flexDirection: 'column',
              height: 'auto',
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)',
              color: 'white',
              textDecoration: 'none',
              border: 'none',
              boxShadow: '0 4px 12px rgba(54, 209, 196, 0.3)',
              cursor: 'pointer',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(6, 182, 212, 0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 182, 212, 0.3)'; }}
            >
              <FiShoppingCart size={32} style={{ marginBottom: '0.5rem', color: 'white' }} />
              <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Manage Orders</span>
            </Link>

            <Link to="/admin/users" style={{
              padding: '2rem 1rem',
              flexDirection: 'column',
              height: 'auto',
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)',
              color: 'white',
              textDecoration: 'none',
              border: 'none',
              boxShadow: '0 4px 12px rgba(54, 209, 196, 0.3)',
              cursor: 'pointer',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(20, 184, 166, 0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(20, 184, 166, 0.3)'; }}
            >
              <FiUsers size={32} style={{ marginBottom: '0.5rem', color: 'white' }} />
              <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Manage Users</span>
            </Link>

            <Link to="/admin/coupons" className="btn btn-primary" style={{
              padding: '2rem 1rem',
              flexDirection: 'column',
              height: 'auto',
              borderRadius: '16px',
              background: 'var(--accent)',
              borderColor: 'var(--accent)',
              transition: 'all 0.3s ease'
            }}>
              <FiTag size={32} style={{ marginBottom: '0.5rem' }} />
              <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Manage Coupons</span>
            </Link>

            <Link to="/admin/analytics" className="btn btn-info" style={{
              padding: '2rem 1rem',
              flexDirection: 'column',
              height: 'auto',
              borderRadius: '16px',
              background: '#0ea5e9',
              borderColor: '#0ea5e9',
              color: 'white',
              transition: 'all 0.3s ease'
            }}>
              <FiBarChart2 size={32} style={{ marginBottom: '0.5rem' }} />
              <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Sales analytics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
        {/* Sales Chart */}
        <div className="card" style={{ background: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)', color: 'white', borderBottom: 'none', borderRadius: '12px 12px 0 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'white', margin: 0 }}>Sales Analysis</h3>
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
                          borderColor: '#0ea5e9',
                          backgroundColor: 'rgba(14, 165, 233, 0.1)',
                          tension: 0.1,
                          fill: true,
                        },
                        salesByMonth[0] && salesByMonth[0].orders !== undefined ? {
                          label: 'Total Orders',
                          data: salesByMonth.map(item => item.orders),
                          borderColor: '#06b6d4',
                          backgroundColor: 'rgba(6, 182, 212, 0.1)',
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
                          backgroundColor: '#0ea5e9',
                          borderColor: '#0ea5e9',
                          borderWidth: 1,
                        },
                        salesByMonth[0] && salesByMonth[0].orders !== undefined ? {
                          label: 'Total Orders',
                          data: salesByMonth.map(item => item.orders),
                          backgroundColor: '#06b6d4',
                          borderColor: '#06b6d4',
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
        <div className="card" style={{ background: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)', color: 'white', borderBottom: 'none', borderRadius: '12px 12px 0 0' }}>
            <h3 style={{ color: 'white', margin: 0 }}>Sales by Category</h3>
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
                          '#0ea5e9',  // Sky blue
                          '#06b6d4',  // Cyan
                          '#14b8a6',  // Teal
                          '#0369a1',  // Sky blue darker
                          '#0891b2',  // Cyan darker
                          '#0d9488',  // Teal darker
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
        <div className="card" style={{ background: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)', color: 'white', borderBottom: 'none', borderRadius: '12px 12px 0 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'white', margin: 0 }}>Recent Orders</h3>
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

        {/* Top Selling Products */}
        <div className="card" style={{ background: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)', color: 'white', borderBottom: 'none', borderRadius: '12px 12px 0 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'white', margin: 0 }}>Top Selling Products</h3>
              <Link to="/admin/analytics" className="btn btn-sm btn-secondary">
                Analyze More
              </Link>
            </div>
          </div>
          <div className="card-body">
            {!analytics.bestSellers || analytics.bestSellers.length === 0 ? (
              <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '2rem 0' }}>
                No sales data yet
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {analytics.bestSellers.map((product, index) => (
                  <div
                    key={product._id}
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
                        backgroundColor: (index === 0) ? '#fbbf24' : (index === 1) ? '#94a3b8' : (index === 2) ? '#92400e' : 'var(--primary)',
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
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        {product.name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        Revenue: {formatPrice(product.revenue)} • <strong>{product.unitsSold} units sold</strong>
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
        <div className="card" style={{ marginTop: '2rem', background: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(90deg, #36d1c4 0%, #1e3c72 100%)', color: 'white', borderBottom: 'none', borderRadius: '12px 12px 0 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'white', margin: 0 }}>Top Users by Spending</h3>
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
      </div>
    </div>
  );
};

export default AdminDashboard;
