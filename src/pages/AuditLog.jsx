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
  CircularProgress,
} from "@mui/material";

import { PLATFORM_AUDIT } from "../graphql/operations.js";

export default function AuditLog() {
  const { data, loading } = useQuery(PLATFORM_AUDIT, {
    variables: { limit: 100 },
  });

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Auditoría de plataforma
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Acciones realizadas por operadores internos
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
                <TableCell>Fecha</TableCell>
                <TableCell>Operador</TableCell>
                <TableCell>Acción</TableCell>
                <TableCell>Church ID</TableCell>
                <TableCell>Motivo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.platformAuditLogs?.items ?? []).map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {new Date(row.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{row.actorEmail ?? "—"}</TableCell>
                  <TableCell>{row.action}</TableCell>
                  <TableCell sx={{ fontSize: 11 }}>
                    {row.churchId ?? "—"}
                  </TableCell>
                  <TableCell>{row.reason ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
