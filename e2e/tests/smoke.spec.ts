import { expect, test } from "@playwright/test"

test("la página de la cantina carga", async ({ page }) => {
	const response = await page.goto("/")
	expect(response?.ok()).toBeTruthy()
	await expect(
		page.getByRole("heading", {
			name: "El libro de visitas de la Cripto Cantina",
		}),
	).toBeVisible()
})

test("el botón de conectar está presente", async ({ page }) => {
	await page.goto("/")
	await expect(page.getByRole("button", { name: /conectar/i })).toBeVisible()
})

test("el formulario del libro está presente", async ({ page }) => {
	await page.goto("/")
	await expect(page.getByLabel("Tu nota")).toBeVisible()
	await expect(
		page.getByRole("button", { name: "Conecta tu wallet para firmar" }),
	).toBeVisible()
})
