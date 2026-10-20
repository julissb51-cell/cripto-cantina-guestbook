import { NavLink, Outlet, Route, Routes } from "react-router-dom"
import styles from "./App.module.css"
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

const AppLayout = () => {
	const { locale, setLocale, t } = useLocale()

	return (
		<div className={styles.AppLayout}>
			<header className={styles.header}>
				<NavLink to="/" className={styles.logo}>
					Cripto Cantina
				</NavLink>
				<nav className={styles.headerNav}>
					<NavLink
						to="/debug"
						className={({ isActive }) => (isActive ? styles.active : "")}
					>
						{t.explorer}
					</NavLink>
					<a href={EXPERT_URL} target="_blank" rel="noreferrer">
						{t.contract}
					</a>
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
