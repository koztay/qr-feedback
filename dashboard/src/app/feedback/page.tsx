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

  // Fetch feedback based on user role and municipality
  const feedbackUrl = user?.role === 'MUNICIPALITY_ADMIN' && user?.municipalityId
    ? `/feedback?municipalityId=${user.municipalityId}`
    : '/feedback';

  console.log('Current user:', user);
  console.log('Feedback URL:', feedbackUrl);

  const { data: feedbackList, error, isLoading } = useSWR<Feedback[]>(feedbackUrl, fetchFeedback);

  const handleStatusUpdate = async () => {
    if (!selectedFeedback) return;

    try {
      await api.patch(`/feedback/${selectedFeedback.id}/status`, { status: newStatus });

      // Add system comment about status change
      await api.post(`/feedback/${selectedFeedback.id}/comments`, { comment: `Status updated to ${newStatus}` });

      // Refresh feedback data
      mutate(feedbackUrl);
      
      // Refresh the selected feedback to show the updated status and new comment
      const updatedFeedback = await api.get(`/feedback/${selectedFeedback.id}`);
      setSelectedFeedback(updatedFeedback.data);
    } catch (error) {
      console.error('Error updating feedback status:', error);
    }
  };

  const handleAddComment = async () => {
    if (!selectedFeedback || !newComment.trim()) return;

    try {
      await api.post(`/feedback/${selectedFeedback.id}/comments`, { comment: newComment.trim() });

      // Refresh feedback data
      mutate(feedbackUrl);
      setNewComment('');
      
      // Refresh the selected feedback to show the new comment
      const updatedFeedback = await api.get(`/feedback/${selectedFeedback.id}`);
      setSelectedFeedback(updatedFeedback.data);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error">Error loading feedback</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Feedback Management
      </Typography>

      <TableContainer component={Paper}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Municipality</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Submitted By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feedbackList && Array.isArray(feedbackList) && feedbackList.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>{feedback.municipality.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={feedback.category}
                      color={categoryColors[feedback.category]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{feedback.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={feedback.status}
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
                      }}
                    >
                      View Details
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
        <DialogTitle>Feedback Details</DialogTitle>
        <DialogContent>
          {selectedFeedback && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography paragraph>{selectedFeedback.description}</Typography>

              <Typography variant="h6" gutterBottom>
                Location
              </Typography>
              <Typography paragraph>{selectedFeedback.address}</Typography>

              <Typography variant="h6" gutterBottom>
                Images
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {selectedFeedback.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Feedback image ${index + 1}`}
                    style={{ width: 100, height: 100, objectFit: 'cover' }}
                  />
                ))}
              </Box>

              <Typography variant="h6" gutterBottom>
                Status Update
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newStatus}
                  label="Status"
                  onChange={(e) => setNewStatus(e.target.value as Feedback['status'])}
                >
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="RESOLVED">Resolved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleStatusUpdate}
                sx={{ mb: 3 }}
              >
                Update Status
              </Button>

              <Typography variant="h6" gutterBottom>
                Comments
              </Typography>
              <Box sx={{ mb: 2 }}>
                {selectedFeedback.comments && Array.isArray(selectedFeedback.comments) && selectedFeedback.comments.map((comment) => (
                  <Paper key={comment.id} sx={{ p: 2, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {comment.user.name} - {new Date(comment.createdAt).toLocaleString()}
                    </Typography>
                    <Typography>{comment.comment}</Typography>
                  </Paper>
                ))}
                {(!selectedFeedback.comments || selectedFeedback.comments.length === 0) && (
                  <Typography color="text.secondary">No comments yet</Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Add a comment"
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
                  Add Comment
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedFeedback(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 