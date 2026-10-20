import type { MouseEvent } from "react"
import { Link, Outlet, Route, Routes, useLocation } from "react-router-dom"
import styles from "./App.module.css"
import { Barril } from "./components/Barril"
import ConnectAccount from "./components/ConnectAccount"
import { useLocale, type Locale } from "./i18n"
import Debug from "./pages/Debug"
import Home from "./pages/Home"

const CONTRACT_ID = "CDYLDNBCQJZZALN4QJRV5YN5MSWOSK6UCLWPA4JY22S3CCDFWNG3VU4K"
const EXPERT_URL = `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`

function App() {
	return (
		<Routes>
			<Route element={<AppLayout />}>
				<Route path="/" element={<Home />} />
				<Route path="/debug" element={<Debug />} />
			</Route>
		</Routes>
	)
}

const ancla =
	(id: string, pathname: string) => (event: MouseEvent<HTMLAnchorElement>) => {
		if (pathname !== "/") return
		const nodo = document.getElementById(id)
		if (!nodo) return
		event.preventDefault()
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
		nodo.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })
	}

const AppLayout = () => {
	const { locale, setLocale, t } = useLocale()
	const { pathname } = useLocation()

	return (
		<div className={styles.AppLayout}>
			<header className={styles.header}>
				<Link to="/" className={styles.logo}>
					<span className={styles.marca} aria-hidden="true">
						<Barril className={styles.ghostR} />
						<Barril className={styles.ghostC} />
						<Barril className={styles.base} />
						<Barril className={styles.slice} />
					</span>
					Cripto Cantina
				</Link>
				<nav className={styles.headerNav}>
					<Link to="/#la-barra" onClick={ancla("la-barra", pathname)}>
						{t.navBarra}
					</Link>
					<Link to="/#el-libro" onClick={ancla("el-libro", pathname)}>
						{t.navLibro}
					</Link>
					<Link to="/#contrato" onClick={ancla("contrato", pathname)}>
						{t.contract}
					</Link>
				</nav>
				<div className={styles.lang} role="group" aria-label={t.language}>
					<LangButton code="es" current={locale} onSelect={setLocale} />
					<span className={styles.langSeparador} aria-hidden="true">
						|
					</span>
					<LangButton code="en" current={locale} onSelect={setLocale} />
				</div>
				<ConnectAccount />
			</header>

			<main className={styles.main}>
				<Outlet />
			</main>

			<footer className={styles.footer}>
				<p>{t.footer}</p>
				<nav className={styles.footerNav}>
					<Link to="/debug">{t.explorer}</Link>
					<a href={EXPERT_URL} target="_blank" rel="noreferrer">
						stellar.expert
					</a>
					<a
						href="https://stellarscaffold.org/docs/quick-start"
						target="_blank"
						rel="noreferrer"
					>
						Scaffold Stellar
					</a>
				</nav>
			</footer>
		</div>
	)
}

const LangButton = ({
	code,
	current,
	onSelect,
}: {
	code: Locale
	current: Locale
	onSelect: (locale: Locale) => void
}) => (
	<button
		type="button"
		aria-pressed={current === code}
		onClick={() => onSelect(code)}
	>
		{code.toUpperCase()}
	</button>
)

export default App
