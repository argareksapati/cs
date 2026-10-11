import { describe, expect, it } from "vitest";
import { initialTickets } from "./demo-data";
import { filterTickets, ticketMetrics } from "./tickets";

describe("ticket filtering", () => {
  it("matches ticket number, service, and status together", () => {
    const result = filterTickets(initialTickets, "REQ-2026-089", "perlu_verifikasi", "domisili");
    expect(result).toHaveLength(1);
    expect(result[0].requester_name).toBe("Asep Sunandar");
  });

  it("searches descriptions case-insensitively", () => {
    expect(filterTickets(initialTickets, "GENANGAN", "semua", "semua")[0].ticket_number).toBe("REQ-2026-088");
  });
});

describe("ticket metrics", () => {
  it("counts active workflow states", () => {
    const metrics = ticketMetrics(initialTickets);
    expect(metrics.total).toBe(initialTickets.length);
    expect(metrics.verification).toBe(2);
    expect(metrics.processing).toBe(2);
    expect(metrics.resolved).toBe(1);
  });
});
