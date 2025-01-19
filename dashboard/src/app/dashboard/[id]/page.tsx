'use client';

import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { useTranslation } from '@/contexts/TranslationContext';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  totalFeedback: number;
  openIssues: number;
  resolvedIssues: number;
  statusDistribution: Record<string, number>;
  feedbackByCategory: Record<string, number>;
  averageResolutionTime: number;
  municipality: {
    name: string;
    city: string;
  };
}

const fetchDashboardStats = async (id: string) => {
  const response = await api.get(`/municipalities/${id}/statistics`);
  return response.data;
};

export default function MunicipalityDashboard() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { data: stats, error, isLoading } = useSWR<DashboardStats>(
    id ? `/municipalities/${id}/statistics` : null,
    () => fetchDashboardStats(id as string)
  );

  if (error) {
    return (
      <AppLayout>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">{t('error_loading_stats', 'dashboard')}</Alert>
        </Container>
      </AppLayout>
    );
  }

  if (isLoading || !stats) {
    return (
      <AppLayout>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        </Container>
      </AppLayout>
    );
  }

  // Prepare data for status distribution chart
  const statusChartData = {
    labels: Object.keys(stats.statusDistribution || {}).map(status => t(status, 'feedback_status')),
    datasets: [
      {
        data: Object.values(stats.statusDistribution || {}),
        backgroundColor: [
          '#1976d2', // PENDING - blue
          '#ed6c02', // IN_PROGRESS - orange
          '#2e7d32', // RESOLVED - green
          '#d32f2f', // REJECTED - red
        ],
      },
    ],
  };

  // Prepare data for category distribution chart
  const categoryChartData = {
    labels: Object.keys(stats.feedbackByCategory || {}).map(category => t(category, 'feedback_category')),
    datasets: [
      {
        label: t('feedback_count', 'dashboard'),
        data: Object.values(stats.feedbackByCategory || {}),
        backgroundColor: '#1976d2',
      },
    ],
  };

  // Add default values for stats
  const {
    totalFeedback = 0,
    openIssues = 0,
    resolvedIssues = 0,
    averageResolutionTime = 0,
    municipality = { name: '', city: '' }
  } = stats || {};

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {municipality.name} - {t('dashboard', 'navigation')}
        </Typography>
        
        <Grid container spacing={3}>
          {/* Total Feedback Card */}
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
              }}
            >
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                {t('total_feedback', 'dashboard')}
              </Typography>
              <Typography component="p" variant="h4">
                {totalFeedback}
              </Typography>
            </Paper>
          </Grid>
          
          {/* Open Issues Card */}
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
              }}
            >
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                {t('open_issues', 'dashboard')}
              </Typography>
              <Typography component="p" variant="h4">
                {openIssues}
              </Typography>
            </Paper>
          </Grid>
          
          {/* Resolved Issues Card */}
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
              }}
            >
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                {t('resolved_issues', 'dashboard')}
              </Typography>
              <Typography component="p" variant="h4">
                {resolvedIssues}
              </Typography>
            </Paper>
          </Grid>

          {/* Average Resolution Time Card */}
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
              }}
            >
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                {t('avg_resolution_time', 'dashboard')}
              </Typography>
              <Typography component="p" variant="h4">
                {averageResolutionTime.toFixed(1)} {t('days', 'common')}
              </Typography>
            </Paper>
          </Grid>

          {/* Status Distribution Chart */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 400,
              }}
            >
              <Typography variant="h6" gutterBottom>
                {t('status_distribution', 'dashboard')}
              </Typography>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {Object.keys(stats.statusDistribution || {}).length > 0 ? (
                  <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
                ) : (
                  <Typography color="text.secondary">{t('no_data', 'common')}</Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Category Distribution Chart */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 400,
              }}
            >
              <Typography variant="h6" gutterBottom>
                {t('feedback_by_category', 'dashboard')}
              </Typography>
              <Box sx={{ flex: 1 }}>
                {Object.keys(stats.feedbackByCategory || {}).length > 0 ? (
                  <Bar 
                    data={categoryChartData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1
                          }
                        }
                      }
                    }} 
                  />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography color="text.secondary">{t('no_data', 'common')}</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </AppLayout>
  );
} 