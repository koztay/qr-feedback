'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {!isLoginPage && user && (
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              QR Feedback
            </Typography>
            <Button
              color="inherit"
              sx={{ mr: 2 }}
              onClick={() => router.push('/municipalities')}
            >
              Municipalities
            </Button>
            <Button
              color="inherit"
              sx={{ mr: 2 }}
              onClick={() => router.push('/users')}
            >
              Users
            </Button>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>
      )}
      {children}
    </>
  );
} 