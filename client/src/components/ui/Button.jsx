export default function Button({
    children,
    onClick,
    disabled = false,
    variant = 'default',
    size = 'md',
    loading = false,
    className = '',
    ...props
}) {
    const variants = {
        default: 'btn-soft',
        primary: 'btn-soft btn-primary',
        accent: 'btn-soft btn-accent',
        danger: 'btn-soft btn-danger',
    }

    const sizes = {
        sm: 'text-sm px-4 py-2',
        md: '',
        lg: 'text-lg px-8 py-4',
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {loading && <span className="spinner" />}
            {children}
        </button>
    )
}
