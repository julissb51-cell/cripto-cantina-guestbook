import { useLocale } from "../i18n"
import styles from "./Debug.module.css"

const CONTRACT_ID = "CC3KM7M4JW6ZXSMTF4X77JQP57LIIHQBBBCGPUX7ZAGGR3IWPJA7JCGB"

export default function Debug() {
	const { t } = useLocale()

	return (
		<div className={styles.page}>
			<h2>{t.debugTitle}</h2>
			<p>{t.debugIntro}</p>
			<p>
				{t.debugBefore}{" "}
				<a
					href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
					target="_blank"
					rel="noreferrer"
				>
					<code translate="no">{CONTRACT_ID}</code>
				</a>
				. {t.debugAfter}{" "}
				<a href="https://lab.stellar.org" target="_blank" rel="noreferrer">
					Stellar Lab
				</a>
				.
			</p>
		</div>
	)
}
