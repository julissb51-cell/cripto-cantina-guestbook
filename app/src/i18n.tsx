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
		navBarra: "La barra",
		navLibro: "El libro",
		heroLead: "El libro de visitas de la",
		heroName: "Cripto Cantina",
		heroLede:
			"Conecta tu wallet, deja un mensaje y fírmalo en testnet. Cada dirección escribe una sola vez. El libro muestra todas las firmas.",
		readSignatures: "Leer las firmas",
		statOne: "firma por dirección",
		statKept: "guardada en el contrato",
		stepsBefore: "Tres pasos y ",
		stepsEm: "tu nombre",
		stepsAfter: " queda en el libro",
		stepsLede:
			"Sin registro, sin correo. Solo una wallet Stellar en testnet y una frase corta que valga la pena recordar.",
		step1Title: "Conecta tu wallet",
		step1Body:
			"Freighter u otra billetera Stellar. La dirección es tu identidad en la cantina.",
		step2Title: "Escribe una línea",
		step2Body:
			"Hasta 140 bytes. Un brindis, una broma, un recuerdo de la noche.",
		step3Title: "Firma y sella",
		step3Body:
			"La wallet autoriza, el contrato Soroban guarda tu mensaje y el ledger lo deja a la vista de todos.",
		quoteEyebrow: "En la barra",
		quoteEmpty: "El libro todavía espera la primera frase de la noche.",
		bookEyebrow: "Testnet",
		bookHeading: "El libro",
		sello: "sello",
		contractHeading: "El contrato",
		contractLede:
			"La instancia de testnet guarda cada firma. Una dirección, una sola nota, como máximo 140 bytes.",
		viewContract: "Ver en stellar.expert",
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
		folio: (n: number) => `Pág. ${n}`,
		firmasBarra: (n: number): string =>
			n === 1 ? "firma en la barra" : "firmas en la barra",
		paginaDe: (n: number, total: number) => `${n} / ${total}`,
		paginasDe: (desde: number, hasta: number, total: number) =>
			`${desde}–${hasta} / ${total}`,
		firmasComo: (direccion: string) => `Firmas como ${direccion}.`,
		contador: (usados: number, max: number) => `${usados}/${max}`,
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
		navBarra: "The bar",
		navLibro: "The book",
		heroLead: "The guestbook of the",
		heroName: "Cripto Cantina",
		heroLede:
			"Connect your wallet, leave a message and sign it on testnet. Each address writes once. The book shows every signature.",
		readSignatures: "Read the signatures",
		statOne: "signature per address",
		statKept: "kept in the contract",
		stepsBefore: "Three steps and ",
		stepsEm: "your name",
		stepsAfter: " stays in the book",
		stepsLede:
			"No account, no email. Just a Stellar wallet on testnet and one short line worth remembering.",
		step1Title: "Connect your wallet",
		step1Body:
			"Freighter or another Stellar wallet. The address is your name at the cantina.",
		step2Title: "Write a line",
		step2Body: "Up to 140 bytes. A toast, a joke, a memory of the night.",
		step3Title: "Sign and seal",
		step3Body:
			"The wallet authorizes it, the Soroban contract stores your message and the ledger leaves it in view.",
		quoteEyebrow: "At the bar",
		quoteEmpty: "The book is still waiting for the first line of the night.",
		bookEyebrow: "Testnet",
		bookHeading: "The book",
		sello: "seal",
		contractHeading: "The contract",
		contractLede:
			"The testnet instance keeps every signature. One address, one note, 140 bytes at most.",
		viewContract: "View on stellar.expert",
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
		folio: (n: number) => `Pg. ${n}`,
		firmasBarra: (n: number): string =>
			n === 1 ? "signature at the bar" : "signatures at the bar",
		paginaDe: (n: number, total: number) => `${n} / ${total}`,
		paginasDe: (desde: number, hasta: number, total: number) =>
			`${desde}–${hasta} / ${total}`,
		firmasComo: (direccion: string) => `You sign as ${direccion}.`,
		contador: (usados: number, max: number) => `${usados}/${max}`,
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
