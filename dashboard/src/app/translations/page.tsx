'use client';

import React, { useState } from 'react';
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
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { useTranslation } from '@/contexts/TranslationContext';
import useSWR, { mutate } from 'swr';
import api from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

interface Translation {
  id: string;
  key: string;
  category: string;
  translations: {
    TR: string;
    EN: string;
  };
}

const fetchTranslations = async () => {
  const response = await api.get('/translations');
  return Array.isArray(response.data) ? response.data : response.data.data;
};

export default function TranslationsPage() {
  const { t } = useTranslation();
  const { data: translations, error, isLoading } = useSWR<Translation[]>('/translations', fetchTranslations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTranslations, setEditedTranslations] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = translations ? [...new Set(translations.map(t => t.category))].sort() : [];

  const handleEdit = (translation: Translation) => {
    setEditingId(translation.id);
    setEditedTranslations(translation.translations);
  };

  const handleSave = async (translation: Translation) => {
    try {
      await api.patch(`/translations/${translation.id}`, {
        translations: editedTranslations
      });
      setEditingId(null);
      mutate('/translations');
    } catch (error) {
      console.error('Error updating translation:', error);
    }
  };

  const filteredTranslations = translations?.filter(translation => {
    const matchesSearch = searchTerm === '' || 
      translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(translation.translations).some(text => 
        text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesCategory = selectedCategory === 'all' || translation.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (error) {
    return (
      <AppLayout>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography color="error">{t('error_loading_translations', 'translations')}</Typography>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('translations', 'navigation')}
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            label={t('search_translations', 'translations')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>{t('category', 'translations')}</InputLabel>
            <Select
              value={selectedCategory}
              label={t('category', 'translations')}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="all">{t('all_categories', 'translations')}</MenuItem>
              {categories.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
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
                  <TableCell>{t('key', 'translations')}</TableCell>
                  <TableCell>{t('category', 'translations')}</TableCell>
                  <TableCell>{t('turkish', 'translations')}</TableCell>
                  <TableCell>{t('english', 'translations')}</TableCell>
                  <TableCell>{t('actions', 'translations')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTranslations?.map((translation) => (
                  <TableRow key={translation.id}>
                    <TableCell>{translation.key}</TableCell>
                    <TableCell>{translation.category}</TableCell>
                    <TableCell>
                      {editingId === translation.id ? (
                        <TextField
                          fullWidth
                          value={editedTranslations.TR || ''}
                          onChange={(e) => setEditedTranslations({
                            ...editedTranslations,
                            TR: e.target.value
                          })}
                        />
                      ) : (
                        translation.translations.TR
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === translation.id ? (
                        <TextField
                          fullWidth
                          value={editedTranslations.EN || ''}
                          onChange={(e) => setEditedTranslations({
                            ...editedTranslations,
                            EN: e.target.value
                          })}
                        />
                      ) : (
                        translation.translations.EN
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === translation.id ? (
                        <>
                          <IconButton onClick={() => handleSave(translation)} color="primary">
                            <SaveIcon />
                          </IconButton>
                          <IconButton onClick={() => setEditingId(null)} color="error">
                            <CancelIcon />
                          </IconButton>
                        </>
                      ) : (
                        <IconButton onClick={() => handleEdit(translation)} color="primary">
                          <EditIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Container>
    </AppLayout>
  );
} 