import React, { useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  PLATFORM_SUPPORT_TICKET,
  UPDATE_TICKET_STATUS,
  ADD_TICKET_NOTE,
} from "../graphql/operations.js";

export default function SupportDetail() {
  const { id } = useParams();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

  const { data, loading, refetch } = useQuery(PLATFORM_SUPPORT_TICKET, {
    variables: { id },
  });
  const [updateStatus] = useMutation(UPDATE_TICKET_STATUS);
  const [addNote, { loading: addingNote }] = useMutation(ADD_TICKET_NOTE);

  const ticket = data?.platformSupportTicket;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ticket) {
    return <Typography>Ticket no encontrado</Typography>;
  }

  return (
    <Box>
      <Button
        component={RouterLink}
        to="/support"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Volver
      </Button>

      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <Chip label={ticket.priority} color="warning" size="small" />
        <Chip label={ticket.status} size="small" />
      </Stack>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {ticket.subject}
      </Typography>
      <Typography color="text.secondary" gutterBottom>
        {ticket.churchName} · {new Date(ticket.createdAt).toLocaleString()}
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, my: 2 }}>
        <Typography>{ticket.description}</Typography>
      </Paper>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          select
          size="small"
          label="Cambiar estado"
          value={status || ticket.status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="OPEN">OPEN</MenuItem>
          <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
          <MenuItem value="WAITING_CUSTOMER">WAITING_CUSTOMER</MenuItem>
          <MenuItem value="RESOLVED">RESOLVED</MenuItem>
          <MenuItem value="CLOSED">CLOSED</MenuItem>
        </TextField>
        <Button
          variant="outlined"
          onClick={async () => {
            await updateStatus({
              variables: {
                ticketId: id,
                status: status || ticket.status,
              },
            });
            refetch();
          }}
        >
          Actualizar estado
        </Button>
      </Stack>

      <Typography variant="h6" gutterBottom>
        Notas internas
      </Typography>
      <List dense>
        {(ticket.notes ?? []).map((n) => (
          <ListItem key={n.id} alignItems="flex-start">
            <ListItemText
              primary={n.body}
              secondary={`${n.authorEmail ?? "—"} · ${new Date(n.createdAt).toLocaleString()}`}
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          size="small"
          placeholder="Añadir nota interna…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button
          variant="contained"
          disabled={!note || addingNote}
          onClick={async () => {
            await addNote({
              variables: { ticketId: id, body: note, isInternal: true },
            });
            setNote("");
            refetch();
          }}
        >
          Añadir
        </Button>
      </Stack>
    </Box>
  );
}
