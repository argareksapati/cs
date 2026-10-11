import { expect, test } from "@playwright/test";

test("dashboard exposes live service overview", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard Customer Service" })).toBeVisible();
  await expect(page.getByText(/(Pratinjau realtime aktif|Realtime Supabase aktif)/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Permohonan & Layanan/ })).toBeVisible();
});

test("filters and updates a ticket", async ({ page }) => {
  await page.goto("/permohonan");
  await expect(page.locator('[data-realtime-ready="true"]')).toBeVisible();
  await page.getByPlaceholder("Cari pemohon / nomor tiket").fill("Asep Sunandar");
  await expect(page.getByText("Asep Sunandar")).toBeVisible();
  await page.getByRole("row").filter({ hasText: "Asep Sunandar" }).getByRole("link", { name: "Proses berkas" }).click();
  await expect(page.getByRole("heading", { name: "Pengajuan Surat Keterangan Domisili Usaha" })).toBeVisible();
  await page.getByLabel("Status permohonan").selectOption("diproses");
  await expect(page.getByLabel("Status permohonan")).toHaveValue("diproses");
  await expect(page.locator(".status-badge")).toHaveText("Sedang Diproses");
});

test("mobile navigation opens", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only behavior");
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Buka menu" }).click();
  await expect(page.getByRole("navigation", { name: "Navigasi utama" })).toBeVisible();
});
