import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const LoadingSpinner: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
    <CircularProgress sx={{ color: '#2E75B6' }} />
  </Box>
);

export default LoadingSpinner;
