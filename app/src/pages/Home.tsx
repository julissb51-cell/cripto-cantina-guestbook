import { LibroDeVisitas } from "../components/LibroDeVisitas"
import styles from "./Home.module.css"

const Home = () => (
	<div className={styles.Home}>
		<div className={styles.intro}>
			<p className={styles.kicker}>Stellar Sessions · Challenge #1</p>
			<h1>
				El libro de visitas{" "}
				<span className={styles.subtitulo}>de la Cripto Cantina</span>
			</h1>
			<div className={styles.rule} aria-hidden="true">
				<span />
			</div>
			<p>
				Conecta tu wallet, deja un mensaje y fírmalo en testnet. Cada dirección
				escribe una sola vez. El libro muestra todas las firmas.
			</p>
		</div>
		<LibroDeVisitas />
	</div>
)

export default Home
