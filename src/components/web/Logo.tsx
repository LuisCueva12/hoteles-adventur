export function Logo({ className = "h-10", variant = "default" }: { className?: string; variant?: "default" | "footer" }) {
    const textColor = variant === "footer" ? "#ffffff" : "#0A2540"
    const accentColor = "#FDB913"
    
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <svg viewBox="0 0 200 200" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
                <path 
                    d="M 60 150 L 100 50 L 140 150 L 120 150 L 100 100 L 80 150 Z" 
                    fill={variant === "footer" ? "#ffffff" : "#0A2540"}
                />
                <g transform="translate(120, 40)">
                    <rect x="0" y="0" width="30" height="50" fill={variant === "footer" ? "#ffffff" : "#0A2540"} rx="2"/>
                    <rect x="3" y="3" width="4" height="4" fill="#FDB913"/>
                    <rect x="10" y="3" width="4" height="4" fill="#FDB913"/>
                    <rect x="17" y="3" width="4" height="4" fill="#FDB913"/>
                    <rect x="24" y="3" width="4" height="4" fill="#FDB913"/>
                    <rect x="3" y="10" width="4" height="4" fill="#FDB913"/>
                    <rect x="10" y="10" width="4" height="4" fill="#FDB913"/>
                    <rect x="17" y="10" width="4" height="4" fill="#FDB913"/>
                    <rect x="24" y="10" width="4" height="4" fill="#FDB913"/>
                    <rect x="3" y="17" width="4" height="4" fill="#FDB913"/>
                    <rect x="10" y="17" width="4" height="4" fill="#FDB913"/>
                    <rect x="17" y="17" width="4" height="4" fill="#FDB913"/>
                    <rect x="24" y="17" width="4" height="4" fill="#FDB913"/>
                    <text x="15" y="-2" fontSize="6" fill="#FDB913" textAnchor="middle" fontWeight="bold">HOTEL</text>
                </g>
                <path 
                    d="M 50 120 Q 80 140 110 120 T 170 100" 
                    stroke="#FDB913" 
                    strokeWidth="8" 
                    fill="none"
                    strokeLinecap="round"
                />
                <path 
                    d="M 165 95 L 175 100 L 165 105 Z" 
                    fill="#FDB913"
                />
            </svg>
            <div className="flex flex-col leading-tight">
                <span className="font-bold text-xl tracking-tight" style={{ color: textColor }}>
                    Hotel Adventur
                </span>
                <span className="text-xs italic font-medium" style={{ color: accentColor }}>
                    Tu viaje, tu hogar
                </span>
            </div>
        </div>
    )
}
