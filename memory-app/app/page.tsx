import getMemory from '@/lib/get-memory'

interface MemoryItem {
  memory: string;
  timestamp: string;
}

export default async function Home() {
  const memory = await getMemory()
  
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <header className="mb-12">
          <h1 className="text-2xl font-light tracking-tight">Memory</h1>
        </header>

        <div className="space-y-8">
          {memory.map((item: MemoryItem, index: number) => (
            <div 
              key={index}
              className="border border-white p-4 rounded-md"
            >
              <p className="text-white leading-relaxed">{item.memory}</p>
              <p className="text-[#a1a1a1] text-sm mt-4">
                {new Date(item.timestamp).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
