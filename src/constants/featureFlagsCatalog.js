/**
 * Catálogo de feature flags soportadas por plataforma.
 * Clave = lo que se guarda en BD; label = texto en el selector.
 */
export const PLATFORM_FEATURE_FLAG_CATALOG = [
  {
    key: "runtime_map_v2",
    label: "Mapa en vivo V2 (canvas)",
    description: "Usa RuntimeCanvasMap en dashboard/terminal en lugar del SeatMap legacy.",
    defaultValue: "true",
  },
  {
    key: "layout_builder_v2",
    label: "Layout Builder V2",
    description: "Habilita el constructor de planos avanzado para esta iglesia.",
    defaultValue: "true",
  },
  {
    key: "parking_module",
    label: "Módulo de estacionamiento",
    description: "Muestra y permite operar el módulo de parking.",
    defaultValue: "true",
  },
  {
    key: "events_tickets",
    label: "Eventos y boletos",
    description: "Habilita gestión de eventos, tickets y check-in.",
    defaultValue: "true",
  },
  {
    key: "analytics_panel",
    label: "Panel de analítica",
    description: "Muestra métricas y tendencias históricas.",
    defaultValue: "true",
  },
];

export const FEATURE_FLAG_VALUES = [
  { value: "true", label: "Activado (true)" },
  { value: "false", label: "Desactivado (false)" },
];

export function flagLabel(key) {
  return (
    PLATFORM_FEATURE_FLAG_CATALOG.find((f) => f.key === key)?.label || key
  );
}
