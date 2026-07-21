import React, { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useQuery } from "@apollo/client";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";

import StatCard from "../components/StatCard.jsx";
import { PLATFORM_INFRA_USAGE } from "../graphql/operations.js";
import { downloadCsv } from "../utils/csv.js";

function monthStartIso() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();
}

function daysAgoIso(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

function money(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `$${Number(n).toFixed(2)}`;
}

function num(n, digits = 2) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toFixed(digits);
}

export default function InfraUsage() {
  const [rangeKey, setRangeKey] = useState("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const variables = useMemo(() => {
    if (rangeKey === "30d") {
      return { from: daysAgoIso(30), to: new Date().toISOString() };
    }
    if (rangeKey === "custom" && customFrom && customTo) {
      return {
        from: new Date(customFrom).toISOString(),
        to: new Date(customTo).toISOString(),
      };
    }
    return { from: monthStartIso(), to: new Date().toISOString() };
  }, [rangeKey, customFrom, customTo]);

  const { data, loading, error, refetch } = useQuery(PLATFORM_INFRA_USAGE, {
    variables,
    fetchPolicy: "cache-and-network",
  });

  const usage = data?.platformInfraUsage;
  const railway = usage?.railway;
  const vercel = usage?.vercel;
  const tenants = usage?.tenants ?? [];

  const configWarnings = [];
  if (railway && !railway.configured) {
    configWarnings.push(railway.message || "Railway no configurado");
  } else if (railway?.message) {
    configWarnings.push(`Railway: ${railway.message}`);
  }
  if (vercel && !vercel.configured) {
    configWarnings.push(vercel.message || "Vercel no configurado");
  } else if (vercel?.message) {
    configWarnings.push(`Vercel: ${vercel.message}`);
  }

  const exportCsv = () => {
    downloadCsv(
      `infra-usage-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "churchId",
        "name",
        "plan",
        "status",
        "userCount",
        "layoutCount",
        "railwayUsd",
        "vercelUsd",
        "totalUsd",
        "sharePct",
        "railwaySharePct",
        "vercelSharePct",
      ],
      tenants.map((t) => [
        t.churchId,
        t.name,
        t.plan,
        t.status,
        t.userCount,
        t.layoutCount,
        t.railwayUsd,
        t.vercelUsd,
        t.totalUsd,
        t.sharePct,
        t.railwaySharePct,
        t.vercelSharePct,
      ]),
    );
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        mb={2}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Infra / Costos
          </Typography>
          <Typography color="text.secondary">
            Uso aproximado Railway + Vercel y prorrateo por cliente
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<RefreshIcon />} onClick={() => refetch()}>
            Actualizar
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            variant="outlined"
            disabled={!tenants.length}
            onClick={exportCsv}
          >
            CSV
          </Button>
        </Stack>
      </Box>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ mb: 2 }}
        alignItems={{ md: "center" }}
      >
        <TextField
          select
          size="small"
          label="Periodo"
          value={rangeKey}
          onChange={(e) => setRangeKey(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="month">Mes actual</MenuItem>
          <MenuItem value="30d">Últimos 30 días</MenuItem>
          <MenuItem value="custom">Personalizado</MenuItem>
        </TextField>
        {rangeKey === "custom" ? (
          <>
            <TextField
              size="small"
              type="date"
              label="Desde"
              InputLabelProps={{ shrink: true }}
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />
            <TextField
              size="small"
              type="date"
              label="Hasta"
              InputLabelProps={{ shrink: true }}
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </>
        ) : null}
        {usage ? (
          <Typography variant="body2" color="text.secondary">
            {new Date(usage.from).toLocaleDateString()} →{" "}
            {new Date(usage.to).toLocaleDateString()}
          </Typography>
        ) : null}
      </Stack>

      {configWarnings.map((msg) => (
        <Alert key={msg} severity="warning" sx={{ mb: 2 }}>
          {msg}
        </Alert>
      ))}

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      ) : null}

      {loading && !usage ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Railway (est.)"
                value={money(railway?.estimatedCostUsd)}
                subtitle={railway?.source || "sin datos"}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Vercel (est.)"
                value={money(vercel?.estimatedCostUsd)}
                subtitle={vercel?.source || "sin datos"}
                color="secondary.main"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Total infra"
                value={money(usage?.grandTotalUsd)}
                color="success.main"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="RAM proceso API"
                value={`${num(usage?.processMemoryMb, 1)} MB`}
                subtitle="process.memoryUsage (RSS)"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  RAM Railway
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {num(railway?.memoryGb)} GB
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  CPU Railway
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {num(railway?.cpu)} vCPU
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  Storage
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {num(railway?.storageGb)} GB
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  Egress
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {num(railway?.networkGb)} GB
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {usage?.disclaimer ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              {usage.disclaimer}
            </Alert>
          ) : null}

          {(vercel?.services?.length > 0 || railway?.services?.length > 0) && (
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Servicios Vercel (FOCUS)
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {(vercel?.services || []).map((s) => (
                  <Chip
                    key={s.name}
                    size="small"
                    label={`${s.name}: ${money(s.costUsd)}`}
                  />
                ))}
              </Stack>
            </Paper>
          )}

          <Paper variant="outlined">
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              px={2}
              py={1.5}
            >
              <Typography fontWeight={700}>
                Prorrateo por cliente ({tenants.length})
              </Typography>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell align="right">Usuarios</TableCell>
                  <TableCell align="right">Layouts</TableCell>
                  <TableCell align="right">Railway $</TableCell>
                  <TableCell align="right">Vercel $</TableCell>
                  <TableCell align="right">Total $</TableCell>
                  <TableCell align="right">Share %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenants.map((t) => (
                  <TableRow key={t.churchId} hover>
                    <TableCell>
                      <Typography
                        component={RouterLink}
                        to={`/tenants/${t.churchId}`}
                        sx={{
                          textDecoration: "none",
                          color: "primary.main",
                          fontWeight: 600,
                        }}
                      >
                        {t.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={t.plan} />
                    </TableCell>
                    <TableCell align="right">{t.userCount}</TableCell>
                    <TableCell align="right">{t.layoutCount}</TableCell>
                    <TableCell align="right">{money(t.railwayUsd)}</TableCell>
                    <TableCell align="right">{money(t.vercelUsd)}</TableCell>
                    <TableCell align="right">
                      <strong>{money(t.totalUsd)}</strong>
                    </TableCell>
                    <TableCell align="right">{num(t.sharePct, 1)}%</TableCell>
                  </TableRow>
                ))}
                {!tenants.length ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Typography color="text.secondary" sx={{ py: 2 }}>
                        No hay clientes ACTIVE/TRIALING para prorratear.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </Box>
  );
}
