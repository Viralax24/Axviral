import { Link } from 'react-router-dom';
import { PlayCircle, Image as ImageIcon } from 'lucide-react';
import { MediaItem } from '@/lib/db';
import { useEffect, useState, useRef } from 'react';

interface MediaCardProps {
  media: MediaItem;
}

export function MediaCard({ media }: MediaCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let vidUrl: string | null = null;

    if (media.thumbnail) {
        setThumbnailUrl(media.thumbnail);
    } else if (media.type === 'image') {
        if (media.sourceType === 'file' && media.file) {
            objectUrl = URL.createObjectURL(media.file);
            setThumbnailUrl(objectUrl);
        } else if (media.sourceType === 'url' && media.remoteUrl) {
            setThumbnailUrl(media.remoteUrl);
        }
    }

    if (media.type === 'video') {
        if (media.sourceType === 'file' && media.file) {
            vidUrl = URL.createObjectURL(media.file);
            setVideoUrl(vidUrl);
        } else if (media.sourceType === 'url' && media.remoteUrl) {
            // Only set videoUrl for preview if it is NOT an embeddable service
            const isEmbed = media.remoteUrl.includes('youtube.com') || 
                            media.remoteUrl.includes('youtu.be') || 
                            media.remoteUrl.includes('vimeo.com') ||
                            media.remoteUrl.includes('drive.google.com');
            
            if (!isEmbed) {
                setVideoUrl(media.remoteUrl);
            }
        }
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (vidUrl) URL.revokeObjectURL(vidUrl);
    };
  }, [media]);

  useEffect(() => {
    if (isHovered && videoRef.current && media.type === 'video') {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {});
        }
    } else if (!isHovered && videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
    }
  }, [isHovered, media.type]);

  return (
    <Link 
        to={`/watch/${media.id}`} 
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-[#f90] transition-colors">
        {/* If video and hovered, show video preview */}
        {media.type === 'video' && isHovered && videoUrl ? (
            <video
                ref={videoRef}
                src={videoUrl}
                muted
                loop
                className="absolute inset-0 w-full h-full object-cover"
            />
        ) : (
            // Thumbnail or Placeholder
            thumbnailUrl ? (
                <img 
                    src={thumbnailUrl} 
                    alt={media.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-800">
                    {media.type === 'video' ? <PlayCircle size={48} /> : <ImageIcon size={48} />}
                </div>
            )
        )}
        
        {/* Overlay Icon */}
        {!isHovered && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                {media.type === 'video' && (
                    <PlayCircle className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" size={48} />
                )}
            </div>
        )}
        
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded pointer-events-none">
             {media.type === 'video' ? 'Video' : 'Photo'}
        </div>
      </div>
      <div className="mt-2">
        <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:text-[#f90] transition-colors">
          {media.title}
        </h3>
        <p className="text-zinc-500 text-xs mt-1">
          {new Date(media.createdAt).toLocaleDateString()} • {media.views} views
        </p>
      </div>
    </Link>
  );
}
