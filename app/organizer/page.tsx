/**
 * Momen Organizer Dashboard
 * Main dashboard with stats and recent events
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Image, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { EventCard } from '@/components/events/EventCard';

interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalPhotos: number;
  recentUploads: number;
}

interface RecentEvent {
  id: string;
  name: string;
  shortCode: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  status: 'draft' | 'active' | 'ended';
  settings: Record<string, unknown>;
  photo_count?: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    activeEvents: 0,
    totalPhotos: 0,
    recentUploads: 0,
  });
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats and recent events
      const [statsRes, eventsRes] = await Promise.all([
        fetch('/api/organizer/stats'),
        fetch('/api/events?limit=5&sortBy=created_at&sortOrder=desc'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data || stats);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setRecentEvents(eventsData.data?.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'bg-sky/20 text-sky',
      trend: null,
    },
    {
      label: 'Active Events',
      value: stats.activeEvents,
      icon: TrendingUp,
      color: 'bg-success/20 text-success',
      trend: stats.totalEvents > 0 ? `${Math.round((stats.activeEvents / stats.totalEvents) * 100)}% of total` : null,
    },
    {
      label: 'Total Photos',
      value: stats.totalPhotos,
      icon: Image,
      color: 'bg-ice/20 text-slate',
      trend: null,
    },
    {
      label: 'Recent Uploads',
      value: stats.recentUploads,
      icon: Image,
      color: 'bg-sky/30 text-slate',
      trend: 'Last 7 days',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate">Dashboard</h1>
          <p className="text-sky">Welcome back! Here&apos;s what&apos;s happening with your events.</p>
        </div>

        <Link
          href="/organizer/events/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate text-white rounded-md font-medium hover:bg-slate-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Event
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card rounded-lg border border-default p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-sky">{stat.label}</p>
                <p className="text-2xl font-bold text-slate mt-1">
                  {isLoading ? '—' : stat.value.toLocaleString()}
                </p>
                {stat.trend && (
                  <p className="text-xs text-sky mt-1">{stat.trend}</p>
                )}
              </div>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/organizer/events/new"
          className="bg-card rounded-lg border border-default p-5 hover:border-ice/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky/20 text-sky">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-slate">Create Event</p>
              <p className="text-sm text-sky">Set up a new event</p>
            </div>
            <ArrowRight className="w-4 h-4 text-sky ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/organizer/events"
          className="bg-card rounded-lg border border-default p-5 hover:border-ice/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky/20 text-sky">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-slate">Manage Events</p>
              <p className="text-sm text-sky">View and edit events</p>
            </div>
            <ArrowRight className="w-4 h-4 text-sky ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/organizer/photos"
          className="bg-card rounded-lg border border-default p-5 hover:border-ice/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky/20 text-sky">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-slate">Photo Gallery</p>
              <p className="text-sm text-sky">Browse all photos</p>
            </div>
            <ArrowRight className="w-4 h-4 text-sky ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate">Recent Events</h2>
          <Link
            href="/organizer/events"
            className="text-sm text-sky hover:text-slate"
          >
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg border border-default p-5 animate-pulse">
                <div className="h-4 bg-cream/60 rounded w-3/4 mb-3" />
                <div className="h-3 bg-cream/40 rounded w-1/2 mb-2" />
                <div className="h-3 bg-cream/40 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : recentEvents.length === 0 ? (
          <div className="bg-card rounded-lg border border-default p-8 text-center">
            <Calendar className="w-12 h-12 text-sky mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate mb-2">No events yet</h3>
            <p className="text-sky mb-4">Create your first event to get started</p>
            <Link
              href="/organizer/events/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate text-white rounded-md font-medium hover:bg-slate-900 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
