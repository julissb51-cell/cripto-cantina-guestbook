import { NavLink, Outlet, Route, Routes } from "react-router-dom"
import styles from "./App.module.css"
import ConnectAccount from "./components/ConnectAccount"
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

const AppLayout = () => (
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
					Explorador
				</NavLink>
				<a href={EXPERT_URL} target="_blank" rel="noreferrer">
					Contrato
				</a>
			</nav>
			<ConnectAccount />
		</header>

		<main className={styles.main}>
			<Outlet />
		</main>

		<footer className={styles.footer}>
			<p>Una firma por dirección, guardada en Stellar testnet.</p>
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

export default App
