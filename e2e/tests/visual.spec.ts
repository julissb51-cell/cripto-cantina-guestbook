import { expect, test } from "@playwright/test"

test("la portada muestra el libro y la red", async ({ page }) => {
	await page.goto("/")
	await expect(page.getByRole("button", { name: /conectar/i })).toBeVisible()
	await expect(
		page.getByRole("heading", { name: "El libro", exact: true }),
	).toBeVisible()
	await expect(page.getByText("Testnet").first()).toBeVisible()
})
