export default function CampaignCardSkeleton() {
  return (
    <div className="flex flex-col min-w-80 max-w-96 rounded-xl h-full animate-pulse shadow-lg">
      <header className="flex flex-col gap-2">
        <div className="min-h-40 max-h-40 bg-slate-300 rounded-t-xl"></div>
        <div className="flex flex-col p-4 gap-4">
          <div className="h-3 rounded-full w-3/4 bg-slate-300"></div>
          <div className="h-2 rounded-full w-2/4 bg-slate-300"></div>
        </div>
      </header>
    </div>
  )
}

