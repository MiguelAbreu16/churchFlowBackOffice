import React, { useEffect, useState } from "react";
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
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  PLATFORM_SUPPORT_TICKET,
  PLATFORM_SUPPORT_TICKETS,
  UPDATE_TICKET_STATUS,
  ADD_TICKET_NOTE,
  SUPPORT_NOTE_ADDED_SUBSCRIPTION,
  SUPPORT_TICKET_UPDATED_SUBSCRIPTION,
} from "../graphql/operations.js";
import { client } from "../apollo.js";

const sourceLabel = {
  TENANT_APP: "App iglesia",
  LANDING: "Landing /contacto",
  PLATFORM: "BackOffice (interno)",
};

function SnapshotField({ label, value }) {
  if (!value) return null;
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function SupportDetail() {
  const { id } = useParams();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

  const { data, loading, refetch, subscribeToMore } = useQuery(
    PLATFORM_SUPPORT_TICKET,
    {
      variables: { id },
    },
  );
  const [updateStatus] = useMutation(UPDATE_TICKET_STATUS);
  const [addNote, { loading: addingNote }] = useMutation(ADD_TICKET_NOTE);

  useEffect(() => {
    if (!id) return undefined;
    const unsubNotes = subscribeToMore({
      document: SUPPORT_NOTE_ADDED_SUBSCRIPTION,
      variables: { ticketId: id },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const note = subscriptionData.data.supportNoteAdded;
        const ticket = prev.platformSupportTicket;
        if (!note?.id || !ticket) return prev;
        if ((ticket.notes ?? []).some((n) => n.id === note.id)) return prev;
        return {
          ...prev,
          platformSupportTicket: {
            ...ticket,
            notes: [...(ticket.notes ?? []), note],
            updatedAt: new Date().toISOString(),
          },
        };
      },
    });
    const unsubStatus = subscribeToMore({
      document: SUPPORT_TICKET_UPDATED_SUBSCRIPTION,
      variables: { ticketId: id },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const update = subscriptionData.data.supportTicketUpdated;
        const ticket = prev.platformSupportTicket;
        if (!update?.id || !ticket) return prev;
        return {
          ...prev,
          platformSupportTicket: {
            ...ticket,
            status: update.status ?? ticket.status,
            updatedAt: update.updatedAt ?? ticket.updatedAt,
          },
        };
      },
    });
    return () => {
      unsubNotes?.();
      unsubStatus?.();
    };
  }, [id, subscribeToMore]);

  const ticket = data?.platformSupportTicket;
  const snap = ticket?.reporterSnapshot;

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

      <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
        <Chip label={ticket.priority} color="warning" size="small" />
        <Chip label={ticket.status} size="small" />
        <Chip
          label={sourceLabel[ticket.source] || ticket.source}
          size="small"
          variant="outlined"
        />
      </Stack>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {ticket.subject}
      </Typography>
      <Typography color="text.secondary" gutterBottom>
        {ticket.churchName || snap?.churchName || "Sin iglesia vinculada"} ·{" "}
        {new Date(ticket.createdAt).toLocaleString()}
      </Typography>

      <Grid container spacing={2} sx={{ my: 1 }}>
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle2" gutterBottom>
              Descripción
            </Typography>
            <Typography sx={{ whiteSpace: "pre-wrap" }}>
              {ticket.description}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle2" gutterBottom>
              Cliente
            </Typography>
            <SnapshotField label="Nombre" value={snap?.name} />
            <SnapshotField label="Email" value={snap?.email} />
            <SnapshotField label="Rol" value={snap?.role} />
            <SnapshotField
              label="Iglesia"
              value={snap?.churchName || ticket.churchName}
            />
            <SnapshotField label="Plan" value={snap?.plan} />
            <SnapshotField label="Estado tenant" value={snap?.churchStatus} />
            <SnapshotField label="Interés de plan" value={snap?.planInterest} />
            <SnapshotField label="URL" value={snap?.pageUrl} />
            <SnapshotField label="User-Agent" value={snap?.userAgent} />
            <SnapshotField
              label="Enviado"
              value={
                snap?.submittedAt
                  ? new Date(snap.submittedAt).toLocaleString()
                  : null
              }
            />
            {!snap && (
              <Typography variant="body2" color="text.secondary">
                Sin snapshot de cliente (ticket antiguo o interno).
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {(ticket.attachments?.length ?? 0) > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Adjuntos
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {ticket.attachments.map((att, idx) => (
              <Box
                key={`${att.name}-${idx}`}
                component="a"
                href={att.dataUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: "block" }}
              >
                <Box
                  component="img"
                  src={att.dataUrl}
                  alt={att.name}
                  sx={{
                    width: 140,
                    height: 140,
                    objectFit: "cover",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                />
                <Typography variant="caption" display="block" noWrap>
                  {att.name}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

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
              refetchQueries: [
                { query: PLATFORM_SUPPORT_TICKET, variables: { id } },
                { query: PLATFORM_SUPPORT_TICKETS, variables: { limit: 50 } },
              ],
              awaitRefetchQueries: true,
            });
            // Evict list queries (incl. filtered) so Volver always shows fresh status
            client.cache.evict({ fieldName: "platformSupportTickets" });
            client.cache.gc();
            await refetch();
          }}
        >
          Actualizar estado
        </Button>
      </Stack>

      <Typography variant="h6" gutterBottom>
        Conversación
      </Typography>
      <List dense sx={{ mb: 1 }}>
        {(ticket.notes ?? []).length === 0 && (
          <ListItem>
            <ListItemText
              primary="Sin mensajes aún"
              secondary="Responde al cliente o deja una nota interna"
            />
          </ListItem>
        )}
        {(ticket.notes ?? []).map((n) => (
          <ListItem
            key={n.id}
            alignItems="flex-start"
            sx={{
              bgcolor: n.isInternal ? "action.hover" : "transparent",
              borderRadius: 1,
              mb: 0.5,
            }}
          >
            <ListItemText
              primary={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {n.body}
                  </Typography>
                  <Chip
                    size="small"
                    label={
                      n.isInternal
                        ? "Interna"
                        : n.authorRole === "TENANT"
                          ? "Cliente"
                          : "Al cliente"
                    }
                    color={
                      n.isInternal
                        ? "default"
                        : n.authorRole === "TENANT"
                          ? "info"
                          : "success"
                    }
                    variant={n.isInternal ? "outlined" : "filled"}
                  />
                </Stack>
              }
              secondary={`${n.authorName || n.authorEmail || "—"} · ${new Date(n.createdAt).toLocaleString()}`}
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Stack spacing={1}>
        <TextField
          fullWidth
          size="small"
          multiline
          minRows={2}
          placeholder="Escribe un mensaje…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            variant="outlined"
            disabled={!note || addingNote}
            onClick={async () => {
              await addNote({
                variables: { ticketId: id, body: note, isInternal: true },
                refetchQueries: [
                  { query: PLATFORM_SUPPORT_TICKET, variables: { id } },
                ],
                awaitRefetchQueries: true,
              });
              setNote("");
              client.cache.evict({ fieldName: "platformSupportTickets" });
              client.cache.gc();
              await refetch();
            }}
          >
            Nota interna
          </Button>
          <Button
            variant="contained"
            disabled={!note || addingNote}
            onClick={async () => {
              await addNote({
                variables: { ticketId: id, body: note, isInternal: false },
                refetchQueries: [
                  { query: PLATFORM_SUPPORT_TICKET, variables: { id } },
                ],
                awaitRefetchQueries: true,
              });
              setNote("");
              client.cache.evict({ fieldName: "platformSupportTickets" });
              client.cache.gc();
              await refetch();
            }}
          >
            Responder al cliente
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
