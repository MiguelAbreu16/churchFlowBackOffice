import React, { useEffect, useState } from "react";
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
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import PaymentsIcon from "@mui/icons-material/Payments";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import HistoryIcon from "@mui/icons-material/History";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import CloudIcon from "@mui/icons-material/Cloud";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import CommandPalette from "./CommandPalette.jsx";

const DRAWER_WIDTH = 240;

const navItems = [
  { to: "/", label: "Command Center", icon: <DashboardIcon /> },
  { to: "/tenants", label: "Clientes", icon: <BusinessIcon /> },
  { to: "/payments", label: "Pagos", icon: <PaymentsIcon /> },
  { to: "/plans", label: "Planes", icon: <CardMembershipIcon /> },
  { to: "/support", label: "Soporte", icon: <SupportAgentIcon /> },
  { to: "/infra", label: "Infra / Costos", icon: <CloudIcon /> },
  { to: "/system", label: "Sistema", icon: <MonitorHeartIcon /> },
  { to: "/audit", label: "Auditoría", icon: <HistoryIcon /> },
];

export default function AdminLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("platform_user") || "null");

  const logout = () => {
    localStorage.removeItem("platform_token");
    localStorage.removeItem("platform_user");
    navigate("/login");
  };

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const drawer = (
    <Box sx={{ overflow: "auto", py: 1 }}>
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.to === "/"}
            onClick={() => isMobile && setMobileOpen(false)}
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
  );

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
        <Toolbar sx={{ gap: 1 }}>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 800,
              fontFamily: '"Outfit", "Inter", sans-serif',
              letterSpacing: "-0.03em",
            }}
          >
            Kahal Zerem Admin
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => setPaletteOpen(true)}
            title="Buscar (Ctrl+K)"
          >
            <SearchIcon />
          </IconButton>
          <Chip
            size="small"
            label={user?.role || "OPS"}
            color="primary"
            variant="outlined"
            sx={{ display: { xs: "none", sm: "inline-flex" } }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", md: "block" }, maxWidth: 180 }}
            noWrap
          >
            {user?.name}
          </Typography>
          <IconButton color="inherit" onClick={logout} title="Cerrar sesión">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
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
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          bgcolor: "background.default",
          minHeight: "100vh",
          width: { xs: "100%", md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </Box>
  );
}
