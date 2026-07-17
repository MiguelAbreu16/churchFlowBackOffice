import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

import {
  PLATFORM_PAYMENTS,
  PLATFORM_SUBSCRIPTIONS,
} from "../graphql/operations.js";
import { downloadCsv } from "../utils/csv.js";

const statusColor = {
  COMPLETED: "success",
  FAILED: "error",
  PENDING: "warning",
  REFUNDED: "default",
};

export default function Payments() {
  const [status, setStatus] = useState("");
  const { data: payments, loading, refetch } = useQuery(PLATFORM_PAYMENTS, {
    variables: { limit: 50, status: status || undefined },
  });
  const { data: subs, refetch: refetchSubs } = useQuery(PLATFORM_SUBSCRIPTIONS, {
    variables: { limit: 30 },
  });

  const paymentItems = payments?.platformPayments?.items ?? [];
  const subItems = subs?.platformSubscriptions?.items ?? [];

  const exportPayments = () => {
    downloadCsv(
      `payments-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "id",
        "churchId",
        "churchName",
        "amount",
        "currency",
        "status",
        "paypalTransactionId",
        "paidAt",
        "createdAt",
      ],
      paymentItems.map((p) => [
        p.id,
        p.churchId,
        p.churchName,
        p.amount,
        p.currency,
        p.status,
        p.paypalTransactionId ?? "",
        p.paidAt ?? "",
        p.createdAt,
      ]),
    );
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Typography variant="h4" fontWeight={800}>
          Pagos y suscripciones
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => {
              refetch();
              refetchSubs();
            }}
          >
            Actualizar
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportPayments}
            disabled={!paymentItems.length}
          >
            CSV
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label="Estado pago"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="COMPLETED">COMPLETED</MenuItem>
          <MenuItem value="FAILED">FAILED</MenuItem>
          <MenuItem value="PENDING">PENDING</MenuItem>
          <MenuItem value="REFUNDED">REFUNDED</MenuItem>
        </TextField>
      </Stack>

      <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
        Transacciones
      </Typography>
      <Paper variant="outlined">
        {loading ? (
          <Box p={4} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
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
                {paymentItems.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Button
                        component={RouterLink}
                        to={`/tenants/${p.churchId}`}
                        size="small"
                        sx={{ textTransform: "none" }}
                      >
                        {p.churchName}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {p.currency} {Number(p.amount).toFixed(2)}
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
                {!paymentItems.length && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography
                        color="text.secondary"
                        sx={{ py: 3, textAlign: "center" }}
                      >
                        Sin transacciones para este filtro.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
        Suscripciones
      </Typography>
      <Paper variant="outlined">
        <TableContainer sx={{ overflowX: "auto" }}>
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
              {subItems.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Button
                      component={RouterLink}
                      to={`/tenants/${s.churchId}`}
                      size="small"
                      sx={{ textTransform: "none" }}
                    >
                      {s.churchName}
                    </Button>
                  </TableCell>
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
        </TableContainer>
      </Paper>
    </Box>
  );
}
