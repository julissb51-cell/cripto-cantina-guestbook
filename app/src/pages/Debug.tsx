const CONTRACT_ID = "CDYLDNBCQJZZALN4QJRV5YN5MSWOSK6UCLWPA4JY22S3CCDFWNG3VU4K"

export default function Debug() {
	return (
		<div className="debug">
			<h2>Explorador</h2>
			<p>
				El libro habla con el cliente que genera Scaffold Stellar. Las dos
				funciones del contrato son <code>firmar</code> y <code>listar</code>.
			</p>
			<p>
				La instancia de testnet es{" "}
				<a
					href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
					target="_blank"
					rel="noreferrer"
				>
					<code>{CONTRACT_ID}</code>
				</a>
				. Para inspeccionar la transacción, abre el contrato en stellar.expert o
				en{" "}
				<a href="https://lab.stellar.org" target="_blank" rel="noreferrer">
					Stellar Lab
				</a>
				.
			</p>
		</div>
	)
}
