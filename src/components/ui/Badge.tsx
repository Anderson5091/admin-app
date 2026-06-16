interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  const variants = {
    default: "bg-card text-text-secondary",
    success: "bg-primary-dim text-primary border border-primary-border",
    warning: "bg-warning-dim text-warning border border-warning/30",
    danger: "bg-danger-dim text-danger border border-danger/30",
    info: "bg-secondary-dim text-secondary border border-secondary/30",
    purple: "bg-violet-900/50 text-violet-400 border border-violet-700/30",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
