import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';
import { useTranslation, SUPPORTED_LANGUAGES } from '@/TranslationContext';
import { User, Role } from '@/types/user';
import api from '@/lib/api';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (user: Partial<User>) => void;
  user?: User;
  municipalities: Array<{ id: string; name: string }>;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  municipalityId: string;
  language: string;
}

export default function UserForm({ open, onClose, onSubmit, user, municipalities }: UserFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
    municipalityId: '',
    language: 'TR'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        confirmPassword: '',
        role: user.role,
        municipalityId: user.municipalityId || '',
        language: user.language
      });
    }
  }, [user]);

  const handleTextChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSelectChange = (field: keyof FormData) => (event: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = t('name_required', 'users');
    }
    if (!formData.email) {
      newErrors.email = t('email_required', 'users');
    }
    if (!user && !formData.password) {
      newErrors.password = t('password_required', 'users');
    }
    if (!user && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwords_dont_match', 'users');
    }
    if (formData.role === 'MUNICIPALITY_ADMIN' && !formData.municipalityId) {
      newErrors.municipalityId = t('municipality_required', 'users');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const userData: Partial<User> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        municipalityId: formData.municipalityId || undefined,
        language: formData.language as 'TR' | 'EN'
      };

      if (!user && formData.password) {
        Object.assign(userData, { password: formData.password });
      }

      onSubmit(userData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {user ? t('edit_user', 'users') : t('add_user', 'users')}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label={t('name', 'users')}
          value={formData.name}
          onChange={handleTextChange('name')}
          error={!!errors.name}
          helperText={errors.name}
          margin="normal"
        />
        <TextField
          fullWidth
          label={t('email', 'users')}
          value={formData.email}
          onChange={handleTextChange('email')}
          error={!!errors.email}
          helperText={errors.email}
          margin="normal"
        />
        {!user && (
          <>
            <TextField
              fullWidth
              type="password"
              label={t('password', 'users')}
              value={formData.password}
              onChange={handleTextChange('password')}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
            />
            <TextField
              fullWidth
              type="password"
              label={t('confirm_password', 'users')}
              value={formData.confirmPassword}
              onChange={handleTextChange('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              margin="normal"
            />
          </>
        )}
        <FormControl fullWidth margin="normal">
          <InputLabel>{t('role', 'users')}</InputLabel>
          <Select
            value={formData.role}
            onChange={handleSelectChange('role')}
            label={t('role', 'users')}
          >
            <MenuItem value="ADMIN">{t('ADMIN', 'user_roles')}</MenuItem>
            <MenuItem value="MUNICIPALITY_ADMIN">{t('MUNICIPALITY_ADMIN', 'user_roles')}</MenuItem>
            <MenuItem value="USER">{t('USER', 'user_roles')}</MenuItem>
          </Select>
        </FormControl>

        {formData.role === 'MUNICIPALITY_ADMIN' && (
          <FormControl fullWidth margin="normal" error={!!errors.municipalityId}>
            <InputLabel>{t('select_municipality', 'users')}</InputLabel>
            <Select
              value={formData.municipalityId}
              onChange={handleSelectChange('municipalityId')}
              label={t('select_municipality', 'users')}
            >
              {municipalities.map(municipality => (
                <MenuItem key={municipality.id} value={municipality.id}>
                  {municipality.name}
                </MenuItem>
              ))}
            </Select>
            {errors.municipalityId && (
              <FormHelperText>{errors.municipalityId}</FormHelperText>
            )}
          </FormControl>
        )}

        <FormControl fullWidth margin="normal">
          <InputLabel>{t('language', 'users')}</InputLabel>
          <Select
            value={formData.language}
            onChange={handleSelectChange('language')}
            label={t('language', 'users')}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <MenuItem key={lang.code} value={lang.code}>
                {lang.nativeName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {t('cancel', 'common')}
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {user ? t('save', 'common') : t('add', 'common')}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 