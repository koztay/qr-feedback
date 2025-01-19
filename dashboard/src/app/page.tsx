'use client';

import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from '@/contexts/TranslationContext';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  // Redirect municipality admins to their dashboard
  React.useEffect(() => {
    if (user?.role === 'MUNICIPALITY_ADMIN' && user.municipalityId) {
      router.push(`/dashboard/${user.municipalityId}`);
    }
  }, [user, router]);

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('app_name', 'common')}
        </Typography>
        
        <Grid container spacing={3}>
          {/* Welcome Message */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                {t('welcome', 'common')}, {user?.name}!
              </Typography>
              <Typography>
                {t('welcome_message', 'common')}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </AppLayout>
  );
}
