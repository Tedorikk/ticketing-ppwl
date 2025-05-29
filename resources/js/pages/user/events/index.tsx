import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Events', href: '/events' },
];

interface Event {
    id: number;
    name: string;
    description: string;
    location: string;
    event_date: string;
    start_time: string;
    end_time: string;
    status: 'active' | 'inactive' | 'canceled';
    max_seats: number;
    price: number;
    seats: Seat[];
}

interface Seat {
    id: number;
    seat_number: string;
    row: string;
    section: string;
    price: number;
    status: 'available' | 'sold' | 'reserved';
    user_id?: number;
}

interface IndexProps {
    events: Event[];
}

export default function Index({ events }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-yellow-100 text-yellow-800';
            case 'canceled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getAvailableSeats = (seats: Seat[]) => {
        return seats.filter(seat => seat.status === 'available').length;
    };

    const getSoldSeats = (seats: Seat[]) => {
        return seats.filter(seat => seat.status === 'sold').length;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };

    const handleEdit = (event: Event) => {
        setSelectedEvent(event);
        setShowEditModal(true);
    };

    const handleDelete = (eventId: number) => {
        if (confirm('Are you sure you want to delete this event?')) {
            router.delete(`/admin/events/${eventId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Events" />
            
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events</h1>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-6">
                    <Input
                        type="text"
                        placeholder="Search events by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                </div>

                {/* Events Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            {/* Event Header */}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                        {event.name}
                                    </h3>
                                    <Badge className={getStatusColor(event.status)}>
                                        {event.status}
                                    </Badge>
                                </div>

                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                    {event.description}
                                </p>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <span className="w-20 font-medium">Location:</span>
                                        <span>{event.location}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <span className="w-20 font-medium">Date:</span>
                                        <span>{formatDate(event.event_date)}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <span className="w-20 font-medium">Price:</span>
                                        <span className="font-semibold text-green-600">{formatCurrency(event.price)}</span>
                                    </div>
                                </div>

                                {/* Seat Statistics */}
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                        <div>
                                            <div className="text-green-600 font-bold">{getAvailableSeats(event.seats)}</div>
                                            <div className="text-gray-500">Available</div>
                                        </div>
                                        <div>
                                            <div className="text-red-600 font-bold">{getSoldSeats(event.seats)}</div>
                                            <div className="text-gray-500">Sold</div>
                                        </div>
                                        <div>
                                            <div className="text-blue-600 font-bold">{event.max_seats}</div>
                                            <div className="text-gray-500">Total</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-4 flex gap-2">
                                    <Link
                                        href={`/admin/events/${event.id}`}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-3 rounded-md text-sm font-medium transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
