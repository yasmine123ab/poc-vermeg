import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Box, Card, CardContent, Typography, Avatar, Chip, Grid, Tabs, Tab,
  TextField, Button, InputAdornment, IconButton, LinearProgress, Divider,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { getMe, updateProfile } from '../api/authApi';
import { isAuthError } from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { passwordStrength } from './ResetPasswordPage';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

function formatDate(s?: string) {
  if (!s) return '-';
  return new Date(s).toLocaleString('fr-FR');
}

function computeInitials(profile: UserProfile | null): string {
  if (!profile) return '?';
  if (profile.firstName && profile.lastName) {
    return (profile.firstName.charAt(0) + profile.lastName.charAt(0)).toUpperCase();
  }
  return (profile.username || '?').charAt(0).toUpperCase();
}

const ProfilePage: React.FC = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const load = () => {
    setLoading(true);
    getMe()
      .then(data => {
        setProfile(data);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setPhoneNumber(data.phoneNumber || '');
      })
      .catch(error => { if (!isAuthError(error)) toast.error('Erreur lors du chargement du profil'); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Le prénom et le nom sont obligatoires');
      return;
    }
    setSavingInfo(true);
    try {
      const updated = await updateProfile({ firstName, lastName, phoneNumber: phoneNumber || undefined });
      setProfile(updated);
      updateUser({
        username: updated.username,
        email: updated.email,
        role: updated.role,
        firstName: updated.firstName,
        lastName: updated.lastName,
        phoneNumber: updated.phoneNumber,
      });
      toast.success('Profil mis à jour avec succès');
    } catch {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Veuillez saisir votre mot de passe actuel');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setSavingPassword(true);
    try {
      await updateProfile({
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        phoneNumber: profile?.phoneNumber,
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success('Mot de passe mis à jour avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return null;

  const strength = passwordStrength(newPassword);
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.username;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
      <Box sx={{ padding: 4, maxWidth: 1200, margin: '0 auto' }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 4 }}>
                <Avatar sx={{ bgcolor: '#1F4E79', width: 80, height: 80, fontSize: 28, fontWeight: 700, mb: 2 }}>
                  {computeInitials(profile)}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{fullName}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>@{profile.username}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>{profile.email}</Typography>
                <Chip
                  label={profile.role}
                  size="small"
                  sx={{
                    fontWeight: 700, mb: 2,
                    bgcolor: profile.role === 'ADMIN' ? '#d4edda' : '#fff3cd',
                    color: profile.role === 'ADMIN' ? '#155724' : '#856404',
                  }}
                />
                <Divider sx={{ width: '100%', my: 1 }} />
                <Box sx={{ width: '100%', textAlign: 'left', mt: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                    Dernière connexion
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1.5 }}>{formatDate(profile.lastLoginAt)}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                    Membre depuis
                  </Typography>
                  <Typography variant="body2">{formatDate(profile.createdAt)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Informations personnelles" />
                <Tab label="Changer le mot de passe" />
              </Tabs>

              <CardContent sx={{ p: 4 }}>
                {tab === 0 && (
                  <Box component="form" onSubmit={handleSaveInfo} noValidate>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Prénom" fullWidth required margin="normal"
                          value={firstName} onChange={e => setFirstName(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Nom" fullWidth required margin="normal"
                          value={lastName} onChange={e => setLastName(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                    <TextField label="Email" fullWidth margin="normal" value={profile.email} disabled />
                    <TextField label="Nom d'utilisateur" fullWidth margin="normal" value={profile.username} disabled />
                    <TextField
                      label="Téléphone" fullWidth margin="normal"
                      value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                    />
                    <Button
                      type="submit" variant="contained" loading={savingInfo}
                      sx={{ mt: 2, bgcolor: '#1F4E79', '&:hover': { bgcolor: '#163a5c' } }}
                    >
                      Sauvegarder les modifications
                    </Button>
                  </Box>
                )}

                {tab === 1 && (
                  <Box component="form" onSubmit={handleSavePassword} noValidate>
                    <TextField
                      label="Mot de passe actuel"
                      type={showCurrent ? 'text' : 'password'}
                      fullWidth required margin="normal"
                      value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowCurrent(v => !v)} edge="end">
                                {showCurrent ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                    <TextField
                      label="Nouveau mot de passe"
                      type={showNew ? 'text' : 'password'}
                      fullWidth required margin="normal"
                      value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowNew(v => !v)} edge="end">
                                {showNew ? <VisibilityOff /> : <Visibility />}
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
                      label="Confirmer le nouveau mot de passe"
                      type={showConfirm ? 'text' : 'password'}
                      fullWidth required margin="normal"
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowConfirm(v => !v)} edge="end">
                                {showConfirm ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                    <Button
                      type="submit" variant="contained" loading={savingPassword}
                      sx={{ mt: 2, bgcolor: '#1F4E79', '&:hover': { bgcolor: '#163a5c' } }}
                    >
                      Mettre à jour le mot de passe
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

export default ProfilePage;
