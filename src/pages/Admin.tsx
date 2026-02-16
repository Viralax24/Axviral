import { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { addMedia, getAllMedia, deleteMedia, MediaItem } from '@/lib/db';
import { Trash2, Upload, Lock, FileVideo, FileImage, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { Footer } from '@/components/Footer';

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Form State
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [title, setTitle] = useState('');
  const [remoteUrl, setRemoteUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video'); // For URL mode

  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadItems();
    }
  }, [isAuthenticated]);

  const loadItems = async () => {
    const data = await getAllMedia();
    setItems(data.sort((a, b) => b.createdAt - a.createdAt));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '@PASS1151') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid Password');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setUploading(true);
    try {
      let newItem: MediaItem;
      let thumbnailDataUrl: string | undefined = undefined;

      if (thumbnailFile) {
        thumbnailDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(thumbnailFile);
        });
      }

      if (uploadType === 'file') {
        if (!file) {
           alert('Please select a file');
           setUploading(false);
           return;
        }
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isVideo && !isImage) {
            alert('Only video and image files are allowed.');
            setUploading(false);
            return;
        }

        newItem = {
            id: crypto.randomUUID(),
            title,
            type: isVideo ? 'video' : 'image',
            sourceType: 'file',
            file: file,
            createdAt: Date.now(),
            views: 0,
            thumbnail: thumbnailDataUrl
        };
      } else {
        // URL Upload
        if (!remoteUrl) {
            alert('Please enter a URL');
            setUploading(false);
            return;
        }

        newItem = {
            id: crypto.randomUUID(),
            title,
            type: mediaType,
            sourceType: 'url',
            remoteUrl: remoteUrl,
            createdAt: Date.now(),
            views: 0,
            thumbnail: thumbnailDataUrl
        };
      }
      
      await addMedia(newItem);
      
      // Reset form
      setTitle('');
      setFile(null);
      setRemoteUrl('');
      setThumbnailFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
      
      await loadItems();
      alert('Upload successful!');
    } catch (err) {
      console.error(err);
      alert('Failed to upload media.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
        await deleteMedia(id);
        await loadItems();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 w-full max-w-md shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="bg-[#f90] p-3 rounded-full">
                <Lock className="text-black" size={32} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-6">Admin Access</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-[#f90] transition-colors"
                  placeholder="Enter admin password"
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                type="submit"
                className="w-full bg-[#f90] hover:bg-[#e80] text-black font-bold py-3 rounded transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 sticky top-24">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Upload size={20} className="text-[#f90]" />
                Upload Media
              </h2>

              <div className="flex mb-4 bg-zinc-800 rounded p-1">
                <button 
                    onClick={() => setUploadType('file')}
                    className={`flex-1 py-1 text-sm font-medium rounded transition-colors ${uploadType === 'file' ? 'bg-[#f90] text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    File Upload
                </button>
                <button 
                    onClick={() => setUploadType('url')}
                    className={`flex-1 py-1 text-sm font-medium rounded transition-colors ${uploadType === 'url' ? 'bg-[#f90] text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    URL Import
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-[#f90]"
                    placeholder="Media title"
                    required
                  />
                </div>

                {uploadType === 'url' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Media Type</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="mediaType" 
                                        checked={mediaType === 'video'} 
                                        onChange={() => setMediaType('video')}
                                        className="text-[#f90] focus:ring-[#f90]"
                                    />
                                    <span className="text-sm">Video</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="mediaType" 
                                        checked={mediaType === 'image'} 
                                        onChange={() => setMediaType('image')}
                                        className="text-[#f90] focus:ring-[#f90]"
                                    />
                                    <span className="text-sm">Image</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Media URL</label>
                            <input
                                type="url"
                                value={remoteUrl}
                                onChange={(e) => setRemoteUrl(e.target.value)}
                                className="w-full bg-black border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-[#f90]"
                                placeholder="https://example.com/video.mp4 or YouTube/Drive Link"
                                required
                            />
                            <p className="text-xs text-zinc-600 mt-1">
                                Supports direct links (MP4), YouTube, Vimeo, and Google Drive (Public).
                            </p>
                        </div>
                    </>
                )}

                {uploadType === 'file' && (
                    <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">File</label>
                    <div className="relative border-2 border-dashed border-zinc-700 rounded-lg p-6 hover:border-[#f90] transition-colors text-center cursor-pointer">
                        <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="video/*,image/*"
                        required
                        />
                        {file ? (
                        <div className="flex items-center justify-center gap-2 text-[#f90]">
                            {file.type.startsWith('video') ? <FileVideo /> : <FileImage />}
                            <span className="truncate max-w-[200px]">{file.name}</span>
                        </div>
                        ) : (
                        <div className="text-gray-500">
                            <Upload className="mx-auto mb-2" />
                            <span className="text-sm">Click to select video or photo</span>
                        </div>
                        )}
                    </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                        <ImageIcon size={14} /> Thumbnail Image (Optional)
                    </label>
                    <div className="relative border border-zinc-700 rounded p-2 hover:border-[#f90] transition-colors cursor-pointer bg-black">
                        <input
                            type="file"
                            ref={thumbnailInputRef}
                            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept="image/*"
                        />
                        <div className="flex items-center gap-2 text-gray-300">
                             {thumbnailFile ? (
                                <>
                                    <ImageIcon size={16} className="text-[#f90]" />
                                    <span className="truncate text-sm">{thumbnailFile.name}</span>
                                </>
                             ) : (
                                <span className="text-sm text-gray-500">Select an image from device...</span>
                             )}
                        </div>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1">Upload a custom cover image from your device.</p>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-[#f90] hover:bg-[#e80] text-black font-bold py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </form>
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 border-l-4 border-[#f90] pl-3">
              Manage Content
            </h2>
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
              {items.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No media uploaded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead className="bg-black">
                        <tr>
                        <th className="p-4 text-sm font-medium text-gray-400">Title</th>
                        <th className="p-4 text-sm font-medium text-gray-400">Type</th>
                        <th className="p-4 text-sm font-medium text-gray-400">Source</th>
                        <th className="p-4 text-sm font-medium text-gray-400">Date</th>
                        <th className="p-4 text-sm font-medium text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {items.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-800/50 transition-colors">
                            <td className="p-4 font-medium max-w-[200px] truncate" title={item.title}>{item.title}</td>
                            <td className="p-4 text-sm text-gray-400 capitalize">{item.type}</td>
                            <td className="p-4 text-sm text-gray-400 capitalize flex items-center gap-1">
                                {item.sourceType === 'url' ? <LinkIcon size={14} /> : <Upload size={14} />}
                                {item.sourceType}
                            </td>
                            <td className="p-4 text-sm text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 text-right">
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded transition-colors"
                                title="Delete"
                            >
                                <Trash2 size={18} />
                            </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
