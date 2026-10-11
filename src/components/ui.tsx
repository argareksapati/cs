import type { ReactNode } from "react";
import type { TicketPriority, TicketStatus } from "@/lib/types";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/lib/types";

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="page-intro">
      <div>
        {eyebrow && <span className="page-intro__eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="page-intro__action">{action}</div>}
    </section>
  );
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={`status-badge status-badge--${status}`}>{STATUS_LABEL[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return <span className={`priority-badge priority-badge--${priority}`}>{PRIORITY_LABEL[priority]}</span>;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <span className={`skeleton ${className}`} aria-hidden />;
}

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
