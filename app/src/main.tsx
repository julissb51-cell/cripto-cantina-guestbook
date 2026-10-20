import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "@stellar-scaffold/app-lib/styles.css"
import App from "./App.tsx"
import { LocaleProvider } from "./i18n.tsx"
import { NotificationProvider } from "./providers/NotificationProvider.tsx"
import { WalletProvider } from "./providers/WalletProvider.tsx"

// Vite sets BASE_URL from `base` (`/` in dev, `/cripto-cantina-guestbook/` on Pages).
const basename = import.meta.env.BASE_URL.replace(/\/$/, "")

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: false,
		},
	},
})

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<NotificationProvider>
			<QueryClientProvider client={queryClient}>
				<WalletProvider>
					<BrowserRouter basename={basename}>
						<LocaleProvider>
							<App />
						</LocaleProvider>
					</BrowserRouter>
				</WalletProvider>
			</QueryClientProvider>
		</NotificationProvider>
	</StrictMode>,
)
