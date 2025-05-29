import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';

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
    organizer: {
        id: number;
        name: string;
        email: string;
    };
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
    user?: {
        name: string;
        email: string;
    };
}

interface ShowProps {
    event: Event;
}

export default function Show({ event }: ShowProps) {
    const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
    const [isBooking, setIsBooking] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Events', href: '/events' },
        { title: event.name, href: `/events/${event.id}` },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-yellow-100 text-yellow-800';
            case 'canceled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSeatColor = (seat: Seat) => {
        if (selectedSeats.includes(seat.id)) {
            return 'bg-blue-500 text-white border-blue-600';
        }
        switch (seat.status) {
            case 'available': return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 cursor-pointer';
            case 'sold': return 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed';
            case 'reserved': return 'bg-yellow-100 text-yellow-800 border-yellow-300 cursor-not-allowed';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };

    const handleSeatClick = (seat: Seat) => {
        if (seat.status !== 'available') return;

        setSelectedSeats(prev => {
            if (prev.includes(seat.id)) {
                return prev.filter(id => id !== seat.id);
            } else {
                return [...prev, seat.id];
            }
        });
    };

    const handleBookSeats = async () => {
        if (selectedSeats.length === 0) return;
        
        setIsBooking(true);
        try {
            for (const seatId of selectedSeats) {
                router.post(`/seats/${seatId}/book`, {}, {
                    preserveState: false
                });
            }
            setSelectedSeats([]);
        } catch (error) {
            console.error('Booking failed:', error);
        } finally {
            setIsBooking(false);
        }
    };

    const getTotalPrice = () => {
        return selectedSeats.reduce((total, seatId) => {
            const seat = event.seats.find(s => s.id === seatId);
            return total + (seat?.price || 0);
        }, 0);
    };

    const getAvailableSeats = () => event.seats.filter(seat => seat.status === 'available').length;
    const getSoldSeats = () => event.seats.filter(seat => seat.status === 'sold').length;

    // Group seats by row for better visualization
    const seatsByRow = event.seats.reduce((acc, seat) => {
        if (!acc[seat.row]) {
            acc[seat.row] = [];
        }
        acc[seat.row].push(seat);
        return acc;
    }, {} as Record<string, Seat[]>);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${event.name} - Event Details`} />
            
            <div className="p-6">
                {/* Event Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{event.name}</h1>
                            <Badge className={getStatusColor(event.status)}>
                                {event.status}
                            </Badge>
                        </div>
                        <Link
                            href="/admin/events"
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                        >
                            Back to Events
                        </Link>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">{event.description}</p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Event Details</h3>
                            <div className="space-y-1 text-sm">
                                <div><strong>Location:</strong> {event.location}</div>
                                <div><strong>Date:</strong> {formatDate(event.event_date)}</div>
                                <div><strong>Start:</strong> {formatTime(event.start_time)}</div>
                                <div><strong>End:</strong> {formatTime(event.end_time)}</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Organizer</h3>
                            <div className="space-y-1 text-sm">
                                <div><strong>Name:</strong> {event.organizer ? event.organizer.name : '-'}</div>
                                <div><strong>Email:</strong> {event.organizer ? event.organizer.email : '-'}</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Pricing</h3>
                            <div className="space-y-1 text-sm">
                                <div><strong>Base Price:</strong> {formatCurrency(event.price)}</div>
                                <div><strong>Max Seats:</strong> {event.max_seats}</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Availability</h3>
                            <div className="space-y-1 text-sm">
                                <div className="text-green-600"><strong>Available:</strong> {getAvailableSeats()}</div>
                                <div className="text-red-600"><strong>Sold:</strong> {getSoldSeats()}</div>
                                <div className="text-blue-600"><strong>Total:</strong> {event.seats.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seat Map */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seat Map</h2>
                        <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                                <span>Available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                                <span>Sold</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                                <span>Reserved</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded"></div>
                                <span>Selected</span>
                            </div>
                        </div>
                    </div>

                    {/* Stage */}
                    <div className="bg-gray-200 dark:bg-gray-700 text-center py-4 mb-8 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400 font-semibold">STAGE</span>
                    </div>

                    {/* Seats Grid */}
                    <div className="space-y-4">
                        {Object.entries(seatsByRow)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([row, seats]) => (
                                <div key={row} className="flex items-center gap-2">
                                    <div className="w-8 text-center font-semibold text-gray-600 dark:text-gray-400">
                                        {row}
                                    </div>
                                    <div className="flex gap-1 flex-wrap">
                                        {seats
                                            .sort((a, b) => a.seat_number.localeCompare(b.seat_number))
                                            .map((seat) => (
                                                <button
                                                    key={seat.id}
                                                    onClick={() => handleSeatClick(seat)}
                                                    className={`w-10 h-10 text-xs font-medium border rounded transition-colors ${getSeatColor(seat)}`}
                                                    disabled={seat.status !== 'available'}
                                                    title={`Seat ${seat.seat_number} - ${formatCurrency(seat.price)} - ${seat.status}`}
                                                >
                                                    {seat.seat_number}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Booking Summary */}
                {selectedSeats.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Summary</h3>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Selected {selectedSeats.length} seat(s)
                                </p>
                                <p className="text-sm text-gray-500">
                                    Seats: {selectedSeats.map(id => {
                                        const seat = event.seats.find(s => s.id === id);
                                        return seat?.seat_number;
                                    }).join(', ')}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(getTotalPrice())}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleBookSeats}
                                disabled={isBooking}
                                className="flex-1"
                            >
                                {isBooking ? 'Booking...' : 'Book Selected Seats'}
                            </Button>
                            <Button
                                onClick={() => setSelectedSeats([])}
                                variant="outline"
                            >
                                Clear Selection
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
