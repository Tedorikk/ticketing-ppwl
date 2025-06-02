import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/user-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
    Calendar, 
    MapPin, 
    Clock, 
    Download, 
    Eye, 
    QrCode,
    Ticket as TicketIcon,
    Users,
    CheckCircle,
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

interface Booking {
    id: number;
    total_amount: number;
    status: string;
    booking_time: string;
}

interface Ticket {
    id: string;
    status: 'booked' | 'confirmed' | 'used' | 'cancelled';
    price: number;
    used_at?: string;
    created_at: string;
    seat: Seat;
    event: Event;
    booking: Booking;
}

interface TicketStats {
    total_tickets: number;
    confirmed_tickets: number;
    used_tickets: number;
    pending_tickets: number;
}

interface TicketIndexProps {
    tickets: Ticket[];
    stats?: TicketStats; // Made optional to handle undefined
}

export default function TicketIndex({ tickets = [], stats }: TicketIndexProps) {
    // Provide default values for stats to prevent undefined errors
    const defaultStats: TicketStats = {
        total_tickets: 0,
        confirmed_tickets: 0,
        used_tickets: 0,
        pending_tickets: 0,
    };

    // Use provided stats or fallback to defaults
    const ticketStats = stats || defaultStats;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'My Tickets', href: '/my/tickets' },
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

    const handleDownloadTicket = (ticketId: string) => {
        window.open(`/tickets/${ticketId}/download`, '_blank');
    };

    // Use ticketStats instead of stats to ensure safe access
    const statsCards = [
        {
            title: 'Total Tickets',
            value: ticketStats.total_tickets,
            icon: TicketIcon,
            description: 'All your tickets'
        },
        {
            title: 'Confirmed',
            value: ticketStats.confirmed_tickets,
            icon: CheckCircle,
            description: 'Ready to use',
            color: 'text-green-600'
        },
        {
            title: 'Used',
            value: ticketStats.used_tickets,
            icon: Users,
            description: 'Already attended',
            color: 'text-blue-600'
        },
        {
            title: 'Pending',
            value: ticketStats.pending_tickets,
            icon: Clock,
            description: 'Awaiting confirmation',
            color: 'text-yellow-600'
        }
    ];

    // Loading state if data is not yet available
    if (!stats && tickets.length === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="My Tickets" />
                <div className="p-6 flex justify-center items-center min-h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading tickets...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Tickets" />
            
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Tickets</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage and view all your event tickets
                        </p>
                    </div>
                    <Link href="/events">
                        <Button>
                            Browse Events
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={index}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center justify-between">
                                        {stat.title}
                                        <Icon className={`h-4 w-4 ${stat.color || 'text-gray-400'}`} />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold ${stat.color || ''}`}>
                                        {stat.value}
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Tickets Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Tickets</CardTitle>
                        <CardDescription>
                            View and manage your event tickets
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {tickets.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                    <TicketIcon className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    No tickets yet
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Start by booking your first event!
                                </p>
                                <Link href="/events">
                                    <Button>
                                        Browse Events
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Seat</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tickets.map((ticket) => (
                                        <TableRow key={ticket.id}>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium">{ticket.event.name}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {ticket.event.location}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {ticket.seat.section && `${ticket.seat.section} - `}
                                                    {ticket.seat.row}{ticket.seat.seat_number}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(ticket.event.event_date)}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                        <Clock className="w-3 h-3" />
                                                        {formatTime(ticket.event.start_time)}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-green-600">
                                                    {formatCurrency(ticket.price)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <Badge variant={getStatusVariant(ticket.status)}>
                                                        {ticket.status}
                                                    </Badge>
                                                    {ticket.used_at && (
                                                        <div className="text-xs text-gray-500">
                                                            Used: {formatDateTime(ticket.used_at)}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/my/tickets/${ticket.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    
                                                    {ticket.status === 'confirmed' && (
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <QrCode className="h-4 w-4" />
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
                                                                <div className="text-center text-sm text-gray-500">
                                                                    Ticket ID: {ticket.id}
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}
                                                    
                                                    {(ticket.status === 'confirmed' || ticket.status === 'used') && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            onClick={() => handleDownloadTicket(ticket.id)}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
