import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import { useAuth } from '../context/AuthContext';

interface Props {
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<Props> = ({ adminOnly = false }) => {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return (
      <Box
        sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100%', minHeight: '60vh', gap: 2, textAlign: 'center', p: 4,
        }}
      >
        <BlockIcon sx={{ fontSize: 64, color: '#dc3545' }} />
        <Typography variant="h5" sx={{ color: '#1F4E79', fontWeight: 700 }}>
          Accès refusé
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vous n'avez pas les droits nécessaires (ADMIN) pour accéder à cette page.
        </Typography>
      </Box>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
