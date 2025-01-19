'use client';

import React from 'react';
import {
  AppBar,
  Box,
  Button,
  Toolbar,
  Typography
} from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import LanguageSelector from './LanguageSelector';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <Box sx={{ height: '100vh', position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <LanguageSelector />
        </Box>
        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('app_name', 'common')}
          </Typography>

          {user && (
            <>
              <Button
                color="inherit"
                sx={{ mr: 2 }}
                onClick={() => router.push('/dashboard')}
              >
                {t('dashboard', 'navigation')}
              </Button>

              <Button
                color="inherit"
                sx={{ mr: 2 }}
                onClick={() => router.push('/feedback')}
              >
                {t('feedback', 'navigation')}
              </Button>

              {user.role === 'ADMIN' && (
                <>
                  <Button
                    color="inherit"
                    sx={{ mr: 2 }}
                    onClick={() => router.push('/municipalities')}
                  >
                    {t('municipalities', 'navigation')}
                  </Button>

                  <Button
                    color="inherit"
                    sx={{ mr: 2 }}
                    onClick={() => router.push('/users')}
                  >
                    {t('users', 'navigation')}
                  </Button>

                  <Button
                    color="inherit"
                    sx={{ mr: 2 }}
                    onClick={() => router.push('/translations')}
                  >
                    {t('translations', 'navigation')}
                  </Button>
                </>
              )}
            </>
          )}

          <LanguageSelector />

          {user && (
            <Button
              color="inherit"
              onClick={() => {
                logout();
              }}
            >
              {t('logout', 'common')}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
} 