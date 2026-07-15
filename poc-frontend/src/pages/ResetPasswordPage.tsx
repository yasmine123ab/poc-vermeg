import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, Avatar, InputAdornment, IconButton, LinearProgress,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { resetPassword } from '../api/authApi';

export function passwordStrength(password: string): { value: number; color: 'error' | 'warning' | 'success'; label: string } {
  if (password.length === 0) return { value: 0, color: 'error', label: '' };
  if (password.length < 6) return { value: 33, color: 'error', label: 'Faible' };
  if (password.length <= 8) return { value: 66, color: 'warning', label: 'Moyen' };
  return { value: 100, color: 'success', label: 'Fort' };
}

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => navigate('/login', { replace: true }), 3000);
    return () => clearTimeout(timer);
  }, [success, navigate]);

  if (!token) return null;

  const strength = passwordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword, confirmPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Le lien de réinitialisation est invalide ou a expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1F4E79 0%, #2E75B6 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 40px)',
          pointerEvents: 'none',
        },
        padding: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
      >
        <Card sx={{ width: '100%', borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <CardContent sx={{ padding: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              >
                <Avatar sx={{ bgcolor: '#1F4E79', width: 76, height: 76, mb: 1.5, boxShadow: '0 8px 20px rgba(31,78,121,0.4)' }}>
                  <AccountTreeIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </motion.div>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F4E79' }}>
                Réinitialiser le mot de passe
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success ? (
              <Alert severity="success">
                Votre mot de passe a été réinitialisé avec succès. Redirection vers la connexion...
              </Alert>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  label="Nouveau mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth required margin="normal"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoFocus
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                {newPassword.length > 0 && (
                  <Box sx={{ mt: -1, mb: 1 }}>
                    <LinearProgress variant="determinate" value={strength.value} color={strength.color} sx={{ height: 6, borderRadius: 3 }} />
                    <Typography variant="caption" sx={{ color: `${strength.color}.main`, fontWeight: 600 }}>
                      {strength.label}
                    </Typography>
                  </Box>
                )}

                <TextField
                  label="Confirmer le mot de passe"
                  type={showConfirmPassword ? 'text' : 'password'}
                  fullWidth required margin="normal"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword(v => !v)} edge="end">
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  loading={loading}
                  sx={{ mt: 3, mb: 1, py: 1.3, bgcolor: '#1F4E79', '&:hover': { bgcolor: '#163a5c' } }}
                >
                  Réinitialiser le mot de passe
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default ResetPasswordPage;
