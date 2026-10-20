export const Barril = ({ className }: { className?: string }) => (
	<svg className={className} viewBox="0 0 32 32" aria-hidden="true">
		<path
			fill="var(--barril-duela, #4a1a22)"
			d="M8.2 4.2c-3.4 3.1-3.8 20.2 0 23.6h15.6c3.8-3.4 3.4-20.5 0-23.6H8.2z"
		/>
		<path
			fill="none"
			stroke="var(--barril-linea, rgba(239, 227, 201, 0.72))"
			strokeWidth="0.7"
			d="M6.1 11.1h19.8M5.5 16h21M6.1 20.9h19.8"
		/>
		<path
			fill="none"
			stroke="var(--barril-aro, #efe3c9)"
			strokeWidth="2.15"
			strokeLinecap="round"
			d="M6.3 8h19.4M6.3 24h19.4"
		/>
		<rect
			x="13.7"
			y="14.2"
			width="4.6"
			height="3.6"
			rx="0.35"
			fill="var(--barril-aro, #efe3c9)"
		/>
	</svg>
)
