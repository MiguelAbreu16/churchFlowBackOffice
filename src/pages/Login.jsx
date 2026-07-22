import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
} from "@mui/material";

import { PLATFORM_LOGIN } from "../graphql/operations.js";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { loading, error }] = useMutation(PLATFORM_LOGIN);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await login({ variables: { email, password } });
    localStorage.setItem("platform_token", data.platformLogin.token);
    localStorage.setItem(
      "platform_user",
      JSON.stringify(data.platformLogin.user),
    );
    navigate("/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, width: "100%", maxWidth: 420 }} elevation={3}>
        <Stack spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2.5,
              bgcolor: "#0b0f1a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              boxShadow: "0 8px 20px -6px rgba(15,23,42,0.35)",
            }}
          >
            <Box
              component="img"
              src="/logo-icon.png"
              alt="Kahal Zerem"
              sx={{ width: 56, height: 56, objectFit: "contain" }}
            />
          </Box>
          <Typography variant="h5" fontWeight={700}>
            Kahal Zerem Admin
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Acceso restringido al equipo de plataforma
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? "Entrando…" : "Iniciar sesión"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
