/**
 * Momen Photo Gallery Component
 * Display photos in a responsive grid
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { X, Download, Heart, Check, X as RejectIcon, Loader2 } from 'lucide-react';
import type { IPhoto } from '@/lib/validation/photo.schema';

interface PhotoGalleryProps {
  photos: IPhoto[];
  mode?: 'view' | 'manage' | 'approve';
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onPhotoApprove?: (photoId: string) => void;
  onPhotoReject?: (photoId: string) => void;
  onPhotoDelete?: (photoId: string) => void;
  isLoading?: boolean;
}

export function PhotoGallery({
  photos,
  mode = 'view',
  selectedIds = [],
  onSelectionChange,
  onPhotoApprove,
  onPhotoReject,
  onPhotoDelete,
  isLoading = false,
}: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set());

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;

    if (e.key === 'Escape') setLightboxOpen(false);
    if (e.key === 'ArrowLeft') setCurrentPhotoIndex((i) => Math.max(0, i - 1));
    if (e.key === 'ArrowRight') setCurrentPhotoIndex((i) => Math.min(photos.length - 1, i + 1));
  }, [lightboxOpen, photos.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const toggleLike = (photoId: string) => {
    setLikedPhotos((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const toggleSelection = (photoId: string) => {
    if (!onSelectionChange) return;

    const next = selectedIds.includes(photoId)
      ? selectedIds.filter((id) => id !== photoId)
      : [...selectedIds, photoId];

    onSelectionChange(next);
  };

  const selectAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(photos.map((p) => p.id));
  };

  const deselectAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange([]);
  };

  const currentPhoto = photos[currentPhotoIndex];

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {mode === 'manage' && onSelectionChange && selectedIds.length > 0 && (
        <div className="sticky top-0 z-20 bg-card border border-default rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-slate">
            {selectedIds.length} photo{selectedIds.length === 1 ? '' : 's'} selected
          </span>
          <div className="flex items-center gap-2">
            {mode === 'approve' && (
              <>
                <button
                  onClick={() => selectedIds.forEach((id) => onPhotoApprove?.(id))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success text-white text-sm rounded-md hover:bg-success/90 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Approve ({selectedIds.length})
                </button>
                <button
                  onClick={() => selectedIds.forEach((id) => onPhotoReject?.(id))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-error text-white text-sm rounded-md hover:bg-error/90 transition-colors"
                >
                  <RejectIcon className="w-4 h-4" />
                  Reject ({selectedIds.length})
                </button>
              </>
            )}
            {onPhotoDelete && (
              <button
                onClick={() => selectedIds.forEach((id) => onPhotoDelete?.(id))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-error text-white text-sm rounded-md hover:bg-error/90 transition-colors"
              >
                <RejectIcon className="w-4 h-4" />
                Delete ({selectedIds.length})
              </button>
            )}
            <button
              onClick={deselectAll}
              className="text-sm text-sky hover:text-slate"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Selection Controls */}
      {mode !== 'view' && onSelectionChange && photos.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedIds.length === photos.length && photos.length > 0}
              onChange={(e) => (e.target.checked ? selectAll() : deselectAll())}
              className="w-4 h-4 rounded border-input text-slate focus:ring-ice/50"
            />
            <span className="text-sm text-slate">
              Select All ({photos.length})
            </span>
          </div>
        </div>
      )}

      {/* Photos Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-cream/40 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-cream/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-sky" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate mb-2">No photos yet</h3>
          <p className="text-sky">Upload some photos to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {photos.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              mode={mode}
              isSelected={selectedIds.includes(photo.id)}
              isLiked={likedPhotos.has(photo.id)}
              onClick={() => {
                setCurrentPhotoIndex(index);
                setLightboxOpen(true);
              }}
              onToggleLike={() => toggleLike(photo.id)}
              onToggleSelection={() => toggleSelection(photo.id)}
              onApprove={() => onPhotoApprove?.(photo.id)}
              onReject={() => onPhotoReject?.(photo.id)}
              onDelete={() => onPhotoDelete?.(photo.id)}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && currentPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white hover:text-ice transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation */}
          {currentPhotoIndex > 0 && (
            <button
              onClick={() => setCurrentPhotoIndex((i) => i - 1)}
              className="absolute left-4 p-2 text-white hover:text-ice transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {currentPhotoIndex < photos.length - 1 && (
            <button
              onClick={() => setCurrentPhotoIndex((i) => i + 1)}
              className="absolute right-4 p-2 text-white hover:text-ice transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
            <Image
              src={currentPhoto.largeUrl}
              alt={currentPhoto.caption || 'Photo'}
              width={currentPhoto.metadata?.width || 1920}
              height={currentPhoto.metadata?.height || 1080}
              className="max-w-full max-h-full object-contain"
            />

            {/* Caption */}
            {currentPhoto.caption && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg">
                <p className="text-sm">{currentPhoto.caption}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              onClick={() => toggleLike(currentPhoto.id)}
              className={`p-2 rounded-full ${
                likedPhotos.has(currentPhoto.id) ? 'bg-error text-white' : 'bg-white/20 text-white'
              } hover:scale-110 transition-transform`}
            >
              <Heart className={`w-5 h-5 ${likedPhotos.has(currentPhoto.id) ? 'fill-current' : ''}`} />
            </button>
            <a
              href={currentPhoto.originalUrl}
              download
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <Download className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// PHOTO CARD COMPONENT
// ============================================

interface PhotoCardProps {
  photo: IPhoto;
  mode: 'view' | 'manage' | 'approve';
  isSelected: boolean;
  isLiked: boolean;
  onClick: () => void;
  onToggleLike: () => void;
  onToggleSelection: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
}

function PhotoCard({
  photo,
  mode,
  isSelected,
  isLiked,
  onClick,
  onToggleLike,
  onToggleSelection,
  onApprove,
  onReject,
  onDelete,
}: PhotoCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer ${
        isSelected ? 'ring-2 ring-sky ring-offset-2' : ''
      }`}
    >
      {/* Selection Checkbox */}
      {mode !== 'view' && (
        <div
          className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-sky text-white'
              : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection();
          }}
        >
          {isSelected && <Check className="w-4 h-4" />}
        </div>
      )}

      {/* Status Badge */}
      {photo.status === 'pending' && (
        <div className="absolute top-2 right-2 z-10 px-2 py-0.5 bg-warning/90 text-white text-xs rounded-full">
          Pending
        </div>
      )}

      {/* Image */}
      {!imageError ? (
        <>
          {isImageLoading && (
            <div className="absolute inset-0 bg-cream/40 animate-pulse" />
          )}
          <Image
            src={photo.thumbnailUrl}
            alt={photo.caption || 'Photo'}
            width={200}
            height={200}
            className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
              isImageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsImageLoading(false)}
            onError={() => {
              setImageError(true);
              setIsImageLoading(false);
            }}
            onClick={onClick}
          />
        </>
      ) : (
        <div className="w-full h-full bg-cream/40 flex items-center justify-center">
          <svg className="w-8 h-8 text-sky" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {/* Overlay Actions */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike();
            }}
            className={`p-1.5 rounded-full ${
              isLiked ? 'bg-error text-white' : 'bg-white/20 text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {mode === 'approve' && (
            <div className="flex items-center gap-1">
              {onApprove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove();
                  }}
                  className="p-1.5 rounded-full bg-success text-white hover:bg-success/90"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              {onReject && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject();
                  }}
                  className="p-1.5 rounded-full bg-error text-white hover:bg-error/90"
                >
                  <RejectIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {mode === 'manage' && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-full bg-error text-white hover:bg-error/90"
            >
              <RejectIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
