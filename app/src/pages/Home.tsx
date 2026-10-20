import { LibroDeVisitas } from "../components/LibroDeVisitas"
import { useLocale } from "../i18n"
import styles from "./Home.module.css"

const Home = () => {
	const { t } = useLocale()

	return (
		<div className={styles.Home}>
			<p className={styles.kicker}>{t.kicker}</p>
			<LibroDeVisitas />
		</div>
	)
}

export default Home
