import React from "react";
import { useQuery } from "@apollo/client";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from "@mui/material";

import { PLATFORM_PAYMENTS, PLATFORM_SUBSCRIPTIONS } from "../graphql/operations.js";

const statusColor = {
  COMPLETED: "success",
  FAILED: "error",
  PENDING: "warning",
  REFUNDED: "default",
};

export default function Payments() {
  const { data: payments, loading } = useQuery(PLATFORM_PAYMENTS, {
    variables: { limit: 50 },
  });
  const { data: subs } = useQuery(PLATFORM_SUBSCRIPTIONS, {
    variables: { limit: 30 },
  });

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Pagos y suscripciones
      </Typography>

      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
        Transacciones
      </Typography>
      <Paper variant="outlined">
        {loading ? (
          <Box p={4} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>PayPal ID</TableCell>
                <TableCell>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(payments?.platformPayments?.items ?? []).map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.churchName}</TableCell>
                  <TableCell>
                    {p.currency} {p.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.status}
                      size="small"
                      color={statusColor[p.status] || "default"}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    {p.paypalTransactionId ?? "—"}
                  </TableCell>
                  <TableCell>
                    {p.paidAt
                      ? new Date(p.paidAt).toLocaleString()
                      : new Date(p.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
        Suscripciones activas
      </Typography>
      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Trial / Periodo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(subs?.platformSubscriptions?.items ?? []).map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.churchName}</TableCell>
                <TableCell>{s.plan}</TableCell>
                <TableCell>
                  <Chip label={s.status} size="small" />
                </TableCell>
                <TableCell>
                  {s.trialEndsAt
                    ? `Trial: ${new Date(s.trialEndsAt).toLocaleDateString()}`
                    : s.currentPeriodEnd
                      ? `Hasta ${new Date(s.currentPeriodEnd).toLocaleDateString()}`
                      : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
