import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import {
  PLATFORM_SUPPORT_TICKETS,
  CREATE_SUPPORT_TICKET,
  PLATFORM_TENANTS,
} from "../graphql/operations.js";

const priorityColor = {
  URGENT: "error",
  HIGH: "warning",
  MEDIUM: "default",
  LOW: "default",
};

const sourceLabel = {
  TENANT_APP: "App",
  LANDING: "Landing",
  PLATFORM: "Interno",
};

export default function Support() {
  const [open, setOpen] = useState(false);
  const [churchId, setChurchId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const { data, loading, refetch } = useQuery(PLATFORM_SUPPORT_TICKETS, {
    variables: {
      limit: 50,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
    },
    fetchPolicy: "cache-and-network",
  });
  const { data: tenantsData } = useQuery(PLATFORM_TENANTS, {
    variables: { limit: 100 },
  });
  const [createTicket, { loading: creating }] = useMutation(CREATE_SUPPORT_TICKET);

  const handleCreate = async () => {
    await createTicket({
      variables: { churchId, subject, description, priority },
    });
    setOpen(false);
    setSubject("");
    setDescription("");
    refetch();
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Soporte
          </Typography>
          <Typography color="text.secondary">
            Tickets de clientes (app, landing e internos)
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <TextField
            select
            size="small"
            label="Estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="OPEN">OPEN</MenuItem>
            <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
            <MenuItem value="WAITING_CUSTOMER">WAITING_CUSTOMER</MenuItem>
            <MenuItem value="RESOLVED">RESOLVED</MenuItem>
            <MenuItem value="CLOSED">CLOSED</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Prioridad"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="URGENT">URGENT</MenuItem>
            <MenuItem value="HIGH">HIGH</MenuItem>
            <MenuItem value="MEDIUM">MEDIUM</MenuItem>
            <MenuItem value="LOW">LOW</MenuItem>
          </TextField>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            Nuevo ticket
          </Button>
        </Stack>
      </Stack>

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
                <TableCell>Asunto</TableCell>
                <TableCell>Origen</TableCell>
                <TableCell>Prioridad</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Actualizado</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.platformSupportTickets?.items ?? []).map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>
                    {t.churchName ||
                      t.reporterSnapshot?.churchName ||
                      t.reporterSnapshot?.email ||
                      "—"}
                  </TableCell>
                  <TableCell>{t.subject}</TableCell>
                  <TableCell>
                    <Chip
                      label={sourceLabel[t.source] || t.source || "—"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t.priority}
                      size="small"
                      color={priorityColor[t.priority] || "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={t.status} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    {new Date(t.updatedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      component={RouterLink}
                      to={`/support/${t.id}`}
                      size="small"
                    >
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nuevo ticket de soporte</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Cliente"
            margin="normal"
            value={churchId}
            onChange={(e) => setChurchId(e.target.value)}
          >
            {(tenantsData?.platformTenants?.items ?? []).map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Asunto"
            margin="normal"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Descripción"
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            select
            fullWidth
            label="Prioridad"
            margin="normal"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <MenuItem value="LOW">LOW</MenuItem>
            <MenuItem value="MEDIUM">MEDIUM</MenuItem>
            <MenuItem value="HIGH">HIGH</MenuItem>
            <MenuItem value="URGENT">URGENT</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={!churchId || !subject || creating}
            onClick={handleCreate}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
