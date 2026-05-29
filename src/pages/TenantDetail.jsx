import React, { useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Stack,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  PLATFORM_TENANT,
  UPDATE_TENANT_PLAN,
  PAUSE_TENANT,
  RESUME_TENANT,
  EXTEND_TRIAL,
  PLATFORM_FEATURE_FLAGS,
  SET_FEATURE_FLAG,
  DELETE_FEATURE_FLAG,
  START_IMPERSONATION,
} from "../graphql/operations.js";

export default function TenantDetail() {
  const { id } = useParams();
  const [planDialog, setPlanDialog] = useState(false);
  const [trialDialog, setTrialDialog] = useState(false);
  const [newPlan, setNewPlan] = useState("STANDARD");
  const [reason, setReason] = useState("");
  const [trialDays, setTrialDays] = useState(14);
  const [flagKey, setFlagKey] = useState("");
  const [flagValue, setFlagValue] = useState("true");

  const { data, loading, refetch } = useQuery(PLATFORM_TENANT, {
    variables: { id },
  });
  const { data: flagsData, refetch: refetchFlags } = useQuery(
    PLATFORM_FEATURE_FLAGS,
    { variables: { churchId: id } },
  );

  const [updatePlan, { loading: savingPlan }] = useMutation(UPDATE_TENANT_PLAN);
  const [pauseTenant, { loading: pausing }] = useMutation(PAUSE_TENANT);
  const [resumeTenant, { loading: resuming }] = useMutation(RESUME_TENANT);
  const [extendTrial, { loading: extending }] = useMutation(EXTEND_TRIAL);
  const [setFlag] = useMutation(SET_FEATURE_FLAG);
  const [deleteFlag] = useMutation(DELETE_FEATURE_FLAG);
  const [impersonate] = useMutation(START_IMPERSONATION);

  const t = data?.platformTenant;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!t) {
    return <Alert severity="error">Cliente no encontrado</Alert>;
  }

  const handlePlanSave = async () => {
    await updatePlan({
      variables: { churchId: id, plan: newPlan, reason },
    });
    setPlanDialog(false);
    setReason("");
    refetch();
  };

  const handleTrial = async () => {
    await extendTrial({
      variables: { churchId: id, days: trialDays, reason },
    });
    setTrialDialog(false);
    setReason("");
    refetch();
  };

  return (
    <Box>
      <Button
        component={RouterLink}
        to="/tenants"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Volver
      </Button>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {t.name}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip label={t.plan} color="primary" />
            <Chip
              label={t.status}
              color={t.status === "ACTIVE" ? "success" : "warning"}
            />
          </Stack>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="outlined" onClick={() => setPlanDialog(true)}>
            Cambiar plan
          </Button>
          <Button variant="outlined" onClick={() => setTrialDialog(true)}>
            Extender trial
          </Button>
          {t.status === "ACTIVE" ? (
            <Button
              color="warning"
              variant="outlined"
              disabled={pausing}
              onClick={async () => {
                const r = prompt("Motivo de pausa:");
                if (!r) return;
                await pauseTenant({
                  variables: { churchId: id, reason: r },
                });
                refetch();
              }}
            >
              Pausar
            </Button>
          ) : (
            <Button
              color="success"
              variant="outlined"
              disabled={resuming}
              onClick={async () => {
                const r = prompt("Motivo de reactivación:");
                if (!r) return;
                await resumeTenant({
                  variables: { churchId: id, reason: r },
                });
                refetch();
              }}
            >
              Reanudar
            </Button>
          )}
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Uso
            </Typography>
            <Typography>Usuarios: {t.userCount}</Typography>
            <Typography>Layouts: {t.layoutCount}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Alta: {new Date(t.createdAt).toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Suscripción
            </Typography>
            {t.subscription ? (
              <>
                <Typography>Estado: {t.subscription.status}</Typography>
                {t.subscription.trialEndsAt && (
                  <Typography variant="body2">
                    Trial hasta:{" "}
                    {new Date(t.subscription.trialEndsAt).toLocaleDateString()}
                  </Typography>
                )}
              </>
            ) : (
              <Typography color="text.secondary">Sin registro</Typography>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary">
              ID
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
              {t.id}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Usuarios
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(t.users ?? []).map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={async () => {
                      const r = prompt(
                        "Motivo de impersonación (queda en auditoría):",
                      );
                      if (!r) return;
                      const { data: imp } = await impersonate({
                        variables: {
                          churchId: id,
                          userId: u.id,
                          reason: r,
                        },
                      });
                      window.open(imp.startImpersonation.loginUrl, "_blank");
                    }}
                  >
                    Entrar como
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Feature flags
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
          <TextField
            size="small"
            label="Clave"
            placeholder="ej. layout_builder_v2"
            value={flagKey}
            onChange={(e) => setFlagKey(e.target.value)}
          />
          <TextField
            size="small"
            label="Valor"
            value={flagValue}
            onChange={(e) => setFlagValue(e.target.value)}
          />
          <Button
            variant="contained"
            size="small"
            disabled={!flagKey}
            onClick={async () => {
              const r = prompt("Motivo:");
              if (!r) return;
              await setFlag({
                variables: {
                  churchId: id,
                  key: flagKey,
                  value: flagValue,
                  reason: r,
                },
              });
              setFlagKey("");
              refetchFlags();
            }}
          >
            Guardar flag
          </Button>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Clave</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {(flagsData?.platformFeatureFlags ?? []).map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.key}</TableCell>
                <TableCell>{f.value}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    color="error"
                    onClick={async () => {
                      const r = prompt("Motivo de eliminación:");
                      if (!r) return;
                      await deleteFlag({
                        variables: { flagId: f.id, reason: r },
                      });
                      refetchFlags();
                    }}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Pagos recientes
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Monto</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(t.recentPayments ?? []).map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.currency} {p.amount}
                </TableCell>
                <TableCell>{p.status}</TableCell>
                <TableCell>
                  {p.paidAt
                    ? new Date(p.paidAt).toLocaleString()
                    : new Date(p.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={planDialog} onClose={() => setPlanDialog(false)} fullWidth>
        <DialogTitle>Cambiar plan</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Plan"
            margin="normal"
            value={newPlan}
            onChange={(e) => setNewPlan(e.target.value)}
          >
            <MenuItem value="FREE">FREE</MenuItem>
            <MenuItem value="STANDARD">STANDARD</MenuItem>
            <MenuItem value="ENTERPRISE">ENTERPRISE</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Motivo (auditoría)"
            margin="normal"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlanDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={!reason || savingPlan}
            onClick={handlePlanSave}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={trialDialog}
        onClose={() => setTrialDialog(false)}
        fullWidth
      >
        <DialogTitle>Extender periodo de prueba</DialogTitle>
        <DialogContent>
          <TextField
            type="number"
            fullWidth
            label="Días"
            margin="normal"
            value={trialDays}
            onChange={(e) => setTrialDays(parseInt(e.target.value, 10))}
          />
          <TextField
            fullWidth
            label="Motivo"
            margin="normal"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrialDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={!reason || extending}
            onClick={handleTrial}
          >
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
