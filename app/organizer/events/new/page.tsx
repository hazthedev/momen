/**
 * Momen New Event Page
 * Create a new event
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EventForm, EventFormData } from '@/components/events/EventForm';

export default function NewEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: EventFormData) => {
    setIsLoading(true);

    try {
      // Combine date and time
      const startDate = new Date(`${data.startDate}T${data.startTime}`);
      const endDate = data.endDate && data.endTime
        ? new Date(`${data.endDate}T${data.endTime}`)
        : undefined;

      const res = await fetch('/api/events', {
        method: 'POST',
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
        throw new Error(error.error?.message || 'Failed to create event');
      }

      const result = await res.json();
      router.push(`/organizer/events/${result.data.event.id}`);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate">Create New Event</h1>
        <p className="text-sky">Fill in the details to create a new event</p>
      </div>

      <div className="bg-card rounded-lg border border-default p-6">
        <EventForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
