/**
 * Momen Event List Component
 * Display and manage events with filtering
 */

'use client';

import { useState } from 'react';
import { Search, Plus, Filter, Calendar, List } from 'lucide-react';
import { EventCard } from './EventCard';
import type { Event } from '@/lib/db/schema';

interface EventListProps {
  initialEvents?: Event[];
  onEventDelete?: (eventId: string) => void;
  onEventStatusChange?: (eventId: string, status: 'draft' | 'active' | 'ended') => void;
}

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'draft' | 'active' | 'ended';

export function EventList({ initialEvents = [], onEventDelete, onEventStatusChange }: EventListProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<'created_at' | 'start_date' | 'name'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort events
  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'start_date':
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleDelete = async (eventId: string) => {
    if (onEventDelete) {
      await onEventDelete(eventId);
      setEvents(events.filter((e) => e.id !== eventId));
    }
  };

  const handleStatusChange = async (eventId: string, status: 'draft' | 'active' | 'ended') => {
    if (onEventStatusChange) {
      await onEventStatusChange(eventId, status);
      setEvents(events.map((e) => (e.id === eventId ? { ...e, status } : e)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate">Events</h2>
          <p className="text-sky">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate text-white rounded-md font-medium hover:bg-slate-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ice/50 focus:border-ice"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-sky" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="h-10 px-3 pr-8 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ice/50 focus:border-ice"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky" />
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
              setSortBy(field);
              setSortOrder(order);
            }}
            className="h-10 px-3 pr-8 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ice/50 focus:border-ice"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="start_date-asc">Upcoming First</option>
            <option value="start_date-desc">Past Events</option>
            <option value="name-asc">A-Z</option>
            <option value="name-desc">Z-A</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 border border-input rounded-md p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${
              viewMode === 'grid' ? 'bg-cream/60 text-slate' : 'text-sky hover:text-slate'
            }`}
            title="Grid view"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${
              viewMode === 'list' ? 'bg-cream/60 text-slate' : 'text-sky hover:text-slate'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Events Grid/List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-sky mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate mb-2">No events found</h3>
          <p className="text-sky mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Get started by creating your first event'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate text-white rounded-md font-medium hover:bg-slate-900 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </button>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          }
        >
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={{ ...event, photo_count: 0, settings: event.settings as { photoApproval?: boolean; allowGuestUpload?: boolean; autoApprove?: boolean } | undefined }}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
