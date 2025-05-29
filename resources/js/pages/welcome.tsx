import { Link } from '@inertiajs/react';
import { Ticket, ArrowRight } from 'lucide-react';

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="flex justify-center">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-full shadow-md">
            <Ticket className="w-10 h-10" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Welcome to <span className="text-blue-600">Ticketing PPWL</span>
        </h1>

        <p className="text-gray-600 text-lg md:text-xl">
          Streamline your event and issue management with a powerful yet easy-to-use ticketing platform.
        </p>

        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}