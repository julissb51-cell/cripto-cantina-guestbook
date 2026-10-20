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
	await page
		.getByRole("button", { name: "Abrir el libro", exact: true })
		.click()
	await expect(page.getByLabel("Tu nota")).toBeVisible()
	await expect(
		page.getByRole("button", { name: "Conecta tu wallet para firmar" }),
	).toBeVisible()
})

test("el idioma se recuerda", async ({ page }) => {
	await page.goto("/")
	await page.getByRole("button", { name: "EN", exact: true }).click()
	await expect(page.locator("html")).toHaveAttribute("lang", "en")
	await expect(
		page.getByRole("heading", { name: "The guestbook of the Cripto Cantina" }),
	).toBeVisible()
	await expect(
		page.getByRole("button", { name: "Connect wallet" }),
	).toBeVisible()
	await page.getByRole("button", { name: "Open the book", exact: true }).click()
	await expect(page.getByLabel("Your note")).toBeVisible()
	await expect(
		page.getByRole("button", { name: "Close the book" }),
	).toBeVisible()
	await page.reload()
	await expect(page.locator("html")).toHaveAttribute("lang", "en")
	await expect(
		page.getByRole("heading", { name: "The guestbook of the Cripto Cantina" }),
	).toBeVisible()
	await page.getByRole("button", { name: "ES", exact: true }).click()
	await expect(page.locator("html")).toHaveAttribute("lang", "es")
	await expect(
		page.getByRole("heading", {
			name: "El libro de visitas de la Cripto Cantina",
		}),
	).toBeVisible()
})
