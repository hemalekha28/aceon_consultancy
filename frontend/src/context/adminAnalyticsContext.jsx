import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../utils/api';

const AdminAnalyticsContext = createContext(null);

export const useAdminAnalytics = () => {
  const context = useContext(AdminAnalyticsContext);
  if (!context) {
    throw new Error('useAdminAnalytics must be used within an AdminAnalyticsProvider');
  }
  return context;
};

export const AdminAnalyticsProvider = ({ children }) => {
  const [analytics, setAnalytics] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [demandForecast, setDemandForecast] = useState(null);
  const [sleepAnalytics, setSleepAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refreshAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsData, predictionData, demandData, sleepData] = await Promise.all([
        api.getAnalytics(),
        api.getSalesPrediction(),
        api.getDemandForecast(),
        api.getSleepAnalytics()
      ]);

      const normalizedAnalytics =
        analyticsData && typeof analyticsData === 'object' && 'data' in analyticsData
          ? analyticsData.data
          : analyticsData;

      setAnalytics(normalizedAnalytics);
      setPrediction(predictionData?.data ?? predictionData ?? null);
      setDemandForecast(demandData?.data ?? demandData ?? null);
      setSleepAnalytics(sleepData?.data ?? sleepData ?? null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('AdminAnalyticsContext: Error loading analytics:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAnalytics();

    const intervalId = setInterval(() => {
      refreshAnalytics();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [refreshAnalytics]);

  const value = {
    analytics,
    prediction,
    demandForecast,
    sleepAnalytics,
    loading,
    error,
    lastUpdated,
    refreshAnalytics,
  };

  return (
    <AdminAnalyticsContext.Provider value={value}>
      {children}
    </AdminAnalyticsContext.Provider>
  );
};
