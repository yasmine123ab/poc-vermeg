import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, Avatar, Grid, MenuItem, Link,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { register as registerApi } from '../api/authApi';
import { UserRole } from '../types';

interface FormState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

const initialState: FormState = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  role: 'OPERATOR',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
  };

  const validate = (): string | null => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.username.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      return 'Veuillez remplir tous les champs obligatoires.';
    }
    if (!emailRegex.test(form.email)) {
      return "Le format de l'email est invalide.";
    }
    if (form.password.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    }
    if (form.password !== form.confirmPassword) {
      return 'Les mots de passe ne correspondent pas.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await registerApi({
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        phoneNumber: form.phoneNumber || undefined,
        password: form.password,
        role: form.role,
      });
      toast.success('Compte créé avec succès ! Vous pouvez vous connecter.');
      navigate('/login', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur lors de la création du compte.");
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
        style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}
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
                POC Vermeg
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Créer un compte
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Prénom" fullWidth required margin="normal"
                    value={form.firstName} onChange={handleChange('firstName')} autoFocus
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Nom" fullWidth required margin="normal"
                    value={form.lastName} onChange={handleChange('lastName')}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Nom d'utilisateur" fullWidth required margin="normal"
                value={form.username} onChange={handleChange('username')}
              />
              <TextField
                label="Email" type="email" fullWidth required margin="normal"
                value={form.email} onChange={handleChange('email')}
              />
              <TextField
                label="Téléphone" fullWidth margin="normal"
                value={form.phoneNumber} onChange={handleChange('phoneNumber')}
              />

              <TextField
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                fullWidth required margin="normal"
                value={form.password} onChange={handleChange('password')}
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
              <TextField
                label="Confirmer le mot de passe"
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth required margin="normal"
                value={form.confirmPassword} onChange={handleChange('confirmPassword')}
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

              <TextField
                select label="Rôle" fullWidth margin="normal"
                value={form.role} onChange={handleChange('role')}
              >
                <MenuItem value="ADMIN">ADMIN</MenuItem>
                <MenuItem value="OPERATOR">OPERATOR</MenuItem>
              </TextField>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                loading={loading}
                sx={{ mt: 3, mb: 1, py: 1.3, bgcolor: '#1F4E79', '&:hover': { bgcolor: '#163a5c' } }}
              >
                Créer mon compte
              </Button>
            </Box>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" underline="hover" sx={{ fontSize: 14, color: '#2E75B6', fontWeight: 600 }}>
                Déjà un compte ? Se connecter
              </Link>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default RegisterPage;
