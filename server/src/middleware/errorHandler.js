/**
 * Global error handler middleware
 */
export function errorHandler(err, _req, res, _next) {
    console.error('❌ Error:', err.message)

    if (err.name === 'ZodError') {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: err.errors,
        })
    }

    const status = err.status || err.statusCode || 500
    res.status(status).json({
        success: false,
        error: err.message || 'Internal server error',
    })
}
