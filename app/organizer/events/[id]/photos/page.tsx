/**
 * Momen Event Photos Page
 * Manage photos for a specific event
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Filter, Check } from 'lucide-react';
import Link from 'next/link';
import { PhotoUpload } from '@/components/photos/PhotoUpload';
import { PhotoGallery } from '@/components/photos/PhotoGallery';
import type { IPhoto } from '@/lib/validation/photo.schema';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function EventPhotosPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<{ id: string; name: string; shortCode: string } | null>(null);
  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('approved');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
    fetchPhotos();
  }, [eventId, statusFilter]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data.data.event);
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
    }
  };

  const fetchPhotos = async () => {
    try {
      setIsLoading(true);
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const res = await fetch(`/api/photos?eventId=${eventId}${status ? `&status=${status}` : ''}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.data.photos || []);
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = () => {
    setSelectedIds([]);
    fetchPhotos();
  };

  const handlePhotoApprove = async (photoId: string) => {
    try {
      const res = await fetch(`/api/photos/${photoId}/approve`, { method: 'POST' });
      if (res.ok) {
        setPhotos(photos.map((p) => (p.id === photoId ? { ...p, status: 'approved' as const } : p)));
        setSelectedIds(selectedIds.filter((id) => id !== photoId));
      }
    } catch (error) {
      console.error('Failed to approve photo:', error);
    }
  };

  const handlePhotoReject = async (photoId: string) => {
    try {
      const res = await fetch(`/api/photos/${photoId}/reject`, { method: 'POST' });
      if (res.ok) {
        setPhotos(photos.map((p) => (p.id === photoId ? { ...p, status: 'rejected' as const } : p)));
        setSelectedIds(selectedIds.filter((id) => id !== photoId));
      }
    } catch (error) {
      console.error('Failed to reject photo:', error);
    }
  };

  const handlePhotoDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const res = await fetch(`/api/photos/${photoId}`, { method: 'DELETE' });
      if (res.ok) {
        setPhotos(photos.filter((p) => p.id !== photoId));
        setSelectedIds(selectedIds.filter((id) => id !== photoId));
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;

    try {
      const res = await fetch('/api/photos/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', photoIds: selectedIds }),
      });

      if (res.ok) {
        setSelectedIds([]);
        fetchPhotos();
      }
    } catch (error) {
      console.error('Failed to bulk approve:', error);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;

    try {
      const res = await fetch('/api/photos/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', photoIds: selectedIds }),
      });

      if (res.ok) {
        setSelectedIds([]);
        fetchPhotos();
      }
    } catch (error) {
      console.error('Failed to bulk reject:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} photo(s)?`)) return;

    try {
      const res = await fetch('/api/photos/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', photoIds: selectedIds }),
      });

      if (res.ok) {
        setSelectedIds([]);
        fetchPhotos();
      }
    } catch (error) {
      console.error('Failed to bulk delete:', error);
    }
  };

  const pendingCount = photos.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/organizer/events"
            className="p-2 rounded-md hover:bg-cream/40 text-sky"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate">Photos</h1>
            <p className="text-sky">
              {event?.name || 'Event'} • {photos.length} photo{photos.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <Link
          href={`/e/${event?.shortCode}`}
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 border border-default rounded-md text-sm font-medium text-slate hover:bg-cream/40 transition-colors"
        >
          View Public Gallery
        </Link>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && statusFilter !== 'rejected' && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-slate">{pendingCount} photo{pendingCount === 1 ? '' : 's'} awaiting approval</p>
            <p className="text-sm text-sky">Review and approve photos to show them in the gallery</p>
          </div>
          <button
            onClick={() => setStatusFilter('pending')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-warning text-white rounded-md font-medium hover:bg-warning/90 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Review
          </button>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-card rounded-lg border border-default p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate">Upload Photos</h2>
        </div>
        <PhotoUpload
          eventId={eventId}
          onUploadComplete={handleUploadComplete}
          onUploadError={(error) => alert(error)}
        />
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-default">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setStatusFilter('approved')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${statusFilter === 'approved'
                ? 'border-slate text-slate'
                : 'border-transparent text-sky hover:text-slate'
              }`}
          >
            Approved
          </button>
          {pendingCount > 0 && (
            <button
              onClick={() => setStatusFilter('pending')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors relative ${statusFilter === 'pending'
                  ? 'border-slate text-slate'
                  : 'border-transparent text-sky hover:text-slate'
                }`}
            >
              Pending
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-warning text-white text-xs rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            </button>
          )}
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${statusFilter === 'rejected'
                ? 'border-slate text-slate'
                : 'border-transparent text-sky hover:text-slate'
              }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${statusFilter === 'all'
                ? 'border-slate text-slate'
                : 'border-transparent text-sky hover:text-slate'
              }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-card border border-default rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-slate">
            {selectedIds.length} selected
          </span>
          <div className="flex items-center gap-2">
            {statusFilter === 'pending' && (
              <>
                <button
                  onClick={handleBulkApprove}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success text-white text-sm rounded-md hover:bg-success/90 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Approve All
                </button>
                <button
                  onClick={handleBulkReject}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-error text-white text-sm rounded-md hover:bg-error/90 transition-colors"
                >
                  Reject All
                </button>
              </>
            )}
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-error text-white text-sm rounded-md hover:bg-error/90 transition-colors"
            >
              Delete All
            </button>
          </div>
        </div>
      )}

      {/* Gallery */}
      <PhotoGallery
        photos={photos}
        mode={statusFilter === 'pending' ? 'approve' : 'manage'}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onPhotoApprove={handlePhotoApprove}
        onPhotoReject={handlePhotoReject}
        onPhotoDelete={handlePhotoDelete}
        isLoading={isLoading}
      />
    </div>
  );
}
