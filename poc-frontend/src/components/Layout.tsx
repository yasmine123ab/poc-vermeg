import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Avatar, Typography, Divider, AppBar, Toolbar, Chip, Button, IconButton, Tooltip,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';

const DRAWER_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon />, end: true },
  { label: 'Flux', path: '/flux', icon: <AccountTreeIcon />, end: false },
  { label: 'Exécutions', path: '/executions', icon: <PlayCircleIcon />, end: false },
  { label: 'Statistiques', path: '/stats', icon: <BarChartIcon />, end: false },
];

const pageTitles: Record<string, string> = {
  '/': 'Tableau de bord',
  '/flux': 'Gestion des Flux',
  '/flux/new': 'Nouveau flux',
  '/executions': 'Historique des Exécutions',
  '/stats': 'Statistiques',
  '/profile': 'Mon profil',
};

function resolvePageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith('/flux/') && pathname.endsWith('/edit')) return 'Modifier le flux';
  if (pathname.startsWith('/executions/')) return "Détail de l'exécution";
  return 'POC Vermeg';
}

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = mode === 'dark';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const sidebarBg = isDark ? '#0A1929' : '#1F4E79';
  const activeBg = isDark ? '#1565C0' : '#2E75B6';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: sidebarBg,
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            transition: 'background-color 0.2s',
          },
        }}
      >
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountTreeIcon />
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            POC Vermeg
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: activeBg }}>
            {user?.firstName && user?.lastName
              ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
              : (user?.username || '?').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {user?.role}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

        <List sx={{ flexGrow: 1, px: 1, pt: 1 }}>
          {navItems.map(item => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              end={item.end}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                color: '#fff',
                '&.active': { bgcolor: activeBg },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

        <List sx={{ px: 1, py: 1 }}>
          <ListItemButton
            component={NavLink}
            to="/profile"
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              color: '#fff',
              '&.active': { bgcolor: activeBg },
              '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Mon profil" />
          </ListItemButton>
          <ListItemButton
            onClick={handleLogout}
            sx={{ borderRadius: 1.5, color: '#fff', '&:hover': { bgcolor: 'rgba(220,53,69,0.4)' } }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Se déconnecter" />
          </ListItemButton>
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.default', minHeight: '100vh' }}>
        <AppBar position="sticky" color="inherit" elevation={1}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
              {resolvePageTitle(location.pathname)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}>
                <IconButton onClick={toggleMode} color="inherit">
                  {isDark ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              <Chip
                label={user?.role}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: user?.role === 'ADMIN' ? '#d4edda' : '#fff3cd',
                  color: user?.role === 'ADMIN' ? '#155724' : '#856404',
                }}
              />
              <Button variant="outlined" size="small" startIcon={<LogoutIcon />} onClick={handleLogout}>
                Déconnexion
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
