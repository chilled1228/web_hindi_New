import { Card, CardHeader, CardFooter } from "@/components/ui/card"

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Skeleton */}
        <header className="text-center mb-16">
          <div className="h-12 sm:h-14 lg:h-16 w-48 sm:w-56 lg:w-64 bg-gray-100 dark:bg-gray-800 rounded-lg mx-auto mb-6 shimmer" />
          <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-800 rounded mx-auto mb-3 shimmer" />
          <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded mx-auto shimmer" />
          <div className="mt-6 h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded mx-auto shimmer" />
        </header>

        {/* Blog Posts Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card 
              key={index} 
              className="h-full overflow-hidden border-transparent bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
              style={{ 
                animationDelay: `${index * 150}ms`,
                opacity: 0,
                animation: 'fade-in 0.3s ease-out forwards'
              }}
            >
              {/* Image Skeleton */}
              <div className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-gray-800 shimmer" />
              
              <CardHeader className="space-y-4">
                {/* Date and Category Skeleton */}
                <div className="flex items-center gap-2">
                  <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded shimmer" />
                  <div className="h-3 w-3 bg-gray-100 dark:bg-gray-800 rounded-full shimmer" />
                  <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded shimmer" />
                </div>
                
                {/* Title Skeleton */}
                <div className="space-y-2">
                  <div className="h-7 w-[90%] bg-gray-100 dark:bg-gray-800 rounded shimmer" />
                  <div className="h-7 w-[75%] bg-gray-100 dark:bg-gray-800 rounded shimmer" />
                </div>
                
                {/* Description Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded shimmer" />
                  <div className="h-4 w-[85%] bg-gray-100 dark:bg-gray-800 rounded shimmer" />
                  <div className="h-4 w-[70%] bg-gray-100 dark:bg-gray-800 rounded shimmer" />
                </div>
              </CardHeader>

              <CardFooter className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
                {/* Author Skeleton */}
                <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded shimmer" />
                {/* Difficulty Stars Skeleton */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="h-4 w-4 bg-gray-100 dark:bg-gray-800 rounded shimmer"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 