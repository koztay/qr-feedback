'use client';

import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, ListItemText, Box } from '@mui/material';
import { Logout as LogoutIcon, Language as LanguageIcon } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/contexts/TranslationContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isAdmin = user?.role === 'ADMIN';
  const isMunicipalityAdmin = user?.role === 'MUNICIPALITY_ADMIN';
  const { language, setLanguage, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (lang: 'TR' | 'EN') => {
    setLanguage(lang);
    handleLanguageClose();
  };

  const renderLanguageSelector = () => (
    <>
      <Button
        color="inherit"
        onClick={handleLanguageClick}
        startIcon={<LanguageIcon />}
        sx={{ ml: 2 }}
      >
        {language === 'TR' ? 'Türkçe' : 'English'}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleLanguageClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          onClick={() => handleLanguageSelect('TR')}
          selected={language === 'TR'}
        >
          <ListItemText>Türkçe</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageSelect('EN')}
          selected={language === 'EN'}
        >
          <ListItemText>English</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );

  // Login page layout
  if (isLoginPage) {
    return (
      <Box sx={{ height: '100vh', position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          {renderLanguageSelector()}
        </Box>
        <Box sx={{ 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {children}
        </Box>
      </Box>
    );
  }

  // Main layout for authenticated pages
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('app_name', 'common')}
          </Typography>
          {user && (
            <>
              {(isAdmin || isMunicipalityAdmin) && (
                <Button
                  color="inherit"
                  sx={{ mr: 2 }}
                  onClick={() => router.push('/feedback')}
                >
                  {t('feedback', 'navigation')}
                </Button>
              )}
              {isAdmin && (
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
              <Button
                color="inherit"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
              >
                {t('logout', 'common')}
              </Button>
            </>
          )}
          {renderLanguageSelector()}
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 2 }}>
        {children}
      </Box>
    </Box>
  );
} 