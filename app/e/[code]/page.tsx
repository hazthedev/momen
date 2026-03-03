/**
 * Momen Public Gallery Page
 * View and upload photos for an event — public, no auth required
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Camera,
  Upload,
  Share2,
  Calendar,
  MapPin,
  Images,
  CheckCircle2,
  X,
  ArrowUp,
} from 'lucide-react';
import { PhotoUpload } from '@/components/photos/PhotoUpload';
import { PhotoGallery } from '@/components/photos/PhotoGallery';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PublicEvent {
  id: string;
  name: string;
  slug: string;
  shortCode: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  status: string;
  settings: {
    allowGuestUpload?: boolean;
    photoApproval?: boolean;
    autoApprove?: boolean;
  } | null;
}

interface IPhoto {
  id: string;
  eventId: string;
  uploadedById: string | null;
  caption: string | null;
  status: 'pending' | 'approved' | 'rejected';
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
  metadata: { width: number; height: number; format: string; size: number } | null;
  uploadedAt: string;
  processedAt: string | null;
}

type Tab = 'gallery' | 'upload';

// ─── Toast Component ──────────────────────────────────────────────────────────

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colours = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-sky-500',
  };

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl text-white text-sm shadow-2xl animate-fade-up ${colours[type]}`}
    >
      {type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-page animate-pulse">
      {/* Header skeleton */}
      <div className="h-14 bg-white border-b border-default" />
      {/* Hero skeleton */}
      <div className="h-52 bg-gradient-to-br from-slate-200 to-sky-100" />
      {/* Grid skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-sky-100/60" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PublicGalleryPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<Tab>('gallery');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  // ── Data fetching ────────────────────────────────────────────────────────

  const fetchPhotos = useCallback(async (eventId: string) => {
    try {
      const res = await fetch(`/api/public/photos?eventId=${eventId}&limit=200`);
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.data?.photos || []);
      }
    } catch (err) {
      console.error('[Gallery] Failed to fetch photos:', err);
    }
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/code/${code}`);
        if (!res.ok) {
          router.push('/404');
          return;
        }
        const data = await res.json();
        const ev: PublicEvent = data.data.event;
        setEvent(ev);
        await fetchPhotos(ev.id);
      } catch (err) {
        console.error('[Gallery] Failed to fetch event:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [code, router, fetchPhotos]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleUploadComplete = useCallback(async () => {
    if (!event) return;
    await fetchPhotos(event.id);
    setSelectedTab('gallery');
    showToast(
      event.settings?.photoApproval && !event.settings?.autoApprove
        ? 'Photo uploaded! It will appear after review.'
        : 'Photo uploaded successfully!',
      'success'
    );
  }, [event, fetchPhotos, showToast]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event?.name,
          text: event?.description || undefined,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!', 'info');
      }
    } catch {
      // User cancelled share — ignore
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  // ── Loading / Error states ────────────────────────────────────────────────

  if (isLoading) return <PageSkeleton />;

  if (!event) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
            <Images className="w-8 h-8 text-sky" />
          </div>
          <h2 className="text-xl font-semibold text-slate mb-2">Event Not Found</h2>
          <p className="text-sky text-sm">This event does not exist or is no longer available.</p>
        </div>
      </div>
    );
  }

  const guestUploadEnabled = Boolean(event.settings?.allowGuestUpload);
  const startDate = formatDate(event.startDate);

  return (
    <div className="min-h-screen bg-page">

      {/* ── Sticky Header ──────────────────────────────────────────────── */}
      <header className="bg-white/90 backdrop-blur border-b border-default sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate tracking-tight">Momen</span>
          </div>

          <div className="flex items-center gap-2">
            {guestUploadEnabled && (
              <button
                onClick={() => setSelectedTab('upload')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate text-white hover:bg-slate/90 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload</span>
              </button>
            )}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-sky hover:text-slate hover:bg-cream transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--color-slate) 0%, #4a7a9b 50%, var(--color-sky) 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-8 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute top-8 left-1/3 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative container mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-3xl mx-auto text-center text-white">
            {/* Photo count badge */}
            {photos.length > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white/90 text-xs font-medium mb-4">
                <Images className="w-3.5 h-3.5" />
                {photos.length} photo{photos.length !== 1 ? 's' : ''}
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight text-white">
              {event.name}
            </h1>

            {event.description && (
              <p className="text-white/75 text-sm sm:text-base mb-5 max-w-xl mx-auto leading-relaxed">
                {event.description}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-4 text-white/80 text-sm">
              {startDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>{startDate}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab bar at bottom of hero */}
        <div className="border-t border-white/10 bg-white/10 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-1">
              <button
                onClick={() => setSelectedTab('gallery')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${selectedTab === 'gallery'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/60 hover:text-white/90'
                  }`}
              >
                <span className="flex items-center gap-1.5">
                  <Images className="w-4 h-4" />
                  Gallery {photos.length > 0 && `(${photos.length})`}
                </span>
              </button>

              {guestUploadEnabled && (
                <button
                  onClick={() => setSelectedTab('upload')}
                  className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${selectedTab === 'upload'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/60 hover:text-white/90'
                    }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-4 h-4" />
                    Add Photos
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <main className="container mx-auto px-4 py-8">

        {/* Gallery tab */}
        {selectedTab === 'gallery' && (
          <div>
            {photos.length === 0 ? (
              <EmptyGallery
                guestUploadEnabled={guestUploadEnabled}
                onUploadClick={() => setSelectedTab('upload')}
              />
            ) : (
              <PhotoGallery photos={photos} mode="view" />
            )}
          </div>
        )}

        {/* Upload tab */}
        {selectedTab === 'upload' && guestUploadEnabled && (
          <div className="max-w-2xl mx-auto">
            {/* Back link */}
            <button
              onClick={() => setSelectedTab('gallery')}
              className="inline-flex items-center gap-1.5 text-sm text-sky hover:text-slate mb-6 transition-colors"
            >
              <ArrowUp className="w-4 h-4 rotate-[-90deg]" />
              Back to gallery
            </button>

            <div className="bg-white rounded-2xl border border-default shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate">Add Your Photos</h2>
                <p className="text-sm text-sky mt-1">
                  Share your memories from <strong className="text-slate">{event.name}</strong>
                </p>
              </div>

              <PhotoUpload
                eventId={event.id}
                onUploadComplete={handleUploadComplete}
                onUploadError={(msg) => showToast(msg, 'error')}
              />

              {event.settings?.photoApproval && !event.settings?.autoApprove && (
                <div className="mt-5 flex items-start gap-3 p-4 bg-sky-50 border border-sky-200 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate">
                    Your photos will be reviewed by the organizer before appearing in the gallery.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-default py-8 mt-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-slate flex items-center justify-center">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-slate text-sm">Momen</span>
          </div>
          <p className="text-xs text-sky">Event photo sharing, made simple.</p>
        </div>
      </footer>

      {/* ── Toast ──────────────────────────────────────────────────────── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={dismissToast} />
      )}
    </div>
  );
}

// ─── Empty State Component ────────────────────────────────────────────────────

function EmptyGallery({
  guestUploadEnabled,
  onUploadClick,
}: {
  guestUploadEnabled: boolean;
  onUploadClick: () => void;
}) {
  return (
    <div className="text-center py-20">
      {/* Illustration */}
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sky-100 to-ice/40 flex items-center justify-center shadow-inner">
          <Images className="w-12 h-12 text-sky" />
        </div>
        {guestUploadEnabled && (
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate flex items-center justify-center shadow-lg">
            <Upload className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      <h3 className="text-xl font-semibold text-slate mb-2">No photos yet</h3>
      <p className="text-sky text-sm max-w-xs mx-auto leading-relaxed">
        {guestUploadEnabled
          ? 'Be the first to share a memory from this event!'
          : 'Photos will appear here once the organizer approves them.'}
      </p>

      {guestUploadEnabled && (
        <button
          onClick={onUploadClick}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate text-white text-sm font-medium hover:bg-slate/90 transition-colors shadow-md"
        >
          <Upload className="w-4 h-4" />
          Upload a Photo
        </button>
      )}
    </div>
  );
}
