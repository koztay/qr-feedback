'use client';

import React from 'react';
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
} from '@mui/material';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

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
}

const fetchMunicipalities = async () => {
  const response = await api.get('/municipalities');
  return response.data.data;
};

export default function MunicipalitiesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: municipalities, error } = useSWR<Municipality[]>('municipalities', fetchMunicipalities);

  // Check if user has access to municipalities page
  if (user?.role === 'MUNICIPALITY_ADMIN' && user.municipalityId !== municipalities?.[0]?.id) {
    router.push('/');
    return null;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Failed to load municipalities</Alert>
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
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Municipalities
        </Typography>
        {user?.role === 'ADMIN' && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/municipalities/new')}
          >
            Add Municipality
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>City</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Contact Email</TableCell>
              <TableCell>Subscription Status</TableCell>
              <TableCell>Users</TableCell>
              <TableCell>Feedback</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {municipalities.map((municipality) => (
              <TableRow key={municipality.id}>
                <TableCell>{municipality.name}</TableCell>
                <TableCell>{municipality.city}</TableCell>
                <TableCell>{municipality.state}</TableCell>
                <TableCell>{municipality.country}</TableCell>
                <TableCell>{municipality.contactEmail}</TableCell>
                <TableCell>{municipality.subscriptionStatus}</TableCell>
                <TableCell>{municipality._count?.users || 0}</TableCell>
                <TableCell>{municipality._count?.feedback || 0}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => router.push(`/?municipalityId=${municipality.id}`)}
                    >
                      View Dashboard
                    </Button>
                    {user?.role === 'ADMIN' && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => router.push(`/municipalities/${municipality.id}`)}
                      >
                        Edit
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
} 