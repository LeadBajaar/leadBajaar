export function LoadingSpinner() {
  return (
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      <span>Loading...</span>
    </div>
  )
} 
