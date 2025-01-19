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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import useSWR, { mutate } from 'swr';
import api from '@/lib/api';
import { useTranslation } from '@/contexts/TranslationContext';
import AppLayout from '@/components/AppLayout';

interface Feedback {
  id: string;
  description: string;
  category: 'INFRASTRUCTURE' | 'SAFETY' | 'CLEANLINESS' | 'OTHER';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  address: string;
  images: string[];
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  municipality: {
    id: string;
    name: string;
  };
  comments: {
    id: string;
    comment: string;
    createdAt: string;
    user: {
      name: string;
    };
  }[];
}

const fetchFeedback = async (url: string) => {
  console.log('Fetching feedback from:', url);
  try {
    const response = await api.get(url);
    console.log('Feedback response:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }
};

const statusColors: Record<Feedback['status'], 'default' | 'warning' | 'success' | 'error'> = {
  PENDING: 'default',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
  REJECTED: 'error',
};

const categoryColors: Record<Feedback['category'], 'default' | 'primary' | 'secondary' | 'info' | 'error'> = {
  INFRASTRUCTURE: 'primary',
  SAFETY: 'error',
  CLEANLINESS: 'info',
  OTHER: 'default',
};

export default function FeedbackPage() {
  const { user } = useAuth();
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState<Feedback['status']>('PENDING');
  const [newCategory, setNewCategory] = useState<Feedback['category']>('INFRASTRUCTURE');
  const { t } = useTranslation();

  // Check if the user can update this specific feedback
  const canUpdateFeedback = (feedback: Feedback) => {
    if (user?.role === 'ADMIN') return true;
    if (user?.role === 'MUNICIPALITY_ADMIN') {
      return feedback.municipality.id === user.municipalityId;
    }
    return false;
  };

  // MUNICIPALITY_ADMIN can only see and update their municipality's feedback
  const feedbackUrl = user?.role === 'MUNICIPALITY_ADMIN' && user?.municipalityId
    ? `/feedback?municipalityId=${user.municipalityId}`
    : '/feedback';

  console.log('Current user:', user);
  console.log('Feedback URL:', feedbackUrl);

  const { data: feedbackList, error, isLoading } = useSWR<Feedback[]>(feedbackUrl, fetchFeedback);

  const handleStatusUpdate = async () => {
    if (!selectedFeedback) return;
    if (!canUpdateFeedback(selectedFeedback)) {
      alert(t('no_permission', 'feedback'));
      return;
    }

    try {
      // Update status
      await api.put(`/feedback/${selectedFeedback.id}`, { status: newStatus });
      
      // Add status update comment
      const commentResponse = await api.post(`/feedback/${selectedFeedback.id}/comments`, { 
        comment: `${t('status_updated', 'feedback')} ${t('status_to', 'feedback')} ${t(newStatus, 'feedback_status')}` 
      });
      
      // Refresh the feedback list
      mutate(feedbackUrl);
      
      // Update the selected feedback with the latest data
      const feedbackResponse = await api.get(`/feedback/${selectedFeedback.id}`);
      const updatedFeedback = feedbackResponse.data.data || feedbackResponse.data;
      setSelectedFeedback({
        ...updatedFeedback,
        comments: [...(updatedFeedback.comments || []), commentResponse.data]
      });

      // Show success message
      alert(t('status_update_success', 'feedback'));
      
      // Close the dialog
      setSelectedFeedback(null);
    } catch (error: any) {
      console.error('Error updating feedback status:', error);
      const errorMessage = error.response?.data?.message || t('error_updating_status', 'feedback');
      alert(errorMessage);
    }
  };

  const handleCategoryUpdate = async () => {
    if (!selectedFeedback) return;

    try {
      // Update category
      await api.put(`/feedback/${selectedFeedback.id}`, { category: newCategory });
      
      // Add category update comment
      const commentResponse = await api.post(`/feedback/${selectedFeedback.id}/comments`, { 
        comment: `${t('category_updated', 'feedback')} ${t('category_to', 'feedback')} ${t(newCategory, 'feedback_category')}` 
      });
      
      // Refresh the feedback list
      mutate(feedbackUrl);
      
      // Update the selected feedback with the latest data
      const feedbackResponse = await api.get(`/feedback/${selectedFeedback.id}`);
      const updatedFeedback = feedbackResponse.data.data || feedbackResponse.data;
      setSelectedFeedback({
        ...updatedFeedback,
        comments: [...(updatedFeedback.comments || []), commentResponse.data]
      });

      // Show success message
      alert(t('category_update_success', 'feedback'));
      
      // Close the dialog
      setSelectedFeedback(null);
    } catch (error: any) {
      console.error('Error updating feedback category:', error);
      const errorMessage = error.response?.data?.message || t('error_updating_category', 'feedback');
      alert(errorMessage);
    }
  };

  const handleAddComment = async () => {
    if (!selectedFeedback || !newComment.trim()) return;

    try {
      await api.post(`/feedback/${selectedFeedback.id}/comments`, { comment: newComment.trim() });
      mutate(feedbackUrl);
      setNewComment('');
      
      const response = await api.get(`/feedback/${selectedFeedback.id}`);
      setSelectedFeedback(response.data.data || response.data);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert(t('error_adding_comment', 'feedback'));
    }
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error">{t('error_loading_feedback', 'feedback')}</Typography>
      </Container>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('feedback_management', 'feedback')}
        </Typography>

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
                  <TableCell>{t('municipality', 'feedback')}</TableCell>
                  <TableCell>{t('category', 'feedback')}</TableCell>
                  <TableCell>{t('description', 'feedback')}</TableCell>
                  <TableCell>{t('status', 'feedback')}</TableCell>
                  <TableCell>{t('location', 'feedback')}</TableCell>
                  <TableCell>{t('submitted_by', 'feedback')}</TableCell>
                  <TableCell>{t('date', 'feedback')}</TableCell>
                  <TableCell>{t('actions', 'feedback')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feedbackList && Array.isArray(feedbackList) && feedbackList.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>{feedback.municipality.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={t(feedback.category, 'feedback_category')}
                        color={categoryColors[feedback.category]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{feedback.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={t(feedback.status, 'feedback_status')}
                        color={statusColors[feedback.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{feedback.address}</TableCell>
                    <TableCell>{feedback.user.name}</TableCell>
                    <TableCell>
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setNewStatus(feedback.status);
                          setNewCategory(feedback.category);
                        }}
                      >
                        {t('view_details', 'common')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Feedback Detail Dialog */}
        <Dialog
          open={!!selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{t('feedback_details', 'feedback')}</DialogTitle>
          <DialogContent>
            {selectedFeedback && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t('description', 'feedback')}
                </Typography>
                <Typography paragraph>{selectedFeedback.description}</Typography>

                <Typography variant="h6" gutterBottom>
                  {t('location', 'feedback')}
                </Typography>
                <Typography paragraph>{selectedFeedback.address}</Typography>

                <Typography variant="h6" gutterBottom>
                  {t('images', 'feedback')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  {selectedFeedback.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${t('image_alt', 'feedback')} ${index + 1}`}
                      style={{ width: 100, height: 100, objectFit: 'cover' }}
                    />
                  ))}
                </Box>

                {/* Status Update */}
                {canUpdateFeedback(selectedFeedback) && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {t('update_status', 'feedback')}
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>{t('status', 'feedback')}</InputLabel>
                      <Select
                        value={newStatus}
                        label={t('status', 'feedback')}
                        onChange={(e) => setNewStatus(e.target.value as Feedback['status'])}
                      >
                        <MenuItem value="PENDING">{t('PENDING', 'feedback_status')}</MenuItem>
                        <MenuItem value="IN_PROGRESS">{t('IN_PROGRESS', 'feedback_status')}</MenuItem>
                        <MenuItem value="RESOLVED">{t('RESOLVED', 'feedback_status')}</MenuItem>
                        <MenuItem value="REJECTED">{t('REJECTED', 'feedback_status')}</MenuItem>
                      </Select>
                    </FormControl>
                    <Button variant="contained" onClick={handleStatusUpdate}>
                      {t('update_status', 'feedback')}
                    </Button>
                  </Box>
                )}

                {/* Category Update */}
                {canUpdateFeedback(selectedFeedback) && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {t('update_category', 'feedback')}
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>{t('category', 'feedback')}</InputLabel>
                      <Select
                        value={newCategory}
                        label={t('category', 'feedback')}
                        onChange={(e) => setNewCategory(e.target.value as Feedback['category'])}
                      >
                        <MenuItem value="INFRASTRUCTURE">{t('INFRASTRUCTURE', 'feedback_category')}</MenuItem>
                        <MenuItem value="SAFETY">{t('SAFETY', 'feedback_category')}</MenuItem>
                        <MenuItem value="CLEANLINESS">{t('CLEANLINESS', 'feedback_category')}</MenuItem>
                        <MenuItem value="OTHER">{t('OTHER', 'feedback_category')}</MenuItem>
                      </Select>
                    </FormControl>
                    <Button variant="contained" onClick={handleCategoryUpdate}>
                      {t('update_category', 'feedback')}
                    </Button>
                  </Box>
                )}

                <Typography variant="h6" gutterBottom>
                  {t('comments', 'feedback')}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {selectedFeedback.comments && Array.isArray(selectedFeedback.comments) && selectedFeedback.comments.map((comment) => (
                    <Paper key={comment.id} sx={{ p: 2, mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('comment_by', 'feedback')}: {comment.user.name} - {t('comment_date_format', 'feedback')}: {new Date(comment.createdAt).toLocaleString()}
                      </Typography>
                      <Typography>{comment.comment}</Typography>
                    </Paper>
                  ))}
                  {(!selectedFeedback.comments || selectedFeedback.comments.length === 0) && (
                    <Typography color="text.secondary">{t('no_comments', 'feedback')}</Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    label={t('add_comment', 'feedback')}
                    multiline
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddComment}
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    {t('add_comment', 'feedback')}
                  </Button>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedFeedback(null)}>
              {t('close_dialog', 'feedback')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AppLayout>
  );
} 