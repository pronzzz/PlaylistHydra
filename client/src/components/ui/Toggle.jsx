export default function Toggle({ value, onChange, options }) {
    return (
        <div className="toggle-container">
            {options.map((option) => (
                <button
                    key={option.value}
                    className={`toggle-option ${value === option.value ? 'active' : ''}`}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}
