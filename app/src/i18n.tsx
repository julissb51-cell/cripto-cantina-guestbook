import {
	createContext,
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react"

export type Locale = "es" | "en"

const STORAGE_KEY = "cripto-cantina-idioma"

const copy = {
	es: {
		documentTitle: "Cripto Cantina — Libro de visitas",
		language: "Idioma",
		kicker: "Stellar Sessions · Challenge #1",
		explorer: "Explorador",
		contract: "Contrato",
		footer: "Una firma por dirección, guardada en Stellar testnet.",
		connect: "Conectar billetera",
		connecting: "Conectando…",
		fund: "Fondear",
		funding: "Fondeando…",
		fundTitle: "Pide XLM de prueba a Friendbot",
		coverKicker: "Cantina de noche",
		coverTitle: "El libro de visitas",
		coverSubtitle: "de la Cripto Cantina",
		openBook: "Abrir el libro",
		closeBook: "Cerrar el libro",
		closedLede: "Cada dirección deja una sola nota en testnet.",
		bookLabel: "Libro abierto",
		prev: "Página anterior",
		next: "Página siguiente",
		pagination: "Páginas",
		signTitle: "Deja tu firma",
		signLede:
			"Una dirección, un mensaje. La wallet lo autoriza y el contrato lo guarda para siempre en esta instancia.",
		noteLabel: "Tu nota",
		notePlaceholder: "La primera ronda va por la casa.",
		bytesLabel: "Bytes del mensaje",
		alreadyBanner:
			"Ya firmaste. En la Cripto Cantina cada dirección deja una sola nota.",
		tooLongBanner: "Esa nota no cabe. El libro solo acepta 140 bytes.",
		signing: "Firmando…",
		alreadyButton: "Ya firmaste",
		signButton: "Firmar el libro",
		connectToSign: "Conecta tu wallet para firmar",
		signingStatus: "Firmando… confirma la operación en tu billetera.",
		signed: "Tu firma ya está en el libro.",
		walletHint: "Freighter y las demás wallets de Stellar Wallets Kit sirven.",
		loading: "Pasando las páginas…",
		readError: "No pudimos leer el libro en testnet.",
		retry: "Reintentar",
		empty: "El libro todavía está en blanco. Sé la primera firma de la noche.",
		noDate: "sin fecha",
		connectFirst: "Conecta tu wallet para dejar una firma.",
		walletCancelled: "La wallet canceló la firma.",
		genericError: "No se pudo dejar la firma. Inténtalo de nuevo.",
		debugTitle: "Explorador",
		debugIntro:
			"El libro habla con el cliente que genera Scaffold Stellar. Las dos funciones del contrato son firmar y listar.",
		debugBefore: "La instancia de testnet es",
		debugAfter:
			"Para inspeccionar la transacción, abre el contrato en stellar.expert o en",
		blankPage: "Página en blanco",
		cuenta: (n: number) => (n === 1 ? "1 firma" : `${n} firmas`),
		folio: (n: number) => `pág. ${n}`,
		paginaDe: (n: number, total: number) => `${n} / ${total}`,
		paginasDe: (desde: number, hasta: number, total: number) =>
			`${desde}–${hasta} / ${total}`,
		firmasComo: (direccion: string) => `Firmas como ${direccion}.`,
		contador: (usados: number, max: number) => `${usados} / ${max} bytes`,
		bytesDe: (usados: number, max: number) => `${usados} de ${max} bytes`,
		contratoRechazo: (codigo: string) =>
			`El contrato rechazó la firma (${codigo}).`,
		cuando: (fecha: string, ledger: number) => `${fecha} · ledger ${ledger}`,
		errores: {
			YaFirmo:
				"Ya firmaste. En la Cripto Cantina cada dirección deja una sola nota.",
			MensajeVacio:
				"Escribe algo antes de firmar. La página en blanco no cuenta.",
			MensajeMuyLargo: "Esa nota no cabe. El libro solo acepta 140 bytes.",
			"1": "Ya firmaste. En la Cripto Cantina cada dirección deja una sola nota.",
			"2": "Escribe algo antes de firmar. La página en blanco no cuenta.",
			"3": "Esa nota no cabe. El libro solo acepta 140 bytes.",
		} as Record<string, string>,
	},
	en: {
		documentTitle: "Cripto Cantina — Guestbook",
		language: "Language",
		kicker: "Stellar Sessions · Challenge #1",
		explorer: "Explorer",
		contract: "Contract",
		footer: "One signature per address, kept on Stellar testnet.",
		connect: "Connect wallet",
		connecting: "Connecting…",
		fund: "Fund",
		funding: "Funding…",
		fundTitle: "Request test XLM from Friendbot",
		coverKicker: "Cantina at night",
		coverTitle: "The guestbook",
		coverSubtitle: "of the Cripto Cantina",
		openBook: "Open the book",
		closeBook: "Close the book",
		closedLede: "Each address leaves a single note on testnet.",
		bookLabel: "Open book",
		prev: "Previous page",
		next: "Next page",
		pagination: "Pages",
		signTitle: "Leave your signature",
		signLede:
			"One address, one message. The wallet authorizes it and the contract keeps it on this instance.",
		noteLabel: "Your note",
		notePlaceholder: "The first round is on the house.",
		bytesLabel: "Message bytes",
		alreadyBanner:
			"You already signed. At the Cripto Cantina each address leaves a single note.",
		tooLongBanner: "That note doesn't fit. The book only accepts 140 bytes.",
		signing: "Signing…",
		alreadyButton: "You already signed",
		signButton: "Sign the book",
		connectToSign: "Connect your wallet to sign",
		signingStatus: "Signing… confirm the transaction in your wallet.",
		signed: "Your signature is in the book.",
		walletHint: "Freighter and the other Stellar Wallets Kit wallets work.",
		loading: "Turning the pages…",
		readError: "We couldn't read the book on testnet.",
		retry: "Try again",
		empty: "The book is still blank. Be the first signature of the night.",
		noDate: "no date",
		connectFirst: "Connect your wallet to leave a signature.",
		walletCancelled: "The wallet cancelled the signature.",
		genericError: "The signature couldn't be saved. Try again.",
		debugTitle: "Explorer",
		debugIntro:
			"The book talks to the client Scaffold Stellar generates. The two contract functions are firmar and listar.",
		debugBefore: "The testnet instance is",
		debugAfter:
			"To inspect a transaction, open the contract on stellar.expert or in",
		blankPage: "Blank page",
		cuenta: (n: number) => (n === 1 ? "1 signature" : `${n} signatures`),
		folio: (n: number) => `p. ${n}`,
		paginaDe: (n: number, total: number) => `${n} / ${total}`,
		paginasDe: (desde: number, hasta: number, total: number) =>
			`${desde}–${hasta} / ${total}`,
		firmasComo: (direccion: string) => `You sign as ${direccion}.`,
		contador: (usados: number, max: number) => `${usados} / ${max} bytes`,
		bytesDe: (usados: number, max: number) => `${usados} of ${max} bytes`,
		contratoRechazo: (codigo: string) =>
			`The contract rejected the signature (${codigo}).`,
		cuando: (fecha: string, ledger: number) => `${fecha} · ledger ${ledger}`,
		errores: {
			YaFirmo:
				"You already signed. At the Cripto Cantina each address leaves a single note.",
			MensajeVacio:
				"Write something before signing. A blank page doesn't count.",
			MensajeMuyLargo:
				"That note doesn't fit. The book only accepts 140 bytes.",
			"1": "You already signed. At the Cripto Cantina each address leaves a single note.",
			"2": "Write something before signing. A blank page doesn't count.",
			"3": "That note doesn't fit. The book only accepts 140 bytes.",
		} as Record<string, string>,
	},
}

export type Copy = (typeof copy)["es"]

type LocaleContextValue = {
	locale: Locale
	setLocale: (locale: Locale) => void
	t: Copy
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

const leerIdioma = (): Locale => {
	try {
		const guardado = localStorage.getItem(STORAGE_KEY)
		if (guardado === "en" || guardado === "es") return guardado
	} catch {
		// Private mode can block storage; Spanish stays the default.
	}
	return "es"
}

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
	const [locale, setLocaleState] = useState<Locale>(leerIdioma)

	const setLocale = useCallback((next: Locale) => {
		setLocaleState(next)
	}, [])

	useLayoutEffect(() => {
		document.documentElement.lang = locale
		document.title = copy[locale].documentTitle
		try {
			localStorage.setItem(STORAGE_KEY, locale)
		} catch {
			// The choice still applies for this visit.
		}
	}, [locale])

	const value = useMemo(
		() => ({ locale, setLocale, t: copy[locale] }),
		[locale, setLocale],
	)

	return (
		<LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
	)
}

export const useLocale = () => {
	const value = useContext(LocaleContext)
	if (!value) {
		throw new Error("useLocale debe usarse dentro de LocaleProvider")
	}
	return value
}
