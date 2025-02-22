export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl w-full text-left border border-orange-500/20 p-6 rounded-lg shadow-lg shadow-black/50 backdrop-blur-md">
        <div className="animate-pulse">
          <div className="h-8 bg-orange-500/20 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-orange-500/20 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-orange-500/20 rounded w-full"></div>
            <div className="h-4 bg-orange-500/20 rounded w-5/6"></div>
            <div className="h-4 bg-orange-500/20 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
