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

import { PLATFORM_TENANTS } from "../graphql/operations.js";

export default function Tenants() {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 20;

  const { data, loading, refetch } = useQuery(PLATFORM_TENANTS, {
    variables: {
      search: search || undefined,
      plan: plan || undefined,
      limit: rowsPerPage,
      offset: page * rowsPerPage,
    },
  });

  const connection = data?.platformTenants;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Clientes
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Buscar por nombre"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 220 }}
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
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="FREE">FREE</MenuItem>
          <MenuItem value="STANDARD">STANDARD</MenuItem>
          <MenuItem value="ENTERPRISE">ENTERPRISE</MenuItem>
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
                {(connection?.items ?? []).map((t) => (
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
              </TableBody>
            </Table>
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
