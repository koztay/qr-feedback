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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import useSWR from 'swr';
import api from '@/lib/api';

interface Municipality {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  contactEmail: string;
  subscriptionStatus: string;
  _count: {
    feedback: number;
    users: number;
  };
}

const fetchMunicipalities = async () => {
  const response = await api.get('/municipalities');
  return response.data.data;
};

export default function MunicipalitiesPage() {
  const { data: municipalities, error, isLoading } = useSWR<Municipality[]>('municipalities', fetchMunicipalities);

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error">Error loading municipalities</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Municipalities
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          href="/municipalities/new"
        >
          Add Municipality
        </Button>
      </Box>

      <TableContainer component={Paper}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>City</TableCell>
                <TableCell>State</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Contact Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Users</TableCell>
                <TableCell>Feedback</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {municipalities?.map((municipality) => (
                <TableRow key={municipality.id}>
                  <TableCell>{municipality.name}</TableCell>
                  <TableCell>{municipality.city}</TableCell>
                  <TableCell>{municipality.state}</TableCell>
                  <TableCell>{municipality.country}</TableCell>
                  <TableCell>{municipality.contactEmail}</TableCell>
                  <TableCell>{municipality.subscriptionStatus}</TableCell>
                  <TableCell>{municipality._count.users}</TableCell>
                  <TableCell>{municipality._count.feedback}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      href={`/municipalities/${municipality.id}`}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Container>
  );
} 