import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/user-layout';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Clock, Users, CreditCard, Eye, X, CheckCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Event {
    id: number;
    name: string;
    description: string;
    location: string;
    event_date: string;
    start_time: string;
    end_time: string;
}

interface Seat {
    id: number;
    seat_number: string;
    row: string;
    section: string;
    price: number;
}

interface Ticket {
    id: string;
    status: string;
    price: number;
    used_at?: string;
    seat: Seat;
}

interface Booking {
    id: number;
    total_amount: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    booking_time: string;
    event: Event;
    tickets: Ticket[];
}

interface BookingIndexProps {
    bookings: Booking[];
}

export default function BookingIndex({ bookings }: BookingIndexProps) {
    const [cancellingBooking, setCancellingBooking] = useState<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'My Bookings', href: '/my/bookings' },
    ];

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

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
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

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'text-green-600';
            case 'pending':
                return 'text-yellow-600';
            case 'cancelled':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const handleCancelBooking = (bookingId: number) => {
        setCancellingBooking(bookingId);
        
        router.patch(`/bookings/${bookingId}/cancel`, {}, {
            onSuccess: () => {
                setCancellingBooking(null);
            },
            onError: () => {
                setCancellingBooking(null);
            }
        });
    };

    const handleConfirmBooking = (bookingId: number) => {
        router.patch(`/bookings/${bookingId}/confirm`);
    };

    const getSeatNumbers = (tickets: Ticket[]) => {
        return tickets.map(ticket => `${ticket.seat.row}${ticket.seat.seat_number}`).join(', ');
    };

    const canCancelBooking = (booking: Booking) => {
        return ['pending', 'confirmed'].includes(booking.status) && 
               new Date(booking.event.event_date) > new Date();
    };

    const canConfirmBooking = (booking: Booking) => {
        return booking.status === 'pending';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Bookings" />
            
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage your event bookings and tickets
                        </p>
                    </div>
                    <Link href="/events">
                        <Button>
                            Browse Events
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Bookings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{bookings.length}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Confirmed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {bookings.filter(b => b.status === 'confirmed').length}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {bookings.filter(b => b.status === 'pending').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bookings List */}
                {bookings.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent className="space-y-4">
                            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <Calendar className="w-12 h-12 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    No bookings yet
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Start by browsing our amazing events and book your seats!
                                </p>
                            </div>
                            <Link href="/events">
                                <Button className="mt-4">
                                    Browse Events
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking) => (
                            <Card key={booking.id} className="overflow-hidden">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl">
                                                {booking.event.name}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-4">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {booking.event.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(booking.event.event_date)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {formatTime(booking.event.start_time)}
                                                </span>
                                            </CardDescription>
                                        </div>
                                        <div className="text-right space-y-2">
                                            <Badge variant={getStatusVariant(booking.status)}>
                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                            </Badge>
                                            <div className="text-sm text-gray-500">
                                                Booked: {formatDateTime(booking.booking_time)}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <Separator />
                                    
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                Seats ({booking.tickets.length})
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {getSeatNumbers(booking.tickets)}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                <CreditCard className="w-4 h-4" />
                                                Total Amount
                                            </h4>
                                            <p className="text-lg font-semibold text-green-600">
                                                {formatCurrency(booking.total_amount)}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                                Ticket Status
                                            </h4>
                                            <div className="space-y-1">
                                                {booking.tickets.map((ticket) => (
                                                    <div key={ticket.id} className="text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            {ticket.seat.row}{ticket.seat.seat_number}:
                                                        </span>
                                                        <span className={`ml-2 font-medium ${getStatusColor(ticket.status)}`}>
                                                            {ticket.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <Link href={`/my/bookings/${booking.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </Button>
                                        </Link>
                                        
                                        {canConfirmBooking(booking) && (
                                            <Button 
                                                size="sm" 
                                                onClick={() => handleConfirmBooking(booking.id)}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Confirm Payment
                                            </Button>
                                        )}
                                    </div>

                                    {canCancelBooking(booking) && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    <X className="w-4 h-4 mr-2" />
                                                    Cancel Booking
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to cancel this booking for "{booking.event.name}"? 
                                                        This action cannot be undone and your seats will be released.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleCancelBooking(booking.id)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                        disabled={cancellingBooking === booking.id}
                                                    >
                                                        {cancellingBooking === booking.id ? 'Cancelling...' : 'Yes, Cancel Booking'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
