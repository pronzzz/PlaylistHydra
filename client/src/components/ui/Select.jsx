export default function Select({ value, onChange, options, className = '' }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`input-soft cursor-pointer ${className}`}
            style={{ appearance: 'none', paddingRight: '2.5rem' }}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    )
}
