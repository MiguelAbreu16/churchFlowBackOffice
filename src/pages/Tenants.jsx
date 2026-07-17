import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  MenuItem,
  Stack,
  CircularProgress,
  TablePagination,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

import { PLATFORM_TENANTS } from "../graphql/operations.js";
import { downloadCsv } from "../utils/csv.js";

export default function Tenants() {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 20;

  const { data, loading, refetch } = useQuery(PLATFORM_TENANTS, {
    variables: {
      search: search || undefined,
      plan: plan || undefined,
      status: status || undefined,
      limit: rowsPerPage,
      offset: page * rowsPerPage,
    },
  });

  const connection = data?.platformTenants;
  const items = connection?.items ?? [];

  const exportCsv = () => {
    downloadCsv(
      `tenants-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "id",
        "name",
        "plan",
        "status",
        "users",
        "layouts",
        "subscription",
        "createdAt",
      ],
      items.map((t) => [
        t.id,
        t.name,
        t.plan,
        t.status,
        t.userCount,
        t.layoutCount,
        t.subscriptionStatus ?? "",
        t.createdAt,
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
          Clientes
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportCsv}
          disabled={!items.length}
        >
          Exportar CSV
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Buscar por nombre"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: { sm: 220 }, flex: 1 }}
        />
        <TextField
          select
          size="small"
          label="Plan"
          value={plan}
          onChange={(e) => {
            setPlan(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="FREE">FREE</MenuItem>
          <MenuItem value="STANDARD">STANDARD</MenuItem>
          <MenuItem value="ENTERPRISE">ENTERPRISE</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Estado"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="ACTIVE">ACTIVE</MenuItem>
          <MenuItem value="PAUSED">PAUSED</MenuItem>
          <MenuItem value="SUSPENDED">SUSPENDED</MenuItem>
        </TextField>
        <Button variant="outlined" onClick={() => refetch()}>
          Actualizar
        </Button>
      </Stack>

      <Paper variant="outlined">
        {loading ? (
          <Box p={4} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Iglesia</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Usuarios</TableCell>
                    <TableCell align="right">Layouts</TableCell>
                    <TableCell>Suscripción</TableCell>
                    <TableCell>Alta</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((t) => (
                    <TableRow key={t.id} hover>
                      <TableCell>{t.name}</TableCell>
                      <TableCell>
                        <Chip label={t.plan} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t.status}
                          size="small"
                          color={t.status === "ACTIVE" ? "success" : "default"}
                        />
                      </TableCell>
                      <TableCell align="right">{t.userCount}</TableCell>
                      <TableCell align="right">{t.layoutCount}</TableCell>
                      <TableCell>{t.subscriptionStatus ?? "—"}</TableCell>
                      <TableCell>
                        {new Date(t.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          component={RouterLink}
                          to={`/tenants/${t.id}`}
                          size="small"
                        >
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!items.length && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Typography
                          color="text.secondary"
                          sx={{ py: 3, textAlign: "center" }}
                        >
                          No hay clientes con estos filtros.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={connection?.total ?? 0}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[20]}
            />
          </>
        )}
      </Paper>
    </Box>
  );
}
