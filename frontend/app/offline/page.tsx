export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card p-8 max-w-md text-center">
        <h1 className="font-display text-3xl text-[#1a1a2e] font-bold mb-3">You are offline</h1>
        <p className="text-gray-500">Internet connection is not available. Please reconnect and try again.</p>
      </div>
    </div>
  );
}
