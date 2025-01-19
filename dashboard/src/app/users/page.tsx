'use client';

import React, { useState, useEffect } from 'react';
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
  Box,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import useSWR, { mutate } from 'swr';
import api from '@/lib/api';
import { useTranslation } from '@/contexts/TranslationContext';
import AppLayout from '@/components/AppLayout';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MUNICIPALITY_ADMIN' | 'USER';
  municipalityId?: string;
}

interface Municipality {
  id: string;
  name: string;
}

interface UserFormData {
  name: string;
  email: string;
  role: User['role'];
  password: string;
  confirmPassword: string;
  municipalityId?: string;
}

const fetchUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

const fetchMunicipalities = async () => {
  const response = await api.get('/municipalities');
  return response.data;
};

export default function UsersPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'USER',
    password: '',
    confirmPassword: '',
  });

  const { data: users, error: usersError, isLoading: usersLoading } = useSWR<User[]>('/users', fetchUsers);
  const { data: municipalities } = useSWR<Municipality[]>('/municipalities', fetchMunicipalities);

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        password: '',
        confirmPassword: '',
        municipalityId: selectedUser.municipalityId
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'USER',
        password: '',
        confirmPassword: '',
        municipalityId: undefined
      });
    }
  }, [selectedUser]);

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert(t('passwords_dont_match', 'users'));
      return;
    }

    try {
      if (selectedUser) {
        await api.patch(`/users/${selectedUser.id}`, formData);
        alert(t('user_updated', 'users'));
      } else {
        await api.post('/users', formData);
        alert(t('user_added', 'users'));
      }
      setDialogOpen(false);
      mutate('/users');
    } catch (error) {
      console.error('Error submitting user:', error);
      alert(selectedUser 
        ? t('error_updating_user', 'users')
        : t('error_adding_user', 'users')
      );
    }
  };

  if (usersError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error">{t('error_loading_users', 'users')}</Typography>
      </Container>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4" component="h1">
            {t('users_management', 'users')}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setSelectedUser(null);
              setDialogOpen(true);
            }}
          >
            {t('add_user', 'users')}
          </Button>
        </Box>

        <TableContainer component={Paper}>
          {usersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>{t('loading', 'common')}</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('name', 'users')}</TableCell>
                  <TableCell>{t('email', 'users')}</TableCell>
                  <TableCell>{t('role', 'users')}</TableCell>
                  <TableCell>{t('municipality', 'users')}</TableCell>
                  <TableCell>{t('actions', 'common')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{t(user.role, 'user_roles')}</TableCell>
                    <TableCell>
                      {municipalities?.find(m => m.id === user.municipalityId)?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedUser(user);
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

        {/* User Form Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedUser ? t('edit_user', 'users') : t('add_user', 'users')}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={t('name', 'users')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label={t('email', 'users')}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('role', 'users')}</InputLabel>
                <Select
                  value={formData.role}
                  label={t('role', 'users')}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                >
                  <MenuItem value="ADMIN">{t('ADMIN', 'user_roles')}</MenuItem>
                  <MenuItem value="MUNICIPALITY_ADMIN">{t('MUNICIPALITY_ADMIN', 'user_roles')}</MenuItem>
                  <MenuItem value="USER">{t('USER', 'user_roles')}</MenuItem>
                </Select>
              </FormControl>
              {formData.role === 'MUNICIPALITY_ADMIN' && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>{t('select_municipality', 'users')}</InputLabel>
                  <Select
                    value={formData.municipalityId || ''}
                    label={t('select_municipality', 'users')}
                    onChange={(e) => setFormData({ ...formData, municipalityId: e.target.value })}
                  >
                    {municipalities?.map((municipality) => (
                      <MenuItem key={municipality.id} value={municipality.id}>
                        {municipality.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <TextField
                fullWidth
                label={t('password', 'users')}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label={t('confirm_password', 'users')}
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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