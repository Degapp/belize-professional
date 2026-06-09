'use client';

import { Play } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResourcesPage() {
  const router = useRouter();
  const [activeVideo, setActiveVideo] = useState(null);

  const videos = [
    {
      id: 1,
      title: 'Client Management Overview',
      description: 'Professional CRM tutorial covering client management fundamentals, contact organization, and relationship tracking for modern professionals.',
      thumbnail: 'https://img.youtube.com/vi/8VUWyMVK2Uc/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/8VUWyMVK2Uc',
      duration: '43:25'
    },
    {
      id: 2,
      title: 'Document Upload & Management',
      description: 'Step-by-step guide on uploading client documents, organizing files, and accessing stored documents securely.',
      thumbnail: 'https://img.youtube.com/vi/ZPPikY3Qn7Q/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/ZPPikY3Qn7Q',
      duration: '4:15'
    },
    {
      id: 3,
      title: 'Time Tracking & Billing',
      description: 'Master the time tracking features including the live timer, manual entries, and generating accurate billing reports.',
      thumbnail: 'https://img.youtube.com/vi/Xnk4seEHmgw/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/Xnk4seEHmgw',
      duration: '6:45'
    },
    {
      id: 4,
      title: 'Creating & Sending Invoices',
      description: 'Complete walkthrough of creating professional invoices, customizing templates, and sending them to clients via email.',
      thumbnail: 'https://img.youtube.com/vi/KsAq3H4ErHU/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/KsAq3H4ErHU',
      duration: '7:20'
    },
    {
      id: 5,
      title: 'Appointment Scheduling & Reminders',
      description: 'Learn to schedule appointments, sync with Google Calendar, and set up automated reminders for clients.',
      thumbnail: 'https://img.youtube.com/vi/qKcB4FwLogQ/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/qKcB4FwLogQ',
      duration: '5:50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="#" onClick={() => router.push('/')} className="flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <i className="ph-light ph-squares-four text-2xl font-bold"></i>
            </div>
            <span className="font-clash font-semibold text-2xl tracking-tight text-slate-900">Belize Professional<span className="text-brand-600">.</span></span>
          </a>

          <nav className="hidden lg:flex items-center gap-8">
            <a href="#" onClick={() => router.push('/dashboard')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Dashboard</a>
            <a href="#" onClick={() => router.push('/analytics')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Analytics</a>
            <a href="#" onClick={() => router.push('/features')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Features</a>
            <a href="#" onClick={() => router.push('/professionals')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Professionals</a>
            <a href="#" onClick={() => router.push('/invoicing')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Explore Interactive Invoicing</a>
            <a href="#" onClick={() => router.push('/resources')} className="relative py-2 text-sm font-semibold text-brand-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-600 after:rounded-full cursor-pointer">Resources</a>
            <a href="#" onClick={() => router.push('/accounting')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Accounting</a>
            <a href="#" onClick={() => router.push('/support')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Support</a>
            <a href="#" onClick={() => router.push('/about')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">About Us</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98]">
              Contact Sales
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Learning Resources</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Watch our video tutorials to master the Belize Professionals platform and maximize your productivity
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
              {/* Video Container */}
              <div className="relative aspect-video bg-gray-900">
                {activeVideo === video.id ? (
                  <iframe
                    width="560"
                    height="315"
                    className="w-full h-full"
                    src={`${video.videoUrl}?autoplay=1&rel=0`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <>
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group hover:bg-opacity-50 transition-all cursor-pointer"
                         onClick={() => setActiveVideo(video.id)}>
                      <div className="bg-blue-600 rounded-full p-4 group-hover:bg-blue-700 transition-colors">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </>
                )}
              </div>

              {/* Video Info */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {video.description}
                </p>
                {activeVideo !== video.id && (
                  <button
                    onClick={() => setActiveVideo(video.id)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Watch Tutorial
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Resources Section */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Start Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">Getting Started</h3>
              <p className="text-gray-600 text-sm">
                New to the platform? Start with the Client Management video to understand the basics.
              </p>
            </div>
            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">Advanced Features</h3>
              <p className="text-gray-600 text-sm">
                Already familiar? Check out Time Tracking and Invoice Management for advanced workflows.
              </p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">Tips & Best Practices</h3>
              <p className="text-gray-600 text-sm">
                Watch all tutorials to discover productivity tips and professional best practices.
              </p>
            </div>
            <div className="border-l-4 border-orange-600 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">Need Help?</h3>
              <p className="text-gray-600 text-sm">
                Contact support if you have questions not covered in these tutorials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
