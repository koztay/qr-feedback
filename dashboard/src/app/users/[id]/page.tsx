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
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import { User, getUser, createUser, updateUser } from '@/lib/api';
import useSWR from 'swr';
import api from '@/lib/api';

interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: User['role'];
  municipalityId?: string | null;
}

interface Municipality {
  id: string;
  name: string;
}

const fetchMunicipalities = async () => {
  const response = await api.get('/municipalities');
  return response.data.data;
};

export default function UserForm() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === 'new';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'MUNICIPALITY_ADMIN',
    municipalityId: null,
  });

  const { data: municipalities } = useSWR<Municipality[]>('municipalities', fetchMunicipalities);

  useEffect(() => {
    if (!isNew) {
      fetchUser();
    }
  }, [id, isNew]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await getUser(id);
      setFormData({
        ...data,
        password: undefined,
        municipalityId: data.municipalityId || null,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to load user';
      setError(typeof errorMessage === 'string' ? errorMessage : 'Failed to load user');
      console.error('Error fetching user:', err.response?.data || err);
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
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Clean and validate the data
      const cleanedData: Partial<UserFormData> = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
      };

      if (formData.role === 'MUNICIPALITY_ADMIN' && formData.municipalityId) {
        cleanedData.municipalityId = formData.municipalityId;
      }

      // Add password only if it's provided
      if (formData.password) {
        cleanedData.password = formData.password;
      }

      // Validate required fields
      const requiredFields = ['name', 'email', 'role'] as const;
      for (const field of requiredFields) {
        if (!cleanedData[field]) {
          setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
          return;
        }
      }

      // Validate municipality for MUNICIPALITY_ADMIN role
      if (formData.role === 'MUNICIPALITY_ADMIN' && !formData.municipalityId) {
        setError('Municipality is required for Municipality Admin role');
        return;
      }

      if (isNew) {
        if (!cleanedData.password) {
          setError('Password is required for new users');
          return;
        }
        await createUser({
          name: cleanedData.name!,
          email: cleanedData.email!,
          password: cleanedData.password,
          role: cleanedData.role!,
          ...(cleanedData.municipalityId ? { municipalityId: cleanedData.municipalityId } : {}),
        });
      } else {
        // Prepare update data without null values
        const updateData: Partial<Omit<UserFormData, 'municipalityId'>> & { municipalityId?: string } = {
          name: cleanedData.name,
          email: cleanedData.email,
          role: cleanedData.role,
        };
        
        if (cleanedData.password) {
          updateData.password = cleanedData.password;
        }
        
        if (cleanedData.municipalityId) {
          updateData.municipalityId = cleanedData.municipalityId;
        }
        
        await updateUser(id, updateData);
      }

      router.push('/users');
    } catch (err: any) {
      console.error('Error details:', err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to save user';
      setError(typeof errorMessage === 'string' ? errorMessage : 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name === 'role' && value !== 'MUNICIPALITY_ADMIN') {
      // Clear municipalityId when role is not MUNICIPALITY_ADMIN
      setFormData(prev => ({
        ...prev,
        [name]: value as User['role'],
        municipalityId: null,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
          {isNew ? 'Add User' : 'Edit User'}
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
            onChange={handleInputChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password || ''}
            onChange={handleInputChange}
            margin="normal"
            required={isNew}
            helperText={!isNew && "Leave blank to keep current password"}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              value={formData.role}
              label="Role"
              onChange={handleSelectChange}
            >
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="MUNICIPALITY_ADMIN">Municipality Admin</MenuItem>
              <MenuItem value="USER">User</MenuItem>
            </Select>
          </FormControl>

          {formData.role === 'MUNICIPALITY_ADMIN' && (
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="municipality-label">Municipality</InputLabel>
              <Select
                labelId="municipality-label"
                name="municipalityId"
                value={formData.municipalityId || ''}
                label="Municipality"
                onChange={handleSelectChange}
              >
                {municipalities?.map((municipality) => (
                  <MenuItem key={municipality.id} value={municipality.id}>
                    {municipality.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

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
              onClick={() => router.push('/users')}
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