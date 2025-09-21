// src/components/layout/MainLayout.js

import React, { useMemo, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Avatar,
  useMediaQuery,
  useTheme,
  Box,
} from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import InfoIcon from '@mui/icons-material/Info';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import SchoolIcon from '@mui/icons-material/School';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PeopleIcon from '@mui/icons-material/People';

import { useAuth } from '../../hooks/useAuth';
import AppInfoModal from '../AppInfoModal';
import ContactModal from '../ContactModal';
import logo from '../../assets/img/Z_logo_vertical.png';

const drawerWidth = 240;

const MainLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [openContactModal, setOpenContactModal] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((v) => !v);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = useMemo(
    () => [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard/select' },
      { text: 'CRM', icon: <PeopleIcon />, path: '/messages' },
      { text: 'Flows', icon: <AccountTreeIcon />, path: '/flows' },
      { text: 'Usuarios', icon: <PeopleIcon />, path: '/users' },
    ],
    []
  );

  const isActive = (path) => location.pathname.startsWith(path);

  const userInitials = (name) => {
    if (!name) return 'U';
    const parts = String(name).trim().split(' ');
    const first = parts[0]?.[0] ?? '';
    const last = parts[1]?.[0] ?? '';
    return (first + last).toUpperCase();
  };

  const DrawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 128,
            height: 128,
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
            mb: 1,
          }}
        >
          <img
            src={logo}
            alt="Company Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1, gap: 1.25 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {userInitials(user.username || user.name)}
              </Avatar>
              <Box
                sx={{
                  position: 'absolute',
                  right: -2,
                  bottom: -2,
                  width: 10,
                  height: 10,
                  bgcolor: 'success.main',
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: 'background.paper',
                }}
              />
            </Box>
            <Typography variant="subtitle2" color="text.secondary" noWrap title={user.username}>
              {user.username}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      <List sx={{ px: 1, py: 1 }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                selected={active}
                sx={{
                  borderRadius: 1.5,
                  px: 1.25,
                  '&.Mui-selected': {
                    bgcolor:
                      theme.palette.mode === 'light'
                        ? 'rgba(25,118,210,0.08)'
                        : 'rgba(144,202,249,0.12)',
                  },
                  '&:hover': {
                    bgcolor:
                      theme.palette.mode === 'light'
                        ? 'action.hover'
                        : 'action.selected',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: active ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: active ? 700 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider />

      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1.5,
              px: 1.25,
              '&:hover': {
                bgcolor:
                  theme.palette.mode === 'light'
                    ? 'action.hover'
                    : 'action.selected',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          backdropFilter: 'blur(6px)',
          backgroundColor:
            theme.palette.mode === 'light'
              ? 'rgba(255,255,255,0.8)'
              : 'rgba(18,18,18,0.8)',
          boxShadow:
            theme.palette.mode === 'light'
              ? '0 2px 12px rgba(0,0,0,0.08)'
              : '0 2px 12px rgba(0,0,0,0.5)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          width: mdUp ? `calc(100% - ${drawerWidth}px)` : '100%',
          ml: mdUp ? `${drawerWidth}px` : 0,
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          {!mdUp && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1.5 }}
              aria-label="Abrir menú"
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: 800,
              letterSpacing: 0.2,
              flexGrow: 1,
              background: (t) =>
                t.palette.mode === 'light'
                  ? 'linear-gradient(90deg, #1976d2, #42a5f5)'
                  : 'linear-gradient(90deg, #90caf9, #64b5f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ZRN EstrategIA
          </Typography>

          <Tooltip title="Información de la app">
            <IconButton color="inherit" onClick={() => setOpenInfoModal(true)}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Contacto">
            <IconButton color="inherit" onClick={() => setOpenContactModal(true)}>
              <ContactSupportIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Drawer — mobile (temporary) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {DrawerContent}
      </Drawer>

      {/* Drawer — desktop (permanent) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        {DrawerContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          ml: mdUp ? `${drawerWidth}px` : 0, // ensures correct layout
        }}
      >
        <Toolbar /> {/* spacer for AppBar */}
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>

        {/* Footer (single source of truth) */}
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {'Copyright © '}
            ZRN EstrategIA {new Date().getFullYear()}
            {'. '}
            {'Powered by '}
            <a
              href="https://zeron.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              Zeron
            </a>
          </Typography>
        </Box>
      </Box>

      {/* Modals */}
      <AppInfoModal open={openInfoModal} onClose={() => setOpenInfoModal(false)} />
      <ContactModal open={openContactModal} onClose={() => setOpenContactModal(false)} />
    </Box>
  );
};

export default MainLayout;