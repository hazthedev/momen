/**
 * Momen Event Card Component
 * Display event information with actions
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Image, MoreVertical, Copy, ExternalLink, Trash2, Edit } from 'lucide-react';
import type { IEvent } from '@/lib/db/schema';

interface EventCardProps {
  event: IEvent & { photo_count?: number };
  onDelete?: (eventId: string) => void;
  onStatusChange?: (eventId: string, status: 'draft' | 'active' | 'ended') => void;
}

export function EventCard({ event, onDelete, onStatusChange }: EventCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return 'TBD';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const copyEventLink = () => {
    const link = `${window.location.origin}/e/${event.shortCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success';
      case 'ended':
        return 'bg-sky/30 text-sky';
      default:
        return 'bg-cream/60 text-sky';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'ended':
        return 'Ended';
      default:
        return 'Draft';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-default hover:border-ice/50 transition-colors group">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                {getStatusLabel(event.status)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate truncate">
              {event.name}
            </h3>
            {event.description && (
              <p className="text-sm text-sky mt-1 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-md hover:bg-cream/60 text-sky hover:text-slate transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-card rounded-lg border border-default shadow-lg py-1 z-10">
                <Link
                  href={`/organizer/events/${event.id}`}
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate hover:bg-cream/60"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={() => {
                    copyEventLink();
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate hover:bg-cream/60 w-full text-left"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <Link
                  href={`/e/${event.shortCode}`}
                  target="_blank"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate hover:bg-cream/60"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Public Page
                </Link>
                {event.status === 'draft' && onStatusChange && (
                  <button
                    onClick={() => {
                      onStatusChange(event.id, 'active');
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-success hover:bg-cream/60 w-full text-left"
                  >
                    Activate
                  </button>
                )}
                {event.status === 'active' && onStatusChange && (
                  <button
                    onClick={() => {
                      onStatusChange(event.id, 'ended');
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-warning hover:bg-cream/60 w-full text-left"
                  >
                    End Event
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this event?')) {
                        onDelete(event.id);
                      }
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 w-full text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-sky">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(event.startDate)}
              {event.startDate && (
                <span className="ml-1">{formatTime(event.startDate)}</span>
              )}
            </span>
            {event.endDate && event.endDate.getTime() !== event.startDate.getTime() && (
              <>
                <span>→</span>
                <span>{formatDate(event.endDate)}</span>
              </>
            )}
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-sky">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-sky">
            <Image className="w-4 h-4" />
            <span>{event.photo_count ?? 0} photos</span>
          </div>
        </div>

        {/* Settings Info */}
        {event.settings && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {event.settings.photoApproval && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-ice/20 text-slate">
                Photo Approval
              </span>
            )}
            {event.settings.allowGuestUpload && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-ice/20 text-slate">
                Guest Upload
              </span>
            )}
            {event.settings.autoApprove && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-success/20 text-success">
                Auto-Approve
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-default px-5 py-3 bg-cream/20">
        <div className="flex items-center justify-between">
          <div className="text-xs text-sky">
            Code: <span className="font-mono font-medium text-slate">{event.shortCode}</span>
          </div>
          <Link
            href={`/organizer/events/${event.id}/photos`}
            className="text-sm text-sky hover:text-slate font-medium"
          >
            Manage Photos →
          </Link>
        </div>
      </div>
    </div>
  );
}
