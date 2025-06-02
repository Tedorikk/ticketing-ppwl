import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/user-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
    Calendar, 
    MapPin, 
    Clock, 
    Download, 
    ArrowLeft, 
    QrCode,
    Ticket as TicketIcon,
    User,
    CreditCard,
    Info
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Ticket } from '@/types/ticket';

interface TicketShowProps {
    ticket: Ticket;
}

export default function TicketShow({ ticket }: TicketShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'My Tickets', href: '/my/tickets' },
        { title: `Ticket #${ticket.id.substring(0, 8)}`, href: `/my/tickets/${ticket.id}` },
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

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return '-';
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
            case 'booked':
                return 'secondary';
            case 'used':
                return 'outline';
            case 'cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const isEventPast = () => {
        return new Date(ticket.event.event_date) < new Date();
    };

    const handleDownloadTicket = () => {
        window.open(`/tickets/${ticket.id}/download`, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ticket - ${ticket.event.name}`} />
            
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <Link href="/my/tickets">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Tickets
                                </Button>
                            </Link>
                            <Badge variant={getStatusVariant(ticket.status)}>
                                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Ticket #{ticket.id.substring(0, 8)}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Created on {formatDateTime(ticket.created_at)}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {ticket.status === 'valid' && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>
                                        <QrCode className="w-4 h-4 mr-2" />
                                        Show QR Code
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
                                            <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded">
                                                <QrCode className="w-16 h-16 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                        
                        {ticket.status === 'used' && (
                            <Button variant="outline" onClick={handleDownloadTicket}>
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
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
                                        {ticket.event.name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {ticket.event.description}
                                    </p>
                                </div>

                                <Separator />

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                            <span>{ticket.event.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(ticket.event.event_date)}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            <span>{formatTime(ticket.event.start_time)} - {formatTime(ticket.event.end_time)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Seat Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TicketIcon className="w-5 h-5" />
                                    Seat Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Seat Number</label>
                                        <p className="text-lg font-semibold">{ticket.seat.row}{ticket.seat.seat_number}</p>
                                    </div>
                                    {ticket.seat.section && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Section</label>
                                            <p className="text-lg font-semibold">{ticket.seat.section}</p>
                                        </div>
                                    )}
                                </div>
                                
                                {ticket.used_at && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                        <p className="text-blue-800 dark:text-blue-200 font-medium">
                                            Ticket used on {formatDateTime(ticket.used_at)}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Ticket Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Ticket Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Ticket ID</span>
                                        <span className="font-mono text-sm">{ticket.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Price</span>
                                        <span className="font-semibold text-green-600">{formatCurrency(ticket.price)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Status</span>
                                        <Badge variant={getStatusVariant(ticket.status)}>
                                            {ticket.status}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Booking Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Booking Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Booking ID</label>
                                    <p className="font-mono text-sm">#{ticket.booking.id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Booking Date</label>
                                    <p className="text-sm">{formatDateTime(ticket.booking.booking_time)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</label>
                                    <p className="text-sm font-semibold text-green-600">
                                        {formatCurrency(ticket.booking.total_amount)}
                                    </p>
                                </div>
                                <Link href={`/my/bookings/${ticket.booking.id}`}>
                                    <Button variant="outline" size="sm" className="w-full">
                                        View Full Booking
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
