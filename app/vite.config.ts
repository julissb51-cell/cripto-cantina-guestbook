import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import wasm from "vite-plugin-wasm"

// Project site: https://julissb51-cell.github.io/cripto-cantina-guestbook/
// `configure-pages` passes the same path as PAGES_BASE in CI. Dev stays at `/`.
const pagesBase = normalizeBase(
	process.env.PAGES_BASE ?? "/cripto-cantina-guestbook",
)

function normalizeBase(raw: string) {
	const value = raw.trim()
	if (value === "" || value === "/") return "/"
	const withSlash = value.startsWith("/") ? value : `/${value}`
	return withSlash.endsWith("/") ? withSlash : `${withSlash}/`
}

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
	base: command === "build" || isPreview ? pagesBase : "/",
	plugins: [
		react(),
		nodePolyfills({
			include: ["buffer"],
			globals: {
				Buffer: true,
			},
		}),
		wasm(),
	],
	build: {
		target: "esnext",
	},
	optimizeDeps: {
		exclude: ["@stellar/stellar-xdr-json"],
	},
	define: {
		global: "window",
	},
	envPrefix: "PUBLIC_",
	server: {
		host: "0.0.0.0",
		port: 43117,
		strictPort: true,
		proxy: {
			"/friendbot": {
				target: "http://localhost:8000/friendbot",
				changeOrigin: true,
			},
		},
	},
}))
