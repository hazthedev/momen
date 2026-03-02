/**
 * Momen Event Detail Page
 * View and edit a single event
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EventForm, EventFormData } from '@/components/events/EventForm';
import type { IEvent } from '@/lib/db/schema';

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<IEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data.data.event);
      } else {
        router.push('/organizer/events');
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
      router.push('/organizer/events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: EventFormData) => {
    setIsSaving(true);

    try {
      // Combine date and time
      const startDate = new Date(`${data.startDate}T${data.startTime}`);
      const endDate = data.endDate && data.endTime
        ? new Date(`${data.endDate}T${data.endTime}`)
        : undefined;

      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          description: data.description,
          location: data.location,
          startDate: startDate.toISOString(),
          endDate: endDate?.toISOString(),
          settings: data.settings,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to update event');
      }

      const result = await res.json();
      setEvent(result.data.event);
    } catch (error) {
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-card rounded-lg border border-default p-6 animate-pulse">
          <div className="h-8 bg-cream/60 rounded w-1/3 mb-6" />
          <div className="h-4 bg-cream/40 rounded w-full mb-4" />
          <div className="h-4 bg-cream/40 rounded w-3/4 mb-4" />
          <div className="h-10 bg-cream/40 rounded w-full mb-6" />
          <div className="h-32 bg-cream/40 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-sky">Event not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate">Edit Event</h1>
        <p className="text-sky">Update your event details</p>
      </div>

      <div className="bg-card rounded-lg border border-default p-6">
        <EventForm event={event} onSubmit={handleSubmit} isLoading={isSaving} />
      </div>
    </div>
  );
}
