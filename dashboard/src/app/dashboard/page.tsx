'use client';

import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  CircularProgress,
  Button,
} from '@mui/material';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import api from '@/lib/api';
import AppLayout from '@/components/AppLayout';

interface Municipality {
  id: string;
  name: string;
  city: string;
  _count?: {
    feedback: number;
  };
}

const fetchMunicipalities = async () => {
  const response = await api.get('/municipalities');
  return response.data.data || response.data;
};

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const { data: municipalities, error, isLoading } = useSWR<Municipality[]>('/municipalities', fetchMunicipalities, {
    dedupingInterval: 10000 // Cache the data for 10 seconds
  });

  // Redirect municipality admins to their specific dashboard
  React.useEffect(() => {
    if (user?.role === 'MUNICIPALITY_ADMIN' && user.municipalityId) {
      router.push(`/dashboard/${user.municipalityId}`);
    }
  }, [user, router]);

  if (error) {
    return (
      <AppLayout>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography color="error">{t('error_loading_municipalities', 'municipalities')}</Typography>
        </Container>
      </AppLayout>
    );
  }

  if (isLoading) {
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

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('admin_dashboard', 'dashboard')}
        </Typography>

        <Grid container spacing={3}>
          {municipalities?.map((municipality) => (
            <Grid item xs={12} md={4} key={municipality.id}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {municipality.name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {municipality.city}
                </Typography>
                <Typography gutterBottom>
                  {t('total_feedback', 'dashboard')}: {municipality._count?.feedback || 0}
                </Typography>
                <Box sx={{ mt: 'auto', pt: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => router.push(`/dashboard/${municipality.id}`)}
                  >
                    {t('view_details', 'common')}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </AppLayout>
  );
} 