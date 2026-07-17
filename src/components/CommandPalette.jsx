import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLazyQuery } from "@apollo/client";
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { PLATFORM_TENANTS } from "../graphql/operations.js";

const STATIC_LINKS = [
  { label: "Command Center", path: "/", group: "Navegación" },
  { label: "Clientes", path: "/tenants", group: "Navegación" },
  { label: "Pagos", path: "/payments", group: "Navegación" },
  { label: "Planes", path: "/plans", group: "Navegación" },
  { label: "Soporte", path: "/support", group: "Navegación" },
  { label: "Sistema / Health", path: "/system", group: "Navegación" },
  { label: "Auditoría", path: "/audit", group: "Navegación" },
];

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [searchTenants, { data, loading }] = useLazyQuery(PLATFORM_TENANTS);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      if (q.trim().length >= 2) {
        searchTenants({
          variables: { search: q.trim(), limit: 8, offset: 0 },
        });
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q, open, searchTenants]);

  const items = useMemo(() => {
    const nav = STATIC_LINKS.filter((l) =>
      l.label.toLowerCase().includes(q.toLowerCase()),
    );
    const tenants = (data?.platformTenants?.items ?? []).map((t) => ({
      label: t.name,
      path: `/tenants/${t.id}`,
      group: "Clientes",
      secondary: `${t.plan} · ${t.status}`,
    }));
    return [...nav, ...tenants];
  }, [q, data]);

  const go = (path) => {
    navigate(path);
    onClose();
    setQ("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3, overflow: "hidden", mt: { xs: 2, sm: 8 } },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Buscar páginas o clientes… (Ctrl+K)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        {loading && (
          <Box p={2} display="flex" justifyContent="center">
            <CircularProgress size={22} />
          </Box>
        )}
        <List dense sx={{ maxHeight: 360, overflow: "auto", py: 1 }}>
          {items.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ px: 3, py: 2 }}
            >
              Sin resultados
            </Typography>
          )}
          {items.map((item) => (
            <ListItemButton key={item.path + item.label} onClick={() => go(item.path)}>
              <ListItemText
                primary={item.label}
                secondary={item.secondary || item.group}
              />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
