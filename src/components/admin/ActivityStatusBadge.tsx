// Estados válidos
type ActivityStatus = "success" | "warning" | "info";

interface ActivityStatusBadgeProps {
  status: ActivityStatus | string; // permitimos strings para evitar un error
}

// configuración
const STATUS_CONFIG = {
  success: { label: "Completado", classes: "bg-green-100 text-green-700" },
  warning: { label: "Pendiente", classes: "bg-yellow-100 text-yellow-700" },
  info: { label: "Info", classes: "bg-blue-100 text-blue-700" },
} as const;

export function ActivityStatusBadge ({ status }: ActivityStatusBadgeProps) {
  // obtenemos la configuración
  const config = STATUS_CONFIG[status as ActivityStatus] || {
    label: status,
    classes: "bg-gray-100 text-gray-700"
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
}