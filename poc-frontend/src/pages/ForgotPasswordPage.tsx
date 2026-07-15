import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, Avatar, Link,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { forgotPassword } from '../api/authApi';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !emailRegex.test(email)) {
      setError("Veuillez saisir une adresse email valide.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
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
                Mot de passe oublié
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, textAlign: 'center' }}>
                Saisissez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {sent ? (
              <Alert severity="success" sx={{ mb: 1 }}>
                Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.
              </Alert>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  margin="normal"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  loading={loading}
                  sx={{ mt: 3, mb: 1, py: 1.3, bgcolor: '#1F4E79', '&:hover': { bgcolor: '#163a5c' } }}
                >
                  Envoyer le lien de réinitialisation
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" underline="hover" sx={{ fontSize: 14, color: '#2E75B6', fontWeight: 600 }}>
                Retour à la connexion
              </Link>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default ForgotPasswordPage;
