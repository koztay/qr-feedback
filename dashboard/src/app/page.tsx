'use client';

import React from 'react';
import { Box, Container, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import { BarChart as BarChartIcon, PieChart as PieChartIcon } from '@mui/icons-material';
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
import useSWR from 'swr';
import { getDashboardStats, DashboardStats } from '@/lib/api';
import { useAuth } from '@/lib/auth';

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

// TODO: Replace with actual municipality ID from auth context
const MUNICIPALITY_ID = '1';

export default function Home() {
  const { data: stats, error, isLoading } = useSWR<DashboardStats>(
    ['dashboard-stats', MUNICIPALITY_ID],
    () => getDashboardStats(MUNICIPALITY_ID)
  );
  const { user } = useAuth();

  const categoryChartData = {
    labels: stats?.feedbackByCategory.map(item => item.category) || [],
    datasets: [
      {
        label: 'Number of Feedback',
        data: stats?.feedbackByCategory.map(item => item.count) || [],
        backgroundColor: 'rgba(25, 118, 210, 0.5)',
        borderColor: 'rgba(25, 118, 210, 1)',
        borderWidth: 1,
      },
    ],
  };

  const statusChartData = {
    labels: stats?.statusDistribution.map(item => item.status) || [],
    datasets: [
      {
        data: stats?.statusDistribution.map(item => item.count) || [],
        backgroundColor: [
          'rgba(25, 118, 210, 0.5)',
          'rgba(220, 0, 78, 0.5)',
          'rgba(76, 175, 80, 0.5)',
        ],
        borderColor: [
          'rgba(25, 118, 210, 1)',
          'rgba(220, 0, 78, 1)',
          'rgba(76, 175, 80, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">Error loading dashboard data</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Municipality Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Feedback
            </Typography>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Typography component="p" variant="h4">
                {stats?.totalFeedback || 0}
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Open Issues
            </Typography>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Typography component="p" variant="h4">
                {stats?.openIssues || 0}
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Resolved Issues
            </Typography>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Typography component="p" variant="h4">
                {stats?.resolvedIssues || 0}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : stats?.feedbackByCategory.length ? (
              <Bar data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <BarChartIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No Category Data Available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : stats?.statusDistribution.length ? (
              <Pie data={statusChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <PieChartIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No Status Data Available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
