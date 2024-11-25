export function LoadingSpinner({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizeClasses = {
    small: 'h-4 w-4 border',
    default: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-2'
  }

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-b-gray-900`}
        role="status"
        aria-label="Loading"
      />
    </div>
  )
} 