import React, { useState, useEffect } from 'react';
import { FiUpload, FiTrash2, FiSmile, FiHeart, FiStar, FiSun, FiCloud, FiGift, FiX } from 'react-icons/fi';

const STICKERS = [
  { id: 'heart', component: <FiHeart className="w-6 h-6 text-rose-500 fill-rose-100 drop-shadow-sm" /> },
  { id: 'star', component: <FiStar className="w-6 h-6 text-amber-500 fill-amber-100 drop-shadow-sm" /> },
  { id: 'sun', component: <FiSun className="w-6 h-6 text-yellow-500 drop-shadow-sm" /> },
  { id: 'cloud', component: <FiCloud className="w-6 h-6 text-sky-400 fill-sky-100 drop-shadow-sm" /> },
  { id: 'gift', component: <FiGift className="w-6 h-6 text-pink-500 fill-pink-100 drop-shadow-sm" /> }
];

export default function PhotoGallery({ boardId, username }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (boardId) fetchPhotos();
  }, [boardId]);

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`/api/gallery/${boardId}`);
      const data = await res.json();
      if (Array.isArray(data)) setPhotos(data);
    } catch (err) {
      console.error('Error fetching gallery:', err);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !boardId) return;

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('boardId', boardId);
    formData.append('author', username || 'Anonymous');

    setUploading(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        body: formData
      });
      if (res.ok) fetchPhotos();
    } catch (err) {
      console.error('Error uploading photo:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (id) => {
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) setPhotos(photos.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting photo:', err);
    }
  };

  const handleAddSticker = async (photo, stickerId) => {
    const currentStickers = photo.stickers ? (typeof photo.stickers === 'string' ? JSON.parse(photo.stickers) : photo.stickers) : [];
    
    // Default new stickers to the center of the photo
    const newStickers = [...currentStickers, { 
      uniqueInstanceId: Date.now() + Math.random(), 
      stickerId, 
      x: 50, 
      y: 50 
    }];

    await saveStickersToBackend(photo.id, newStickers);
  };

  const handleDeleteSticker = async (photo, stickerInstanceId, e) => {
    e.stopPropagation();
    const currentStickers = photo.stickers ? (typeof photo.stickers === 'string' ? JSON.parse(photo.stickers) : photo.stickers) : [];
    const newStickers = currentStickers.filter(s => (s.uniqueInstanceId || s.id) !== stickerInstanceId);
    await saveStickersToBackend(photo.id, newStickers);
  };

  const saveStickersToBackend = async (photoId, newStickers) => {
    try {
      const res = await fetch(`/api/gallery/${photoId}/stickers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stickers: newStickers })
      });

      if (res.ok) {
        setPhotos(photos.map(p => p.id === photoId ? { ...p, stickers: newStickers } : p));
      }
    } catch (err) {
      console.error('Error updating stickers:', err);
    }
  };

  // Drag handler using local tracking to avoid stale closures
  const handleStickerPointerDown = (e, photo, sticker) => {
    e.stopPropagation();
    const container = e.currentTarget.closest('.photo-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const stickerInstanceId = sticker.uniqueInstanceId || sticker.id;

    let latestStickers = typeof photo.stickers === 'string' ? JSON.parse(photo.stickers) : (photo.stickers || []);

    const onPointerMove = (moveEvent) => {
      const x = Math.max(5, Math.min(95, ((moveEvent.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(5, Math.min(95, ((moveEvent.clientY - rect.top) / rect.height) * 100));

      latestStickers = latestStickers.map(s => 
        (s.uniqueInstanceId || s.id) === stickerInstanceId ? { ...s, x, y } : s
      );

      setPhotos(prevPhotos => prevPhotos.map(p => {
        if (p.id !== photo.id) return p;
        return { ...p, stickers: latestStickers };
      }));
    };

    const onPointerUp = async () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      await saveStickersToBackend(photo.id, latestStickers);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const renderStickerElement = (stickerId) => {
    const found = STICKERS.find(s => s.id === stickerId);
    return found ? found.component : <FiHeart className="w-6 h-6 text-rose-500 fill-rose-100" />;
  };

  return (
    <div className="max-w-3xl mx-auto bg-[#FAF7F2] p-8 rounded-4xl border border-stone-200/60 shadow-md flex flex-col items-center">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-light text-stone-800">Our Photo Gallery</h2>
        <p className="text-stone-500 text-sm mt-1">Upload memories and drag cute stickers around to decorate them.</p>
      </div>

      {/* Upload Button */}
      <label className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium transition cursor-pointer shadow-sm mb-8">
        <FiUpload /> {uploading ? 'Uploading...' : 'Upload Photo'}
        <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </label>

      {/* Photo Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
        {photos.length === 0 ? (
          <div className="col-span-full text-center py-12 text-stone-400 text-sm">
            No photos in the gallery yet. Upload your first memory above!
          </div>
        ) : (
          photos.map((photo) => {
            const stickersList = photo.stickers ? (typeof photo.stickers === 'string' ? JSON.parse(photo.stickers) : photo.stickers) : [];
            return (
              <div key={photo.id} className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm relative flex flex-col">
                <div className="photo-container relative rounded-2xl overflow-hidden bg-stone-100 aspect-square flex items-center justify-center select-none">
                  <img src={photo.image_url} alt="Gallery memory" className="w-full h-full object-cover pointer-events-none" />
                  
                  {/* Draggable Placed Stickers */}
                  {stickersList.map((s) => {
                    const instanceId = s.uniqueInstanceId || s.id;
                    return (
                      <div 
                        key={instanceId} 
                        onPointerDown={(e) => handleStickerPointerDown(e, photo, s)}
                        className="absolute cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 group p-2"
                        style={{ top: `${s.y}%`, left: `${s.x}%` }}>
                        <div className="relative">
                          {renderStickerElement(s.stickerId)}
                          {/* Individual Sticker Delete Button */}
                          <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => handleDeleteSticker(photo, instanceId, e)}
                            className="absolute -top-3 -right-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition shadow-sm cursor-pointer z-10"
                            title="Remove sticker">
                            <FiX className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sticker Toolbar */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-stone-400 mr-1 flex items-center gap-0.5"><FiSmile /> Add:</span>
                    {STICKERS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleAddSticker(photo, item.id)}
                        className="hover:scale-125 transition p-1 cursor-pointer bg-stone-50 rounded-lg border border-stone-200/60"
                        title={`Add ${item.id} sticker`}>
                        {item.component}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="text-stone-400 hover:text-rose-600 transition p-1 cursor-pointer"
                    title="Delete photo">
                    <FiTrash2 className="text-xs" />
                  </button>
                </div>

                <div className="flex justify-between items-center mt-2 text-[11px] text-stone-500 font-medium">
                  <span>By {photo.author}</span>
                  <span className="font-mono text-[10px]">{new Date(photo.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}