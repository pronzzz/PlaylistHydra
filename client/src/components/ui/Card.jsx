export default function Card({ children, className = '', inset = false, ...props }) {
    const baseClass = inset ? 'soft-inset' : 'soft-raised'

    return (
        <div className={`${baseClass} p-6 ${className}`} {...props}>
            {children}
        </div>
    )
}
