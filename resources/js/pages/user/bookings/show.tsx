import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/user-layout';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
    Calendar, 
    MapPin, 
    Clock, 
    Users, 
    CreditCard, 
    ArrowLeft, 
    Download, 
    X, 
    CheckCircle,
    QrCode,
    User,
    Mail,
    Ticket,
    Info
} from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Event {
    id: number;
    name: string;
    description: string;
    location: string;
    event_date: string;
    start_time: string;
    end_time: string;
    status: string;
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
    status: 'booked' | 'confirmed' | 'used' | 'cancelled';
    price: number;
    used_at?: string;
    seat: Seat;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Booking {
    id: number;
    total_amount: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    booking_time: string;
    event: Event;
    tickets: Ticket[];
    user: User;
}

interface BookingShowProps {
    booking: Booking;
}

export default function BookingShow({ booking }: BookingShowProps) {
    const [cancellingBooking, setCancellingBooking] = useState(false);
    const [confirmingBooking, setConfirmingBooking] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'My Bookings', href: '/my/bookings' },
        { title: `Booking #${booking.id}`, href: `/my/bookings/${booking.id}` },
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
            case 'used':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'cancelled':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'used':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const handleCancelBooking = () => {
        setCancellingBooking(true);
        
        router.patch(`/bookings/${booking.id}/cancel`, {}, {
            onSuccess: () => {
                setCancellingBooking(false);
            },
            onError: () => {
                setCancellingBooking(false);
            }
        });
    };

    const handleConfirmBooking = () => {
        setConfirmingBooking(true);
        
        router.patch(`/bookings/${booking.id}/confirm`, {}, {
            onSuccess: () => {
                setConfirmingBooking(false);
            },
            onError: () => {
                setConfirmingBooking(false);
            }
        });
    };

    const handleDownloadTickets = () => {
        window.open(`/bookings/${booking.id}/generate-tickets`, '_blank');
    };

    const canCancelBooking = () => {
        return ['pending', 'confirmed'].includes(booking.status) && 
               new Date(booking.event.event_date) > new Date();
    };

    const canConfirmBooking = () => {
        return booking.status === 'pending';
    };

    const canDownloadTickets = () => {
        return booking.status === 'confirmed';
    };

    const isEventPast = () => {
        return new Date(booking.event.event_date) < new Date();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Booking #${booking.id} - ${booking.event.name}`} />
            
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <Link href="/my/bookings">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Bookings
                                </Button>
                            </Link>
                            <Badge variant={getStatusVariant(booking.status)} className="text-sm">
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Booking #{booking.id}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Booked on {formatDateTime(booking.booking_time)}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {canConfirmBooking() && (
                            <Button 
                                onClick={handleConfirmBooking}
                                disabled={confirmingBooking}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {confirmingBooking ? 'Confirming...' : 'Confirm Payment'}
                            </Button>
                        )}
                        
                        {canDownloadTickets() && (
                            <Button 
                                onClick={handleDownloadTickets}
                                variant="outline"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Tickets
                            </Button>
                        )}
                    </div>
                </div>

                {/* Alert for past events */}
                {isEventPast() && (
                    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                                <Info className="w-5 h-5" />
                                <span className="font-medium">This event has already occurred.</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Event Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Event Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        {booking.event.name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {booking.event.description}
                                    </p>
                                </div>

                                <Separator />

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                            <span>{booking.event.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(booking.event.event_date)}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            <span>{formatTime(booking.event.start_time)} - {formatTime(booking.event.end_time)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Users className="w-4 h-4" />
                                            <span>{booking.tickets.length} seat(s)</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tickets Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Ticket className="w-5 h-5" />
                                    Your Tickets ({booking.tickets.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    {booking.tickets.map((ticket) => (
                                        <div 
                                            key={ticket.id} 
                                            className={`p-4 rounded-lg border ${getStatusColor(ticket.status)}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="font-medium">
                                                        Seat {ticket.seat.row}{ticket.seat.seat_number}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {ticket.seat.section && `Section ${ticket.seat.section} • `}
                                                        {formatCurrency(ticket.price)}
                                                    </div>
                                                    {ticket.used_at && (
                                                        <div className="text-sm text-blue-600">
                                                            Used on {formatDateTime(ticket.used_at)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant={getStatusVariant(ticket.status)}>
                                                        {ticket.status}
                                                    </Badge>
                                                    {ticket.status === 'confirmed' && (
                                                        <div className="mt-2">
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button variant="outline" size="sm">
                                                                        <QrCode className="w-4 h-4 mr-2" />
                                                                        QR Code
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                        <DialogTitle>Ticket QR Code</DialogTitle>
                                                                        <DialogDescription>
                                                                            Show this QR code at the event entrance
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <div className="flex justify-center p-8">
                                                                        <div className="bg-white p-4 rounded-lg">
                                                                            {/* QR Code placeholder - implement with your QR library */}
                                                                            <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded">
                                                                                <QrCode className="w-16 h-16 text-gray-400" />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <DialogFooter>
                                                                        <p className="text-sm text-gray-500">
                                                                            Ticket ID: {ticket.id}
                                                                        </p>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Booking Summary Sidebar */}
                    <div className="space-y-6">
                        {/* Payment Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Payment Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {booking.tickets.map((ticket) => (
                                        <div key={ticket.id} className="flex justify-between text-sm">
                                            <span>Seat {ticket.seat.row}{ticket.seat.seat_number}</span>
                                            <span>{formatCurrency(ticket.price)}</span>
                                        </div>
                                    ))}
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span className="text-lg text-green-600">
                                        {formatCurrency(booking.total_amount)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span>{booking.user.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span>{booking.user.email}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        {canCancelBooking() && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-red-600">Cancel Booking</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        You can cancel this booking and your seats will be released for other customers.
                                    </p>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="w-full">
                                                <X className="w-4 h-4 mr-2" />
                                                Cancel This Booking
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
                                                    onClick={handleCancelBooking}
                                                    className="bg-red-600 hover:bg-red-700"
                                                    disabled={cancellingBooking}
                                                >
                                                    {cancellingBooking ? 'Cancelling...' : 'Yes, Cancel Booking'}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
