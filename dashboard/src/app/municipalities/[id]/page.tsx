'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  MenuItem,
} from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';

interface MunicipalityFormData {
  name: string;
  city: string;
  state: string;
  country: string;
  contactEmail: string;
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

export default function MunicipalityForm() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === 'new';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<MunicipalityFormData>({
    name: '',
    city: '',
    state: '',
    country: '',
    contactEmail: '',
    subscriptionStatus: 'PENDING',
  });

  useEffect(() => {
    if (!isNew) {
      fetchMunicipality();
    }
  }, [id, isNew]);

  const fetchMunicipality = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/municipalities/${id}`);
      setFormData(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to load municipality';
      setError(typeof errorMessage === 'string' ? errorMessage : 'Failed to load municipality');
      console.error('Error fetching municipality:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail)) {
        setError('Please enter a valid email address');
        return;
      }

      // Clean and validate the data
      const cleanedData = {
        name: formData.name.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        contactEmail: formData.contactEmail.trim().toLowerCase(),
        subscriptionStatus: formData.subscriptionStatus,
      };

      // Validate required fields
      const requiredFields = ['name', 'city', 'state', 'country', 'contactEmail'] as const;
      for (const field of requiredFields) {
        if (!cleanedData[field]) {
          setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
          return;
        }
      }

      if (isNew) {
        const response = await api.post('/municipalities', cleanedData);
        console.log('Create response:', response.data);
      } else {
        const response = await api.patch(`/municipalities/${id}`, cleanedData);
        console.log('Update response:', response.data);
      }

      router.push('/municipalities');
    } catch (err: any) {
      console.error('Error details:', err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to save municipality';
      setError(typeof errorMessage === 'string' ? errorMessage : 'Failed to save municipality');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading && !isNew) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {isNew ? 'Add Municipality' : 'Edit Municipality'}
        </Typography>

        {error && typeof error === 'string' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Contact Email"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            select
            label="Subscription Status"
            name="subscriptionStatus"
            value={formData.subscriptionStatus}
            onChange={handleChange}
            margin="normal"
            required
          >
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="INACTIVE">Inactive</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
          </TextField>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push('/municipalities')}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
} 