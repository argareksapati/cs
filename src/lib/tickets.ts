import type { Ticket, TicketStatus } from "./types";

export function filterTickets(
  tickets: Ticket[],
  query: string,
  status: TicketStatus | "semua",
  service: string,
) {
  const needle = query.trim().toLocaleLowerCase("id");
  return tickets.filter((ticket) => {
    const matchesStatus = status === "semua" || ticket.status === status;
    const matchesService = service === "semua" || ticket.category_slug === service;
    const matchesQuery =
      !needle ||
      [
        ticket.ticket_number,
        ticket.requester_name,
        ticket.requester_nik,
        ticket.subject,
        ticket.description,
      ].some((value) => value.toLocaleLowerCase("id").includes(needle));
    return matchesStatus && matchesService && matchesQuery;
  });
}

export function ticketMetrics(tickets: Ticket[]) {
  return {
    verification: tickets.filter((ticket) => ticket.status === "perlu_verifikasi").length,
    processing: tickets.filter((ticket) =>
      ["diproses", "menunggu_warga"].includes(ticket.status),
    ).length,
    resolved: tickets.filter((ticket) => ticket.status === "selesai").length,
    total: tickets.length,
  };
}
