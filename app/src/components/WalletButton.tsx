import {
	connectWallet,
	profileModal,
	shortAddress,
} from "@stellar-scaffold/app-lib"
import { useWallet } from "../hooks/useWallet"
import { useLocale } from "../i18n"

export const WalletButton = () => {
	const { address, isPending, balances } = useWallet()
	const { t } = useLocale()

	if (!address) {
		return (
			<button
				className="btn-header"
				onClick={() => void connectWallet()}
				disabled={isPending}
			>
				{isPending ? t.connecting : t.connect}
			</button>
		)
	}

	return (
		<div className="wallet-connected" style={{ opacity: isPending ? 0.6 : 1 }}>
			<span className="wallet-balance">
				{balances?.xlm?.balance ?? "-"} XLM
			</span>

			<button
				className="btn-header wallet-profile"
				onClick={() => void profileModal()}
			>
				{shortAddress(address)}
			</button>
		</div>
	)
}
