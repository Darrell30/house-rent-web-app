import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Modal } from '../common/Modal';

export const ImageGallery = ({ images = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fallback = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';
  const validImages = images.length > 0 ? images : [{ url: fallback, caption: 'Default Image' }];

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const current = validImages[selectedIndex];

  return (
    <div className="space-y-3">
      {/* Featured Main Image */}
      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md group">
        <img
          src={current?.url || fallback}
          alt={current?.caption || 'Property'}
          className="w-full h-full object-cover transition-all duration-300"
        />

        {/* Caption Overlay */}
        {current?.caption && (
          <div className="absolute bottom-3 left-3 px-3 py-1 bg-slate-900/70 backdrop-blur-sm text-white text-xs rounded-lg">
            {current.caption}
          </div>
        )}

        {/* Enlarge Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/60 backdrop-blur-sm text-white hover:bg-slate-900 transition-colors"
          title="View Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Carousel arrows if multiple */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-slate-800 hover:bg-white transition-opacity shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-slate-800 hover:bg-white transition-opacity shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {validImages.length > 1 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                idx === selectedIndex
                  ? 'border-teal-600 scale-95 shadow-sm'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Property Photo Gallery"
        maxWidth="max-w-4xl"
      >
        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black">
          <img
            src={current?.url || fallback}
            alt="Fullscreen view"
            className="w-full h-full object-contain"
          />
          {validImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 text-slate-900 hover:bg-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 text-slate-900 hover:bg-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
        <div className="mt-3 text-center text-xs text-slate-500">
          Photo {selectedIndex + 1} of {validImages.length}
          {current?.caption ? ` — ${current.caption}` : ''}
        </div>
      </Modal>
    </div>
  );
};
