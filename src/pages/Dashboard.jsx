import React from "react";
import { useQuery } from "@apollo/client";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Chip,
} from "@mui/material";

import StatCard from "../components/StatCard.jsx";
import {
  PLATFORM_METRICS,
  PLATFORM_TENANTS,
  PLATFORM_PAYMENTS,
} from "../graphql/operations.js";

export default function Dashboard() {
  const { data: metricsData, loading: metricsLoading } =
    useQuery(PLATFORM_METRICS);
  const { data: tenantsData } = useQuery(PLATFORM_TENANTS, {
    variables: { limit: 8, offset: 0 },
  });
  const { data: paymentsData } = useQuery(PLATFORM_PAYMENTS, {
    variables: { limit: 5, status: "FAILED" },
  });

  if (metricsLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  const m = metricsData?.platformMetrics;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Command Center
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Vista operativa de la plataforma Kahal Zerem
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Tenants activos" value={m?.activeTenants ?? 0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total clientes"
            value={m?.totalTenants ?? 0}
            subtitle={`+${m?.newTenants30d ?? 0} últimos 30 días`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="MRR estimado (30d)"
            value={`$${(m?.estimatedMrr30d ?? 0).toFixed(0)}`}
            color="success.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pagos fallidos (7d)"
            value={m?.failedPayments7d ?? 0}
            color={m?.failedPayments7d > 0 ? "error.main" : "text.primary"}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribución por plan
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Plan</TableCell>
                  <TableCell align="right">Clientes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(m?.tenantsByPlan ?? []).map((row) => (
                  <TableRow key={row.plan}>
                    <TableCell>
                      <Chip label={row.plan} size="small" />
                    </TableCell>
                    <TableCell align="right">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              En trial: {m?.trialingTenants ?? 0} · Pausados:{" "}
              {m?.pausedTenants ?? 0}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography variant="h6">Clientes recientes</Typography>
              <Button component={RouterLink} to="/tenants" size="small">
                Ver todos
              </Button>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(tenantsData?.platformTenants?.items ?? []).map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>
                      <Button
                        component={RouterLink}
                        to={`/tenants/${t.id}`}
                        size="small"
                      >
                        {t.name}
                      </Button>
                    </TableCell>
                    <TableCell>{t.plan}</TableCell>
                    <TableCell>
                      <Chip
                        label={t.status}
                        size="small"
                        color={t.status === "ACTIVE" ? "success" : "warning"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {(paymentsData?.platformPayments?.items?.length ?? 0) > 0 && (
          <Grid size={{ xs: 12 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" color="error" gutterBottom>
                Pagos fallidos recientes
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentsData.platformPayments.items.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.churchName}</TableCell>
                      <TableCell>
                        {p.currency} {p.amount}
                      </TableCell>
                      <TableCell>
                        {new Date(p.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
