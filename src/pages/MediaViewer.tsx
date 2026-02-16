import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { getMediaById, MediaItem } from '@/lib/db';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/Footer';

export function MediaViewer() {
  const { id } = useParams<{ id: string }>();
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [mediaUrl, setMediaUrl] = useState<string>('');

  useEffect(() => {
    const fetchMedia = async () => {
      if (!id) return;
      try {
        const item = await getMediaById(id);
        if (item) {
          setMedia(item);
          if (item.sourceType === 'file' && item.file) {
             const url = URL.createObjectURL(item.file);
             setMediaUrl(url);
          } else if (item.sourceType === 'url' && item.remoteUrl) {
             setMediaUrl(item.remoteUrl);
          }
        }
      } catch (error) {
        console.error("Failed to fetch media", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();

    return () => {
      if (media?.sourceType === 'file' && mediaUrl) {
        URL.revokeObjectURL(mediaUrl);
      }
    };
  }, [id]); // Add media to dependency array? No, simpler to just run on id change.

  // Helper to get embed URL
  const getEmbedUrl = (url: string) => {
      if (url.includes('youtube.com/watch?v=')) {
          return url.replace('watch?v=', 'embed/');
      } else if (url.includes('youtu.be/')) {
          return url.replace('youtu.be/', 'www.youtube.com/embed/');
      } else if (url.includes('vimeo.com/')) {
          const id = url.split('/').pop();
          return `https://player.vimeo.com/video/${id}`;
      } else if (url.includes('drive.google.com')) {
          // Extract ID from /d/ID or id=ID
          const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
          if (match && match[1]) {
              return `https://drive.google.com/file/d/${match[1]}/preview`;
          }
      }
      return url;
  };

  const isEmbed = (url: string) => {
      return url.includes('youtube.com') || 
             url.includes('youtu.be') || 
             url.includes('vimeo.com') ||
             url.includes('drive.google.com');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f90]"></div>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-400 mb-8">Media not found</p>
          <Link to="/" className="text-[#f90] hover:underline flex items-center gap-2">
            <ArrowLeft size={20} /> Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-black rounded-lg overflow-hidden border border-zinc-800 shadow-2xl relative">
              {media.type === 'video' ? (
                media.sourceType === 'url' && isEmbed(mediaUrl) ? (
                    <iframe 
                        src={getEmbedUrl(mediaUrl)} 
                        className="w-full aspect-video bg-black" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        title={media.title}
                    />
                ) : (
                    <video 
                        controls 
                        autoPlay 
                        className="w-full aspect-video bg-black"
                        poster={media.thumbnail}
                        src={mediaUrl}
                    >
                        Your browser does not support the video tag.
                    </video>
                )
              ) : (
                <img 
                  src={mediaUrl} 
                  alt={media.title} 
                  className="w-full h-auto max-h-[70vh] object-contain mx-auto" 
                />
              )}
            </div>
            
            <div className="pb-4 border-b border-zinc-800">
              <h1 className="text-2xl font-bold text-white mb-2">{media.title}</h1>
              <div className="flex items-center justify-between text-zinc-400 text-sm">
                 <div className="flex items-center gap-4">
                   <span>{media.views} views</span>
                   <span>•</span>
                   <span>{new Date(media.createdAt).toLocaleDateString()}</span>
                 </div>
              </div>
            </div>

            {/* Comments Section (Mock) */}
            <div className="mt-6">
                <h3 className="text-lg font-bold mb-4">Comments</h3>
                <div className="bg-zinc-900/50 p-4 rounded-lg text-center text-zinc-500">
                    Comments are disabled for this video.
                </div>
            </div>
          </div>

          <div className="lg:col-span-1">
             <div className="bg-zinc-900/30 rounded-lg border border-zinc-800 p-4">
                <h3 className="font-bold mb-4 text-[#f90]">Recommended</h3>
                <p className="text-sm text-zinc-500 italic">No recommendations available yet.</p>
             </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
