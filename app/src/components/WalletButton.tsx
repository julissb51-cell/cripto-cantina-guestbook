import {
	connectWallet,
	profileModal,
	shortAddress,
} from "@stellar-scaffold/app-lib"
import { useWallet } from "../hooks/useWallet"

export const WalletButton = () => {
	const { address, isPending, balances } = useWallet()

	if (!address) {
		return (
			<button
				className="btn-header"
				onClick={() => void connectWallet()}
				disabled={isPending}
			>
				{isPending ? "Conectando…" : "Conectar billetera"}
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
