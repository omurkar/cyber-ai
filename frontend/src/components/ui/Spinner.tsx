export function Spinner({ size = 20 }: { size?: number }) {
    const s = `${size}px`
    return (
        <span
            className="inline-block animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"
            style={{ width: s, height: s }}
        />
    )
}


