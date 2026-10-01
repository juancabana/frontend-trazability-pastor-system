export interface VisitDetail {
  id: string;
  churchName?: string;
  visitedName: string;
  whatsappPhone?: string;
  visitReason: string;
}

export interface ActivityEntry {
  subcategoryId: string;
  categoryId: string;
  description: string;
  quantity: number;
  hours?: number;
  amount?: number;
  evidenceUrls?: string[];
  /** Detalle de cada visita (solo subcategoría visitación). */
  visits?: VisitDetail[];
  /** @deprecated Formato de una sola visita; solo presente en borradores antiguos. */
  churchName?: string;
  /** @deprecated Formato de una sola visita; solo presente en borradores antiguos. */
  visitedName?: string;
  /** @deprecated Formato de una sola visita; solo presente en borradores antiguos. */
  whatsappPhone?: string;
  /** @deprecated Formato de una sola visita; solo presente en borradores antiguos. */
  visitReason?: string;
}

export interface DailyReport {
  id: string;
  pastorId: string;
  date: string;
  activities: ActivityEntry[];
  observations?: string;
  createdAt: string;
  updatedAt: string;
}
