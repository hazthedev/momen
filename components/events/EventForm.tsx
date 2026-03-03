/**
 * Momen Event Form Component
 * Create and edit events
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Info, Settings, Loader2 } from 'lucide-react';
import type { Event } from '@/lib/db/schema';

interface EventSettings {
  photoApproval?: boolean;
  maxPhotos?: number;
  autoApprove?: boolean;
  allowGuestUpload?: boolean;
}

interface EventFormProps {
  event?: Event;
  onSubmit: (data: EventFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface EventFormData {
  name: string;
  slug?: string;
  description?: string;
  location?: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  settings: EventSettings;
}

export function EventForm({ event, onSubmit, isLoading = false }: EventFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<EventFormData>({
    name: event?.name || '',
    slug: event?.slug || '',
    description: event?.description || '',
    location: event?.location || '',
    startDate: event?.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
    startTime: event?.startDate ? new Date(event.startDate).toTimeString().slice(0, 5) : '09:00',
    endDate: event?.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
    endTime: event?.endDate ? new Date(event.endDate).toTimeString().slice(0, 5) : '',
    settings: event?.settings || {
      photoApproval: false,
      maxPhotos: 1000,
      autoApprove: false,
      allowGuestUpload: true,
    },
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (!event && !formData.slug && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name, event, formData.slug]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Event name must be at least 3 characters';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date cannot be before start date';
    }
    if (formData.settings.maxPhotos && (formData.settings.maxPhotos < 1 || formData.settings.maxPhotos > 10000)) {
      newErrors.maxPhotos = 'Max photos must be between 1 and 10,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await onSubmit(formData);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Failed to save event' });
    }
  };

  const updateField = <K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateSetting = <K extends keyof EventSettings>(
    field: K,
    value: EventSettings[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      settings: { ...prev.settings, [field]: value },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Form Error */}
      {errors.form && (
        <div className="p-4 rounded-lg bg-error-light text-error">
          {errors.form}
        </div>
      )}

      {/* Basic Information */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-default">
          <Info className="w-5 h-5 text-slate" />
          <h3 className="text-lg font-semibold text-slate">Basic Information</h3>
        </div>

        {/* Event Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate mb-1">
            Event Name <span className="text-error">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            disabled={isLoading}
            className="w-full h-10 px-3 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ice/50 focus:border-ice disabled:opacity-50"
            placeholder="Annual Company Party 2026"
            required
          />
          {errors.name && <p className="text-sm text-error mt-1">{errors.name}</p>}
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-slate mb-1">
            URL Slug (optional)
          </label>
          <div className="flex items-center">
            <span className="text-sky text-sm mr-2">momen.app/e/</span>
            <input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              disabled={isLoading}
              className="flex-1 h-10 px-3 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ice/50 focus:border-ice disabled:opacity-50 font-mono text-sm"
              placeholder="annual-party-2026"
            />
          </div>
          <p className="text-xs text-sky mt-1">Leave empty to auto-generate from event name</p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            disabled={isLoading}
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ice/50 focus:border-ice disabled:opacity-50 resize-none"
            placeholder="Join us for an unforgettable evening of celebration..."
            maxLength={500}
          />
          <p className="text-xs text-sky mt-1 text-right">{formData.description?.length || 0} / 500</p>
        </div>
      </section>

      {/* Date & Location */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-default">
          <Calendar className="w-5 h-5 text-slate" />
          <h3 className="text-lg font-semibold text-slate">Date & Location</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate mb-1">
              Start Date <span className="text-error">*</span>
            </label>
            <input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => updateField('startDate', e.target.value)}
              disabled={isLoading}
              className="w-full h-10 px-3 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ice/50 focus:border-ice disabled:opacity-50"
              required
            />
            {errors.startDate && <p className="text-sm text-error mt-1">{errors.startDate}</p>}
          </div>

          {/* Start Time */}
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-slate mb-1">
              Start Time <span className="text-error">*</span>
            </label>
            <input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => updateField('startTime', e.target.value)}
              disabled={isLoading}
              className="w-full h-10 px-3 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ice/50 focus:border-ice disabled:opacity-50"
              required
            />
            {errors.startTime && <p className="text-sm text-error mt-1">{errors.startTime}</p>}
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-slate mb-1">
              End Date (optional)
            </label>
            <input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => updateField('endDate', e.target.value)}
              disabled={isLoading}
              min={formData.startDate}
              className="w-full h-10 px-3 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ice/50 focus:border-ice disabled:opacity-50"
            />
            {errors.endDate && <p className="text-sm text-error mt-1">{errors.endDate}</p>}
          </div>

          {/* End Time */}
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-slate mb-1">
              End Time (optional)
            </label>
            <input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => updateField('endTime', e.target.value)}
              disabled={isLoading}
              className="w-full h-10 px-3 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ice/50 focus:border-ice disabled:opacity-50"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate mb-1">
            Location (optional)
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky" />
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              disabled={isLoading}
              className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ice/50 focus:border-ice disabled:opacity-50"
              placeholder="Grand Ballroom, Hilton Hotel"
            />
          </div>
        </div>
      </section>

      {/* Settings */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-default">
          <Settings className="w-5 h-5 text-slate" />
          <h3 className="text-lg font-semibold text-slate">Photo Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photo Approval */}
          <div className="flex items-start gap-3">
            <input
              id="photoApproval"
              type="checkbox"
              checked={formData.settings.photoApproval}
              onChange={(e) => updateSetting('photoApproval', e.target.checked)}
              disabled={isLoading}
              className="mt-1 w-4 h-4 rounded border-input text-slate focus:ring-ice/50 disabled:opacity-50"
            />
            <div>
              <label htmlFor="photoApproval" className="text-sm font-medium text-slate">
                Require Photo Approval
              </label>
              <p className="text-xs text-sky mt-1">
                Review and approve photos before they appear in the gallery
              </p>
            </div>
          </div>

          {/* Auto-Approve */}
          <div className="flex items-start gap-3">
            <input
              id="autoApprove"
              type="checkbox"
              checked={formData.settings.autoApprove}
              onChange={(e) => updateSetting('autoApprove', e.target.checked)}
              disabled={isLoading}
              className="mt-1 w-4 h-4 rounded border-input text-slate focus:ring-ice/50 disabled:opacity-50"
            />
            <div>
              <label htmlFor="autoApprove" className="text-sm font-medium text-slate">
                Auto-Approve Photos
              </label>
              <p className="text-xs text-sky mt-1">
                Automatically approve uploaded photos (overrides approval setting)
              </p>
            </div>
          </div>

          {/* Guest Upload */}
          <div className="flex items-start gap-3">
            <input
              id="allowGuestUpload"
              type="checkbox"
              checked={formData.settings.allowGuestUpload}
              onChange={(e) => updateSetting('allowGuestUpload', e.target.checked)}
              disabled={isLoading}
              className="mt-1 w-4 h-4 rounded border-input text-slate focus:ring-ice/50 disabled:opacity-50"
            />
            <div>
              <label htmlFor="allowGuestUpload" className="text-sm font-medium text-slate">
                Allow Guest Upload
              </label>
              <p className="text-xs text-sky mt-1">
                Allow guests to upload photos without signing in
              </p>
            </div>
          </div>

          {/* Max Photos */}
          <div>
            <label htmlFor="maxPhotos" className="block text-sm font-medium text-slate mb-1">
              Maximum Photos
            </label>
            <input
              id="maxPhotos"
              type="number"
              value={formData.settings.maxPhotos}
              onChange={(e) => updateSetting('maxPhotos', parseInt(e.target.value) || 1000)}
              disabled={isLoading}
              min={1}
              max={10000}
              step={100}
              className="w-full h-10 px-3 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ice/50 focus:border-ice disabled:opacity-50"
            />
            {errors.maxPhotos && <p className="text-sm text-error mt-1">{errors.maxPhotos}</p>}
            <p className="text-xs text-sky mt-1">Limit the total number of photos for this event</p>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-default">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-slate hover:text-slate-900 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate text-white text-sm font-medium rounded-md hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : event ? (
            'Save Changes'
          ) : (
            'Create Event'
          )}
        </button>
      </div>
    </form>
  );
}
