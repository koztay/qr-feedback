'use client';

import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from '@/contexts/TranslationContext';

export default function LanguageSelector() {
  const { language, setLanguage, supportedLanguages } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang as 'TR' | 'EN');
    handleLanguageClose();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleLanguageClick}
        sx={{ ml: 2 }}
      >
        <LanguageIcon />
        <Typography variant="button" sx={{ ml: 1, color: 'inherit' }}>
          {language}
        </Typography>
      </IconButton>
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
        {supportedLanguages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageSelect(lang.code)}
            selected={language === lang.code}
          >
            {lang.nativeName}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
} 