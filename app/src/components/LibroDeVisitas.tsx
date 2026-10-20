import { shortAddress } from "@stellar-scaffold/app-lib"
import { libroDeVisitas } from "@stellar-scaffold/app-lib/clients"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useWallet } from "../hooks/useWallet"
import styles from "./LibroDeVisitas.module.css"

const MAX_BYTES = 140
const CONTRACT_ID = libroDeVisitas.options.contractId
const EXPERT_URL = `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`

type Entrada = {
	autor: string
	mensaje: string
	ledger: number
	timestamp: bigint | number
}

const ERRORES: Record<string, string> = {
	YaFirmo:
		"Ya firmaste. En la Cripto Cantina cada dirección deja una sola nota.",
	MensajeVacio: "Escribe algo antes de firmar. La página en blanco no cuenta.",
	MensajeMuyLargo: "Esa nota no cabe. El libro solo acepta 140 bytes.",
	"1": "Ya firmaste. En la Cripto Cantina cada dirección deja una sola nota.",
	"2": "Escribe algo antes de firmar. La página en blanco no cuenta.",
	"3": "Esa nota no cabe. El libro solo acepta 140 bytes.",
}

const bytesDe = (texto: string) => new TextEncoder().encode(texto).length

const fechaDe = (timestamp: bigint | number) => {
	const segundos = Number(timestamp)
	if (!Number.isFinite(segundos) || segundos <= 0) return "sin fecha"
	return new Intl.DateTimeFormat("es", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(segundos * 1000))
}

const textoDeError = (error: unknown) => {
	if (error && typeof error === "object" && "message" in error) {
		const message = String(error.message)
		return ERRORES[message] ?? message
	}
	if (typeof error === "number" || typeof error === "bigint") {
		return ERRORES[String(error)] ?? `El contrato rechazó la firma (${error}).`
	}
	if (error instanceof Error && error.message) {
		if (/reject|denied|cancel/i.test(error.message)) {
			return "La wallet canceló la firma."
		}
		return error.message
	}
	return "No se pudo dejar la firma. Inténtalo de nuevo."
}

export const LibroDeVisitas = () => {
	const { address, signTransaction } = useWallet()
	const [borrador, setBorrador] = useState("")
	const [enviando, setEnviando] = useState(false)
	const [aviso, setAviso] = useState<string>()
	const [exito, setExito] = useState<string>()

	const libro = useQuery({
		queryKey: ["libro-de-visitas", CONTRACT_ID],
		queryFn: async () => {
			const tx = await libroDeVisitas.listar()
			return tx.result as Entrada[]
		},
		refetchInterval: 15_000,
	})

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

	const firmar = async () => {
		setAviso(undefined)
		setExito(undefined)
		if (!address) {
			setAviso("Conecta tu wallet para dejar una firma.")
			return
		}
		if (yaFirmo) {
			setAviso(ERRORES.YaFirmo)
			return
		}
		if (!cabe) {
			setAviso(usados === 0 ? ERRORES.MensajeVacio : ERRORES.MensajeMuyLargo)
			return
		}

		setEnviando(true)
		try {
			const tx = await libroDeVisitas.firmar(
				{ autor: address, mensaje: borrador },
				{ publicKey: address },
			)
			if (tx.result.isErr()) {
				setAviso(textoDeError(tx.result.unwrapErr()))
				return
			}

			const enviada = await tx.signAndSend({ signTransaction })
			if (enviada.result.isErr()) {
				setAviso(textoDeError(enviada.result.unwrapErr()))
				return
			}

			setBorrador("")
			setExito("Tu firma ya está en el libro.")
			await libro.refetch()
		} catch (error) {
			setAviso(textoDeError(error))
		} finally {
			setEnviando(false)
		}
	}

	return (
		<div className={styles.layout}>
			<section
				className={`${styles.pagina} ${styles.firma}`}
				aria-labelledby="deja-tu-firma"
			>
				<h2 id="deja-tu-firma">Deja tu firma</h2>
				<p className={styles.lede}>
					Una dirección, un mensaje. La wallet lo autoriza y el contrato lo
					guarda para siempre en esta instancia.
				</p>
				<label htmlFor="mensaje">Tu nota</label>
				<textarea
					id="mensaje"
					rows={4}
					value={borrador}
					placeholder="La primera ronda va por la casa."
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
						aria-valuetext={`${usados} de ${MAX_BYTES} bytes`}
						aria-label="Bytes del mensaje"
					>
						<span style={{ width: `${progreso}%` }} />
					</div>
					<p id="medida-bytes" className={styles.contador}>
						{usados} / {MAX_BYTES} bytes
					</p>
				</div>
				{yaFirmo && (
					<p className={`${styles.banner} ${styles.ya}`} role="status">
						Ya firmaste. En la Cripto Cantina cada dirección deja una sola nota.
					</p>
				)}
				{usados > MAX_BYTES && !aviso && (
					<p className={`${styles.banner} ${styles.error}`} role="alert">
						Esa nota no cabe. El libro solo acepta 140 bytes.
					</p>
				)}
				<button
					type="button"
					className={styles.principal}
					aria-busy={enviando}
					disabled={
						enviando || yaFirmo || usados > MAX_BYTES || (!!address && !cabe)
					}
					onClick={() => void firmar()}
				>
					{enviando
						? "Firmando…"
						: yaFirmo
							? "Ya firmaste"
							: address
								? "Firmar el libro"
								: "Conecta tu wallet para firmar"}
				</button>
				{enviando && (
					<p className={`${styles.banner} ${styles.firmando}`} role="status">
						Firmando… confirma la operación en tu billetera.
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
					{address
						? `Firmas como ${shortAddress(address)}.`
						: "Freighter y las demás wallets de Stellar Wallets Kit sirven."}
				</p>
				<p className={styles.contrato}>
					Contrato{" "}
					<a href={EXPERT_URL} target="_blank" rel="noreferrer">
						{shortAddress(CONTRACT_ID)}
					</a>
				</p>
			</section>

			<section className={styles.libro} aria-labelledby="el-libro">
				<header className={styles.libroHeader}>
					<p className={styles.kicker}>Testnet</p>
					<h2 id="el-libro">El libro</h2>
					<p>
						{libro.data
							? `${libro.data.length} ${libro.data.length === 1 ? "firma" : "firmas"} en la barra`
							: "Las firmas viven en el contrato."}
					</p>
				</header>

				<div className={styles.cuerpo}>
					{libro.isPending && (
						<p className={`${styles.pagina} ${styles.estado}`} role="status">
							Pasando las páginas…
						</p>
					)}
					{libro.isError && (
						<div className={`${styles.pagina} ${styles.alerta}`} role="alert">
							<p>No pudimos leer el libro en testnet.</p>
							<button
								type="button"
								className={styles.secundario}
								onClick={() => void libro.refetch()}
							>
								Reintentar
							</button>
						</div>
					)}
					{libro.data && libro.data.length === 0 && (
						<p className={`${styles.pagina} ${styles.estado}`}>
							El libro todavía está en blanco. Sé la primera firma de la noche.
						</p>
					)}
					{libro.data && libro.data.length > 0 && (
						<ol className={styles.entradas}>
							{libro.data.map((entrada, index) => (
								<li
									key={`${entrada.autor}-${entrada.ledger}`}
									className={styles.pagina}
								>
									<p className={styles.paginaTop}>pág. {index + 1}</p>
									<blockquote>{entrada.mensaje}</blockquote>
									<footer className={styles.rubrica}>
										<span className={styles.chip} title={entrada.autor}>
											{shortAddress(entrada.autor)}
										</span>
										<span className={styles.cuando}>
											{fechaDe(entrada.timestamp)} · ledger {entrada.ledger}
										</span>
									</footer>
								</li>
							))}
						</ol>
					)}
				</div>
			</section>
		</div>
	)
}
