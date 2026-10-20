import { stellarNetwork } from "@stellar-scaffold/app-lib"
import React from "react"
import FundAccountButton from "./FundAccountButton"
import NetworkPill from "./NetworkPill"
import { WalletButton } from "./WalletButton"

const ConnectAccount: React.FC = () => {
	return (
		<>
			<div className="wallet-slot">
				<WalletButton />
			</div>
			<div className="connect-meta">
				<NetworkPill />
				{stellarNetwork !== "PUBLIC" && <FundAccountButton />}
			</div>
		</>
	)
}

export default ConnectAccount
