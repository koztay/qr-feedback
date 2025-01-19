'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useTranslation } from '@/contexts/TranslationContext';
import AppLayout from '@/components/AppLayout';

interface Municipality {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  contactEmail: string;
  subscriptionStatus: string;
  _count?: {
    users: number;
    feedback: number;
  };
  qrCodeCount?: number;
}

interface MunicipalityFormData {
  name: string;
  city: string;
}

const fetchMunicipalities = async () => {
  const response = await api.get('/municipalities');
  return response.data.data;
};

export default function MunicipalitiesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<MunicipalityFormData>({
    name: '',
    city: ''
  });
  const { t } = useTranslation();

  const { data: municipalities, error, isLoading } = useSWR<Municipality[]>('/municipalities', fetchMunicipalities);

  const handleSubmit = async () => {
    try {
      if (selectedMunicipality) {
        await api.patch(`/municipalities/${selectedMunicipality.id}`, formData);
        alert(t('municipality_updated', 'municipalities'));
      } else {
        await api.post('/municipalities', formData);
        alert(t('municipality_added', 'municipalities'));
      }
      setDialogOpen(false);
      mutate('/municipalities');
    } catch (error) {
      console.error('Error submitting municipality:', error);
      alert(selectedMunicipality 
        ? t('error_updating_municipality', 'municipalities')
        : t('error_adding_municipality', 'municipalities')
      );
    }
  };

  useEffect(() => {
    if (selectedMunicipality) {
      setFormData({
        name: selectedMunicipality.name,
        city: selectedMunicipality.city
      });
    } else {
      setFormData({
        name: '',
        city: ''
      });
    }
  }, [selectedMunicipality]);

  useEffect(() => {
    // Check if user has access to municipalities page
    if (user?.role === 'MUNICIPALITY_ADMIN' && municipalities && user.municipalityId !== municipalities[0]?.id) {
      router.push('/');
    }
  }, [user, municipalities, router]);

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error">{t('error_loading_municipalities', 'municipalities')}</Typography>
      </Container>
    );
  }

  if (!municipalities) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4" component="h1">
            {t('municipalities_management', 'municipalities')}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setSelectedMunicipality(null);
              setDialogOpen(true);
            }}
          >
            {t('add_municipality', 'municipalities')}
          </Button>
        </Box>

        <TableContainer component={Paper}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>{t('loading', 'common')}</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('municipality_name', 'municipalities')}</TableCell>
                  <TableCell>{t('city', 'municipalities')}</TableCell>
                  <TableCell>{t('qr_code_count', 'municipalities')}</TableCell>
                  <TableCell>{t('actions', 'common')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {municipalities?.map((municipality) => (
                  <TableRow key={municipality.id}>
                    <TableCell>{municipality.name}</TableCell>
                    <TableCell>{municipality.city}</TableCell>
                    <TableCell>{municipality.qrCodeCount || 0}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedMunicipality(municipality);
                          setDialogOpen(true);
                        }}
                      >
                        {t('edit', 'common')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Municipality Form Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedMunicipality ? t('edit_municipality', 'municipalities') : t('add_municipality', 'municipalities')}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={t('municipality_name', 'municipalities')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label={t('city', 'municipalities')}
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>{t('cancel', 'common')}</Button>
            <Button variant="contained" onClick={handleSubmit}>{t('submit', 'common')}</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AppLayout>
  );
} 