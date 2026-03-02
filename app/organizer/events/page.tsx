/**
 * Momen Events Page
 * List and manage events
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EventList } from '@/components/events/EventList';
import type { IEvent } from '@/lib/db/schema';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.data?.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setEvents(events.filter((e) => e.id !== eventId));
      } else {
        const data = await res.json();
        alert(data.error?.message || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event');
    }
  };

  const handleStatusChange = async (eventId: string, status: 'draft' | 'active' | 'ended') => {
    try {
      const res = await fetch(`/api/events/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setEvents(events.map((e) => (e.id === eventId ? { ...e, status } : e)));
      } else {
        const data = await res.json();
        alert(data.error?.message || 'Failed to update event status');
      }
    } catch (error) {
      console.error('Failed to update event status:', error);
      alert('Failed to update event status');
    }
  };

  // Handle "New Event" button click
  useEffect(() => {
    const handleNewEventClick = () => {
      router.push('/organizer/events/new');
    };

    // Add event listener for the "New Event" buttons in EventList
    const buttons = document.querySelectorAll('button[type="button"]');
    buttons.forEach((button) => {
      if (button.textContent?.includes('New Event') || button.textContent?.includes('Create Event')) {
        button.addEventListener('click', handleNewEventClick);
      }
    });

    return () => {
      buttons.forEach((button) => {
        if (button.textContent?.includes('New Event') || button.textContent?.includes('Create Event')) {
          button.removeEventListener('click', handleNewEventClick);
        }
      });
    };
  }, [router]);

  return (
    <div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card rounded-lg border border-default p-5 animate-pulse">
              <div className="h-4 bg-cream/60 rounded w-3/4 mb-3" />
              <div className="h-3 bg-cream/40 rounded w-1/2 mb-2" />
              <div className="h-3 bg-cream/40 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <EventList
          initialEvents={events}
          onEventDelete={handleDelete}
          onEventStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
