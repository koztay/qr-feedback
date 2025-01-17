'use client';

import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import api from '@/lib/api';

interface DashboardStats {
  totalFeedback: number;
  openIssues: number;
  resolvedIssues: number;
  averageResolutionTime: number;
  feedbackByCategory: Record<string, number>;
  statusDistribution: Record<string, number>;
}

interface Municipality {
  id: string;
  name: string;
  city: string;
}

const fetchDashboardStats = async (municipalityId: string) => {
  const response = await api.get(`/analytics/municipalities/${municipalityId}/statistics`);
  return response.data;
};

const fetchMunicipality = async (municipalityId: string) => {
  const response = await api.get(`/municipalities/${municipalityId}`);
  return response.data;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const municipalityId = searchParams.get('municipalityId') || user?.municipalityId;

  const { data: stats, error: statsError } = useSWR<DashboardStats>(
    municipalityId ? ['dashboardStats', municipalityId] : null,
    () => fetchDashboardStats(municipalityId!)
  );

  const { data: municipality, error: municipalityError } = useSWR<Municipality>(
    municipalityId ? ['municipality', municipalityId] : null,
    () => fetchMunicipality(municipalityId!)
  );

  if (!municipalityId) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">Please select a municipality to view its dashboard.</Alert>
      </Container>
    );
  }

  if (statsError || municipalityError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Failed to load dashboard data</Alert>
      </Container>
    );
  }

  if (!stats || !municipality) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {municipality.name} Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {municipality.city}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6">Total Feedback</Typography>
            <Typography variant="h4">{stats.totalFeedback || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6">Open Issues</Typography>
            <Typography variant="h4">{stats.openIssues || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6">Resolved Issues</Typography>
            <Typography variant="h4">{stats.resolvedIssues || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6">Avg. Resolution Time</Typography>
            <Typography variant="h4">{Math.round(stats.averageResolutionTime || 0)} days</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Feedback by Category</Typography>
            {stats.feedbackByCategory && Object.entries(stats.feedbackByCategory).map(([category, count]) => (
              <Box key={category} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>{category}</Typography>
                <Typography>{count}</Typography>
              </Box>
            ))}
            {(!stats.feedbackByCategory || Object.keys(stats.feedbackByCategory).length === 0) && (
              <Typography color="text.secondary">No feedback categories available</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Status Distribution</Typography>
            {stats.statusDistribution && Object.entries(stats.statusDistribution).map(([status, count]) => (
              <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>{status}</Typography>
                <Typography>{count}</Typography>
              </Box>
            ))}
            {(!stats.statusDistribution || Object.keys(stats.statusDistribution).length === 0) && (
              <Typography color="text.secondary">No status data available</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
