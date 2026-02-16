import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { MediaCard } from '@/components/MediaCard';
import { getAllMedia, MediaItem } from '@/lib/db';
import { Footer } from '@/components/Footer';

export function Home() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const items = await getAllMedia();
        // Sort by newest first
        items.sort((a, b) => b.createdAt - a.createdAt);
        setMediaItems(items);
      } catch (error) {
        console.error("Failed to fetch media", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6 border-l-4 border-[#f90] pl-3">
          Latest Uploads
        </h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f90]"></div>
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 rounded-lg border border-zinc-800">
            <h2 className="text-xl font-semibold text-zinc-400">No media uploaded yet.</h2>
            <p className="text-zinc-500 mt-2">Check back later or ask the admin to upload something!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mediaItems.map((item) => (
              <MediaCard key={item.id} media={item} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
