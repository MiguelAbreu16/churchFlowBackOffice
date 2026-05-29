import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import PaymentsIcon from "@mui/icons-material/Payments";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import HistoryIcon from "@mui/icons-material/History";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import LogoutIcon from "@mui/icons-material/Logout";

const DRAWER_WIDTH = 240;

const navItems = [
  { to: "/", label: "Command Center", icon: <DashboardIcon /> },
  { to: "/tenants", label: "Clientes", icon: <BusinessIcon /> },
  { to: "/payments", label: "Pagos", icon: <PaymentsIcon /> },
  { to: "/plans", label: "Planes", icon: <CardMembershipIcon /> },
  { to: "/support", label: "Soporte", icon: <SupportAgentIcon /> },
  { to: "/system", label: "Sistema", icon: <MonitorHeartIcon /> },
  { to: "/audit", label: "Auditoría", icon: <HistoryIcon /> },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("platform_user") || "null");

  const logout = () => {
    localStorage.removeItem("platform_token");
    localStorage.removeItem("platform_user");
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            ChurchOps Admin
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            {user?.name} · {user?.role}
          </Typography>
          <IconButton color="inherit" onClick={logout} title="Cerrar sesión">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", py: 1 }}>
          <List>
            {navItems.map((item) => (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                end={item.to === "/"}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  "&.active": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "& .MuiListItemIcon-root": { color: "inherit" },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary" sx={{ px: 3 }}>
            Operaciones de plataforma
          </Typography>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
