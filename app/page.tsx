/**
 * Momen Landing Page
 * Public homepage with call-to-action for organizers and guests
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { Camera, Users, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-page">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-slate mb-6">
              Capture Every Moment,
              <br />
              <span className="text-sky">Share Every Memory</span>
            </h1>
            <p className="text-xl text-sky mb-8 max-w-2xl mx-auto">
              The modern event photo sharing platform for organizers who care about creating unforgettable experiences.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-slate text-white rounded-md font-medium hover:bg-slate-900 transition-colors shadow-md hover:shadow-lg"
              >
                <Camera className="w-5 h-5" />
                Organize an Event
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-slate border border-slate rounded-md font-medium hover:bg-cream transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate mb-16">
            Everything You Need to Run Event Photography
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-ice/20 flex items-center justify-center text-sky">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate mb-2">Easy Photo Upload</h3>
              <p className="text-sky">
                Guests can upload photos in seconds. No app download required.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-ice/20 flex items-center justify-center text-sky">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate mb-2">Guest Gallery</h3>
              <p className="text-sky">
                Beautiful public gallery for your event. Share memories instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-ice/20 flex items-center justify-center text-sky">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate mb-2">Organizer Dashboard</h3>
              <p className="text-sky">
                Manage your events, moderate photos, and view statistics all in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-cream">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate mb-6">
            Ready to Create Your First Event?
          </h2>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-sky text-white rounded-md font-medium hover:bg-sky-600 transition-colors shadow-md hover:shadow-lg"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-default">
        <div className="container mx-auto px-4 text-center text-sm text-sky">
          <p>&copy; {new Date().getFullYear()} Momen. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
