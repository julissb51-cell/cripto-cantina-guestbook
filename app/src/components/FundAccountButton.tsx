import { fundAccount } from "@stellar-scaffold/app-lib"
import React, { useTransition } from "react"
import { useNotification } from "../hooks/useNotification.ts"
import { useWallet } from "../hooks/useWallet.ts"
import { useLocale } from "../i18n"

const FundAccountButton: React.FC = () => {
	const { addNotification } = useNotification()
	const [isPending, startTransition] = useTransition()
	const { address, updateBalances } = useWallet()
	const { t } = useLocale()

	if (!address) return null

	const handleFundAccount = () => {
		startTransition(async () => {
			const { ok, message } = await fundAccount(address)
			if (ok) await updateBalances()
			addNotification(message, ok ? "success" : "error")
		})
	}

	return (
		<button
			className="btn-quiet"
			disabled={isPending}
			onClick={handleFundAccount}
			title={t.fundTitle}
		>
			{isPending ? t.funding : t.fund}
		</button>
	)
}

export default FundAccountButton
