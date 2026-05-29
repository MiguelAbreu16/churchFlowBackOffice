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

import { PLATFORM_PLANS } from "../graphql/operations.js";

export default function Plans() {
  const { data, loading } = useQuery(PLATFORM_PLANS);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Catálogo de planes
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Límites y precios sincronizados con la plataforma
      </Typography>

      <Paper variant="outlined">
        {loading ? (
          <Box p={4} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Plan</TableCell>
                <TableCell>Mensual</TableCell>
                <TableCell>Anual</TableCell>
                <TableCell>Layouts</TableCell>
                <TableCell>Asientos/layout</TableCell>
                <TableCell>Usuarios</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.platformPlanCatalog ?? []).map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Typography fontWeight={600}>{p.name}</Typography>
                    <Chip label={p.planCode} size="small" sx={{ mt: 0.5 }} />
                  </TableCell>
                  <TableCell>${p.priceMonthly}</TableCell>
                  <TableCell>${p.priceAnnual}</TableCell>
                  <TableCell>{p.maxLayouts}</TableCell>
                  <TableCell>{p.maxSeatsPerLayout}</TableCell>
                  <TableCell>{p.maxUsers}</TableCell>
                  <TableCell>
                    <Chip
                      label={p.isActive ? "Activo" : "Inactivo"}
                      color={p.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
