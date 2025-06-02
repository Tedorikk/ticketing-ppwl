import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/user-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Calendar, 
    MapPin, 
    Ticket as TicketIcon,
    Users,
    Download,
    Eye,
    ArrowRight
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { type User } from '@/types/user';
import { type Booking } from '@/types/booking';
import { type Event } from '@/types/event';
import { type Ticket } from '@/types/ticket';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export interface DashboardStats {
    total_bookings: number;
    total_tickets: number;
    total_spent: number;
    upcoming_events: number;
}

export interface DashboardProps {
    user: User;
    recentBookings: Booking[];
    upcomingEvents: Event[];
    tickets: Ticket[];
    stats: DashboardStats;
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID').format(amount);
};

const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'confirmed':
        case 'valid':
            return 'default';
        case 'pending':
            return 'secondary';
        case 'cancelled':
        case 'used':
            return 'outline';
        default:
            return 'secondary';
    }
};

export default function Dashboard({ 
    user, 
    recentBookings, 
    upcomingEvents, 
    tickets, 
    stats 
}: DashboardProps) {
    
    const statsCards = [
        {
            title: 'Total Bookings',
            value: stats.total_bookings,
            icon: TicketIcon,
            description: 'All time bookings'
        },
        {
            title: 'Total Tickets',
            value: stats.total_tickets,
            icon: Users,
            description: 'Active tickets'
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="space-y-8 py-10">
                {/* Welcome Section */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}!</h1>
                    <p className="text-muted-foreground">
                        Here's what's happening with your bookings and events.
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    {statsCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={index}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Bookings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Recent Bookings</CardTitle>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={route('user.bookings.index')}>
                                        View All <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentBookings.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No bookings yet
                                    </div>
                                ) : (
                                    recentBookings.map((booking) => (
                                        <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-1">
                                                <p className="font-medium">{booking.event?.name}</p>
                                                <p className="text-sm text-muted-foreground flex items-center">
                                                    <Calendar className="mr-1 h-3 w-3" />
                                                    {booking.event?.event_date ? formatDate(booking.event.event_date) : ''}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {(booking.tickets ? booking.tickets.length : 0)} ticket(s)
                                                </p>
                                            </div>
                                            <div className="text-right space-y-2">
                                                <Badge variant={getStatusVariant(booking.status)}>
                                                    {booking.status}
                                                </Badge>
                                                <p className="text-sm font-semibold">
                                                    Rp {typeof booking.total_amount === 'number' && !isNaN(booking.total_amount) ? formatCurrency(booking.total_amount) : '0'}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Events */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Upcoming Events</CardTitle>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={route('events.index')}>
                                        Browse Events <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingEvents.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No upcoming events
                                    </div>
                                ) : (
                                    upcomingEvents.map((event) => (
                                        <div key={event.id} className="p-4 border rounded-lg space-y-2">
                                            <h4 className="font-semibold">{event.name}</h4>
                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                <p className="flex items-center">
                                                    <Calendar className="mr-2 h-3 w-3" />
                                                    {formatDate(event.event_date)}
                                                </p>
                                                <p className="flex items-center">
                                                    <MapPin className="mr-2 h-3 w-3" />
                                                    {event.location}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={route('events.show', event.id)}>
                                                    View Details
                                                </Link>
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* My Tickets Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>My Tickets</CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={route('user.tickets.index')}>
                                    View All Tickets <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {tickets.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <TicketIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                                <p>No tickets yet</p>
                                <Button variant="outline" className="mt-4" asChild>
                                    <Link href={route('events.index')}>
                                        Browse events to get your first ticket
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Seat</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tickets.map((ticket) => (
                                        <TableRow key={ticket.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{ticket.event.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatDate(ticket.event.event_date)}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {ticket.seat.section} - {ticket.seat.row}{ticket.seat.seat_number}
                                            </TableCell>
                                            <TableCell>
                                                Rp {formatCurrency(ticket.price)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(ticket.status)}>
                                                    {ticket.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={route('user.tickets.show', ticket.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                    <a 
                                                        href={`/bookings/${ticket.booking.id}/generate-tickets`}
                                                        target="_blank"
                                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
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
