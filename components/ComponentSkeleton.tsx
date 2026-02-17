/**
 * Loading skeleton for lazy-loaded components
 *
 * Provides a placeholder UI while components are being loaded
 * to prevent layout shift and improve perceived performance
 */
export default function ComponentSkeleton() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="animate-pulse space-y-8">
          {/* Header skeleton */}
          <div className="text-center space-y-4">
            <div className="h-10 bg-gray-200 rounded-lg w-2/3 md:w-1/2 mx-auto" />
            <div className="h-6 bg-gray-200 rounded-lg w-3/4 md:w-2/3 mx-auto" />
          </div>

          {/* Content grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                <div className="h-12 w-12 bg-gray-200 rounded-lg" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
