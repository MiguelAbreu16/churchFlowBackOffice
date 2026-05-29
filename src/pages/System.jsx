import React from "react";
import { useQuery } from "@apollo/client";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

import { PLATFORM_HEALTH } from "../graphql/operations.js";

const statusColor = {
  HEALTHY: "success",
  DEGRADED: "warning",
  UNHEALTHY: "error",
  UP: "success",
  DOWN: "error",
};

export default function System() {
  const { data, loading, refetch } = useQuery(PLATFORM_HEALTH, {
    pollInterval: 30000,
  });

  const health = data?.platformHealth;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Sistema
          </Typography>
          <Typography color="text.secondary">
            Salud de API, base de datos y caché
          </Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} onClick={() => refetch()}>
          Actualizar
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  Estado global
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={health?.status}
                    color={statusColor[health?.status] || "default"}
                  />
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  Uptime
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {Math.floor((health?.uptimeSeconds ?? 0) / 60)} min
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  Entorno
                </Typography>
                <Typography variant="h6">{health?.environment}</Typography>
                <Typography variant="caption" color="text.secondary">
                  v{health?.version}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Servicio</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Latencia (ms)</TableCell>
                  <TableCell>Mensaje</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(health?.checks ?? []).map((c) => (
                  <TableRow key={c.name}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={c.status}
                        size="small"
                        color={statusColor[c.status] || "default"}
                      />
                    </TableCell>
                    <TableCell align="right">{c.latencyMs ?? "—"}</TableCell>
                    <TableCell>{c.message ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
            Última comprobación: {health?.timestamp
              ? new Date(health.timestamp).toLocaleString()
              : "—"}
            {" · "}
            Endpoint público: <code>/health</code>
          </Typography>
        </>
      )}
    </Box>
  );
}
