'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const ROBOT_IMAGES = [
  '/robot-magician.jpg',
  '/robot-magician-2.jpg',
  '/robot-magician-3.jpg',
  '/robot-magician-4.jpg',
];

export default function NotFound() {
  const router = useRouter();
  const [imageSrc] = useState(
    () => ROBOT_IMAGES[Math.floor(Math.random() * ROBOT_IMAGES.length)]
  );

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center">
        {/* Robot Magician Image */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            <Image
              src={imageSrc}
              alt="Confused robot magician whose magic trick went wrong"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Poof! This page vanished
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Our robot&apos;s magic trick didn&apos;t go as planned.
        </p>

        {/* Error Code */}
        <p className="text-sm text-gray-400 mb-6 font-mono">
          Error 404
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium shadow-sm"
          >
            <Home className="w-5 h-5" />
            Back to homepage
          </Link>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Go back
          </button>
        </div>
      </div>
    </main>
  );
}
