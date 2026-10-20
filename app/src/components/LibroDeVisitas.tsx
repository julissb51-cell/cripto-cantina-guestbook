import { shortAddress } from "@stellar-scaffold/app-lib"
import { libroDeVisitas } from "@stellar-scaffold/app-lib/clients"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { useWallet } from "../hooks/useWallet"
import { useLocale, type Copy, type Locale } from "../i18n"
import styles from "./LibroDeVisitas.module.css"

const MAX_BYTES = 140
const CONTRACT_ID = libroDeVisitas.options.contractId
const EXPERT_URL = `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`
const ESTRECHO = "(max-width: 760px)"

type Entrada = {
	autor: string
	mensaje: string
	ledger: number
	timestamp: bigint | number
}

type Hoja =
	| { tipo: "entrada"; entrada: Entrada }
	| { tipo: "firma" }
	| { tipo: "vacia"; vacio: boolean }
	| { tipo: "cargando" }
	| { tipo: "error" }

const bytesDe = (texto: string) => new TextEncoder().encode(texto).length

const indiceDeFirma = (cantidad: number) =>
	cantidad + (cantidad % 2 === 0 ? 1 : 0)

const hojasDe = (entradas: Entrada[] | undefined, error: boolean): Hoja[] => {
	if (entradas) {
		const hojas: Hoja[] = entradas.map((entrada) => ({
			tipo: "entrada",
			entrada,
		}))
		if (entradas.length % 2 === 0) {
			hojas.push({ tipo: "vacia", vacio: entradas.length === 0 })
		}
		hojas.push({ tipo: "firma" })
		return hojas
	}
	if (error) return [{ tipo: "error" }, { tipo: "firma" }]
	return [{ tipo: "cargando" }, { tipo: "firma" }]
}

const fechaDe = (
	timestamp: bigint | number,
	locale: Locale,
	sinFecha: string,
) => {
	const segundos = Number(timestamp)
	if (!Number.isFinite(segundos) || segundos <= 0) return sinFecha
	return new Intl.DateTimeFormat(locale, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(segundos * 1000))
}

const textoDeError = (error: unknown, t: Copy) => {
	if (error && typeof error === "object" && "message" in error) {
		const message = String(error.message)
		return t.errores[message] ?? message
	}
	if (typeof error === "number" || typeof error === "bigint") {
		const codigo = String(error)
		return t.errores[codigo] ?? t.contratoRechazo(codigo)
	}
	if (error instanceof Error && error.message) {
		if (/reject|denied|cancel/i.test(error.message)) return t.walletCancelled
		return error.message
	}
	return t.genericError
}

const useEstrecho = () =>
	useSyncExternalStore(
		(onChange) => {
			const media = window.matchMedia(ESTRECHO)
			media.addEventListener("change", onChange)
			return () => media.removeEventListener("change", onChange)
		},
		() => window.matchMedia(ESTRECHO).matches,
		() => false,
	)

const Emblema = () => (
	<svg className={styles.emblema} viewBox="0 0 80 108" aria-hidden="true">
		<path
			fill="currentColor"
			d="M40 2.2 44.6 14.4 57.2 15 47.6 23.2 51 35.2 40 28.4 29 35.2 32.4 23.2 22.8 15 35.4 14.4Z"
		/>
		<path
			fill="none"
			stroke="currentColor"
			strokeWidth="1.7"
			d="M22 42h36c0 13.6-7 24-18 28C29 66 22 55.6 22 42Z"
		/>
		<path
			fill="currentColor"
			d="M26.8 48.2h26.4c-.7 8-5.4 14.2-13.2 17-7.8-2.8-12.5-9-13.2-17Z"
		/>
		<path
			stroke="currentColor"
			strokeWidth="1.7"
			strokeLinecap="round"
			d="M40 70v16"
		/>
		<path
			stroke="currentColor"
			strokeWidth="1.7"
			strokeLinecap="round"
			d="M27 88.2h26"
		/>
		<path
			fill="currentColor"
			d="M40 93.2 42.1 97.6 46.8 98 43.2 100.8 44.3 105.4 40 102.8 35.7 105.4 36.8 100.8 33.2 98 37.9 97.6Z"
		/>
	</svg>
)

const Titulo = ({ t }: { t: Copy }) => (
	<h1 id="titulo-libro">
		{t.coverTitle} <span className={styles.subtitulo}>{t.coverSubtitle}</span>
	</h1>
)

export const LibroDeVisitas = () => {
	const { address, signTransaction } = useWallet()
	const { locale, t } = useLocale()
	const estrecho = useEstrecho()
	const [abierto, setAbierto] = useState(false)
	const [cursor, setCursor] = useState(0)
	const [giro, setGiro] = useState<"" | "adelante" | "atras">("")
	const [borrador, setBorrador] = useState("")
	const [enviando, setEnviando] = useState(false)
	const [aviso, setAviso] = useState<string>()
	const [exito, setExito] = useState<string>()
	const libroRef = useRef<HTMLDivElement>(null)
	const abrirRef = useRef<HTMLButtonElement>(null)
	const colocado = useRef(false)
	const enElFinal = useRef(true)
	const giroTimer = useRef<number>(0)

	const libro = useQuery({
		queryKey: ["libro-de-visitas", CONTRACT_ID],
		queryFn: async () => {
			const tx = await libroDeVisitas.listar()
			return tx.result as Entrada[]
		},
		refetchInterval: 15_000,
	})

	const hojas = hojasDe(libro.data, libro.isError)
	const cursorSeguro =
		hojas.length === 0 ? 0 : Math.min(cursor, hojas.length - 1)
	const inicio = estrecho ? cursorSeguro : cursorSeguro - (cursorSeguro % 2)
	const visibles = estrecho
		? hojas.slice(inicio, inicio + 1)
		: hojas.slice(inicio, inicio + 2)
	const desde = inicio + 1
	const hasta = estrecho ? desde : Math.min(desde + 1, hojas.length)
	const alInicio = inicio === 0
	const alFinal = inicio + (estrecho ? 1 : 2) >= hojas.length

	const usados = bytesDe(borrador)
	const cabe = usados > 0 && usados <= MAX_BYTES
	const yaFirmo = Boolean(
		address && libro.data?.some((entrada) => entrada.autor === address),
	)
	const medidaEstado =
		usados > MAX_BYTES
			? styles.medidaMal
			: usados > MAX_BYTES * 0.8
				? styles.medidaAviso
				: undefined
	const progreso = Math.min(100, (usados / MAX_BYTES) * 100)

	useEffect(() => {
		if (!abierto || !libro.data) return
		const firma = indiceDeFirma(libro.data.length)
		if (!colocado.current || enElFinal.current) {
			colocado.current = true
			setCursor((actual) => (actual === firma ? actual : firma))
		}
	}, [abierto, libro.data])

	useEffect(() => {
		if (abierto) libroRef.current?.focus()
	}, [abierto])

	useEffect(() => () => window.clearTimeout(giroTimer.current), [])

	const abrir = () => {
		enElFinal.current = true
		setGiro("")
		if (libro.data) {
			colocado.current = true
			setCursor(indiceDeFirma(libro.data.length))
		} else {
			colocado.current = false
			setCursor(1)
		}
		setAbierto(true)
	}

	const cerrar = () => {
		setAbierto(false)
		colocado.current = false
		enElFinal.current = true
		setGiro("")
		window.setTimeout(() => abrirRef.current?.focus(), 0)
	}

	const ir = (direccion: 1 | -1) => {
		const paso = estrecho ? 1 : 2
		const base = estrecho ? cursorSeguro : cursorSeguro - (cursorSeguro % 2)
		const destino = Math.max(
			0,
			Math.min(hojas.length - 1, base + direccion * paso),
		)
		const ajustado = estrecho ? destino : destino - (destino % 2)
		if (ajustado === inicio) return
		enElFinal.current = ajustado + (estrecho ? 1 : 2) >= hojas.length
		setGiro(direccion > 0 ? "adelante" : "atras")
		window.clearTimeout(giroTimer.current)
		giroTimer.current = window.setTimeout(() => setGiro(""), 420)
		setCursor(ajustado)
	}

	const firmar = async () => {
		setAviso(undefined)
		setExito(undefined)
		if (!address) {
			setAviso(t.connectFirst)
			return
		}
		if (yaFirmo) {
			setAviso(t.errores.YaFirmo)
			return
		}
		if (!cabe) {
			setAviso(
				usados === 0 ? t.errores.MensajeVacio : t.errores.MensajeMuyLargo,
			)
			return
		}

		setEnviando(true)
		try {
			const tx = await libroDeVisitas.firmar(
				{ autor: address, mensaje: borrador },
				{ publicKey: address },
			)
			if (tx.result.isErr()) {
				setAviso(textoDeError(tx.result.unwrapErr(), t))
				return
			}

			const enviada = await tx.signAndSend({ signTransaction })
			if (enviada.result.isErr()) {
				setAviso(textoDeError(enviada.result.unwrapErr(), t))
				return
			}

			setBorrador("")
			setExito(t.signed)
			const actualizado = await libro.refetch()
			const total = actualizado.data?.length
			if (typeof total === "number") {
				enElFinal.current = true
				setGiro("adelante")
				setCursor(indiceDeFirma(total))
			}
		} catch (error) {
			setAviso(textoDeError(error, t))
		} finally {
			setEnviando(false)
		}
	}

	const rango =
		desde === hasta
			? t.paginaDe(desde, hojas.length)
			: t.paginasDe(desde, hasta, hojas.length)

	return (
		<div className={styles.escena}>
			{!abierto ? (
				<div className={styles.cerrado}>
					<div
						className={styles.cubierta}
						role="button"
						tabIndex={0}
						onClick={abrir}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault()
								abrir()
							}
						}}
					>
						<Emblema />
						<p className={styles.cubiertaKicker}>{t.coverKicker}</p>
						<Titulo t={t} />
						<span className={styles.filete} aria-hidden="true">
							<i />
						</span>
					</div>
					<button
						ref={abrirRef}
						type="button"
						className={styles.principal}
						onClick={abrir}
					>
						{t.openBook}
					</button>
					<p className={styles.antes}>{t.closedLede}</p>
				</div>
			) : (
				<>
					<div className={styles.tituloAbierto}>
						<Titulo t={t} />
					</div>
					<div
						ref={libroRef}
						className={styles.libroAbierto}
						role="region"
						tabIndex={-1}
						aria-labelledby="titulo-libro"
					>
						<div
							className={`${styles.pliego} ${
								giro === "adelante"
									? styles.giroAdelante
									: giro === "atras"
										? styles.giroAtras
										: ""
							}`}
							key={inicio}
						>
							{visibles.map((hoja, desplazamiento) => (
								<Pagina
									key={`${inicio + desplazamiento}-${hoja.tipo}`}
									hoja={hoja}
									numero={inicio + desplazamiento + 1}
									lado={desplazamiento === 0 ? "izquierda" : "derecha"}
									t={t}
									locale={locale}
									borrador={borrador}
									setBorrador={setBorrador}
									setAviso={setAviso}
									setExito={setExito}
									usados={usados}
									progreso={progreso}
									medidaEstado={medidaEstado}
									yaFirmo={yaFirmo}
									enviando={enviando}
									aviso={aviso}
									exito={exito}
									address={address}
									cabe={cabe}
									onFirmar={() => void firmar()}
									onReintentar={() => void libro.refetch()}
								/>
							))}
						</div>
					</div>
					<nav className={styles.paginacion} aria-label={t.pagination}>
						<button
							type="button"
							className={styles.flecha}
							aria-label={t.prev}
							disabled={alInicio}
							onClick={() => ir(-1)}
						>
							<span aria-hidden="true">←</span>
						</button>
						<p className={styles.rango} aria-live="polite">
							{rango}
							{libro.data ? (
								<span className={styles.cuenta}>
									{t.cuenta(libro.data.length)}
								</span>
							) : null}
						</p>
						<button
							type="button"
							className={styles.flecha}
							aria-label={t.next}
							disabled={alFinal}
							onClick={() => ir(1)}
						>
							<span aria-hidden="true">→</span>
						</button>
						<button type="button" className={styles.cerrar} onClick={cerrar}>
							{t.closeBook}
						</button>
					</nav>
				</>
			)}
		</div>
	)
}

const Pagina = ({
	hoja,
	numero,
	lado,
	t,
	locale,
	borrador,
	setBorrador,
	setAviso,
	setExito,
	usados,
	progreso,
	medidaEstado,
	yaFirmo,
	enviando,
	aviso,
	exito,
	address,
	cabe,
	onFirmar,
	onReintentar,
}: {
	hoja: Hoja
	numero: number
	lado: "izquierda" | "derecha"
	t: Copy
	locale: Locale
	borrador: string
	setBorrador: (valor: string) => void
	setAviso: (valor: string | undefined) => void
	setExito: (valor: string | undefined) => void
	usados: number
	progreso: number
	medidaEstado?: string
	yaFirmo: boolean
	enviando: boolean
	aviso?: string
	exito?: string
	address?: string
	cabe: boolean
	onFirmar: () => void
	onReintentar: () => void
}) => {
	const folio = <p className={styles.folio}>{t.folio(numero)}</p>

	if (hoja.tipo === "cargando") {
		return (
			<article className={`${styles.hoja} ${styles[lado]}`}>
				<p className={styles.estado} role="status">
					{t.loading}
				</p>
				{folio}
			</article>
		)
	}

	if (hoja.tipo === "error") {
		return (
			<article className={`${styles.hoja} ${styles[lado]}`} role="alert">
				<p className={styles.estado}>{t.readError}</p>
				<button
					type="button"
					className={styles.secundario}
					onClick={onReintentar}
				>
					{t.retry}
				</button>
				{folio}
			</article>
		)
	}

	if (hoja.tipo === "vacia") {
		return (
			<article
				className={`${styles.hoja} ${styles[lado]}`}
				aria-label={hoja.vacio ? undefined : t.blankPage}
			>
				{hoja.vacio ? (
					<p className={styles.estado}>{t.empty}</p>
				) : (
					<div className={styles.centro}>
						<span className={styles.ornamento} aria-hidden="true" />
					</div>
				)}
				{folio}
			</article>
		)
	}

	if (hoja.tipo === "entrada") {
		return (
			<article className={`${styles.hoja} ${styles[lado]}`}>
				<blockquote translate="no">{hoja.entrada.mensaje}</blockquote>
				<footer className={styles.rubrica}>
					<span
						className={styles.firmaNombre}
						title={hoja.entrada.autor}
						translate="no"
					>
						{shortAddress(hoja.entrada.autor)}
					</span>
					<span className={styles.cuando}>
						{t.cuando(
							fechaDe(hoja.entrada.timestamp, locale, t.noDate),
							hoja.entrada.ledger,
						)}
					</span>
				</footer>
				{folio}
			</article>
		)
	}

	return (
		<article
			className={`${styles.hoja} ${styles[lado]} ${styles.firma}`}
			aria-labelledby="deja-tu-firma"
		>
			<h2 id="deja-tu-firma">{t.signTitle}</h2>
			<p className={styles.lede}>{t.signLede}</p>
			<label htmlFor="mensaje">{t.noteLabel}</label>
			<textarea
				id="mensaje"
				rows={4}
				value={borrador}
				placeholder={t.notePlaceholder}
				aria-describedby="medida-bytes"
				aria-invalid={usados > MAX_BYTES}
				disabled={enviando || yaFirmo}
				onChange={(event) => {
					setBorrador(event.target.value)
					setAviso(undefined)
					setExito(undefined)
				}}
			/>
			<div className={`${styles.medida} ${medidaEstado ?? ""}`}>
				<div
					className={styles.riel}
					role="meter"
					aria-valuemin={0}
					aria-valuemax={MAX_BYTES}
					aria-valuenow={Math.min(usados, MAX_BYTES)}
					aria-valuetext={t.bytesDe(usados, MAX_BYTES)}
					aria-label={t.bytesLabel}
				>
					<span style={{ width: `${progreso}%` }} />
				</div>
				<p id="medida-bytes" className={styles.contador}>
					{t.contador(usados, MAX_BYTES)}
				</p>
			</div>
			{yaFirmo && (
				<p className={`${styles.banner} ${styles.ya}`} role="status">
					{t.alreadyBanner}
				</p>
			)}
			{usados > MAX_BYTES && !aviso && (
				<p className={`${styles.banner} ${styles.error}`} role="alert">
					{t.tooLongBanner}
				</p>
			)}
			<button
				type="button"
				className={styles.principal}
				aria-busy={enviando}
				disabled={
					enviando || yaFirmo || usados > MAX_BYTES || (!!address && !cabe)
				}
				onClick={onFirmar}
			>
				{enviando
					? t.signing
					: yaFirmo
						? t.alreadyButton
						: address
							? t.signButton
							: t.connectToSign}
			</button>
			{enviando && (
				<p className={`${styles.banner} ${styles.firmando}`} role="status">
					{t.signingStatus}
				</p>
			)}
			{aviso && (
				<p className={`${styles.banner} ${styles.error}`} role="alert">
					{aviso}
				</p>
			)}
			{exito && (
				<p className={`${styles.banner} ${styles.ok}`} role="status">
					{exito}
				</p>
			)}
			<p className={styles.pista}>
				{address ? t.firmasComo(shortAddress(address)) : t.walletHint}
			</p>
			<p className={styles.contrato}>
				{t.contract}{" "}
				<a href={EXPERT_URL} target="_blank" rel="noreferrer">
					<span translate="no">{shortAddress(CONTRACT_ID)}</span>
				</a>
			</p>
			{folio}
		</article>
	)
}
