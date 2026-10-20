import { useRef, type CSSProperties } from "react"
import { Link } from "react-router-dom"
import {
	LibroDeVisitas,
	useEntradas,
	type LibroControl,
	type LibroDestino,
} from "../components/LibroDeVisitas"
import { useLocale } from "../i18n"
import styles from "./Home.module.css"

const CONTRACT_ID = "CC3KM7M4JW6ZXSMTF4X77JQP57LIIHQBBBCGPUX7ZAGGR3IWPJA7JCGB"
const EXPERT_URL = `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`
const HERO = `${import.meta.env.BASE_URL}assets/cantina-hero.webp`

const scrollToId = (id: string) => {
	const nodo = document.getElementById(id)
	if (!nodo) return
	const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
	nodo.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })
}

const Lapiz = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinejoin="round"
			d="M4.2 19.8 5 15.2 15.7 4.5a1.6 1.6 0 0 1 2.3 0l1.5 1.5a1.6 1.6 0 0 1 0 2.3L8.8 19l-4.6.8Z"
		/>
		<path
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			d="m13.8 6.4 3.8 3.8"
		/>
	</svg>
)

const Home = () => {
	const { t } = useLocale()
	const libroRef = useRef<LibroControl>(null)
	const libro = useEntradas()
	const total = libro.data?.length

	const irAlLibro = (destino: LibroDestino) => {
		libroRef.current?.abrirEn(destino)
		scrollToId("el-libro")
	}

	return (
		<div className={styles.Home}>
			<section
				className={styles.hero}
				style={{ "--foto": `url("${HERO}")` } as CSSProperties}
			>
				<div className={styles.heroInner}>
					<p className={styles.eyebrow}>{t.kicker}</p>
					<h1>
						<span className={styles.heroCursiva}>{t.heroLead}</span>{" "}
						<span className={styles.heroOro}>{t.heroName}</span>
					</h1>
					<p className={styles.heroLede}>{t.heroLede}</p>
					<div className={styles.heroAcciones}>
						<button type="button" onClick={() => irAlLibro("firma")}>
							{t.signButton}
						</button>
						<button
							type="button"
							className={styles.contorno}
							onClick={() => irAlLibro("firmas")}
						>
							{t.readSignatures}
						</button>
					</div>
					<ul className={styles.stats}>
						<li>
							<span className={styles.statNum}>
								{typeof total === "number" ? total : "–"}
							</span>
							<span>
								{typeof total === "number"
									? t.firmasBarra(total)
									: t.firmasBarra(2)}
							</span>
						</li>
						<li>
							<span className={styles.statNum}>1</span>
							<span>{t.statOne}</span>
						</li>
						<li>
							<span className={styles.statInf} aria-hidden="true">
								∞
							</span>
							<span>{t.statKept}</span>
						</li>
					</ul>
				</div>
			</section>

			<section id="la-barra" className={styles.seccion}>
				<div className={styles.interior}>
					<h2>
						{t.stepsBefore}
						<em>{t.stepsEm}</em>
						{t.stepsAfter}
					</h2>
					<p className={styles.bajada}>{t.stepsLede}</p>
					<div className={styles.pasos}>
						<article className={`${styles.paso} ${styles.pasoCrema}`}>
							<p className={styles.numero}>01</p>
							<h3>{t.step1Title}</h3>
							<p>{t.step1Body}</p>
						</article>
						<article className={`${styles.paso} ${styles.pasoOscuro}`}>
							<p className={`${styles.numero} ${styles.numeroOro}`}>02</p>
							<h3>{t.step2Title}</h3>
							<p>{t.step2Body}</p>
						</article>
						<article className={`${styles.paso} ${styles.pasoVino}`}>
							<div>
								<p className={`${styles.numero} ${styles.numeroOro}`}>03</p>
								<h3>{t.step3Title}</h3>
								<p>{t.step3Body}</p>
							</div>
							<span className={styles.lapiz} aria-hidden="true">
								<Lapiz />
							</span>
						</article>
					</div>
				</div>
			</section>

			<section id="el-libro" className={styles.seccion}>
				<div className={styles.interior}>
					<p className={styles.eyebrow}>{t.bookEyebrow}</p>
					<h2 className={styles.tituloLibro}>{t.bookHeading}</h2>
					{typeof total === "number" ? (
						<p className={styles.cuentaLibro}>
							<span>{total}</span> {t.firmasBarra(total)}
						</p>
					) : (
						<p className={styles.cuentaLibro}>{t.loading}</p>
					)}
					<LibroDeVisitas ref={libroRef} />
				</div>
			</section>

			<section id="contrato" className={styles.seccion}>
				<div className={`${styles.interior} ${styles.contrato}`}>
					<p className={styles.eyebrow}>{t.bookEyebrow}</p>
					<h2>{t.contractHeading}</h2>
					<p className={styles.bajada}>{t.contractLede}</p>
					<code translate="no">{CONTRACT_ID}</code>
					<div className={styles.contratoLinks}>
						<a href={EXPERT_URL} target="_blank" rel="noreferrer">
							{t.viewContract}
						</a>
						<Link to="/debug">{t.explorer}</Link>
					</div>
				</div>
			</section>
		</div>
	)
}

export default Home
