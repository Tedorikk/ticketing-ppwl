import CreateAdmin from '@/components/create-admin';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardStats {
    totalEvents: number;
    totalBookings: number;
    totalRevenue: number;
    totalTicketsSold: number;
}

interface Event {
    id: number;
    name: string;
    location: string;
    event_date: string;
    organizer?: {
        name: string;
    } | null;
}

interface Booking {
    id: number;
    total_amount: number;
    booking_time: string;
    user?: {
        name: string;
    } | null;
    event?: {
        name: string;
    } | null;
}

interface DashboardProps {
    stats: DashboardStats;
    recentEvents: Event[];
    recentBookings: Booking[];
}

export default function Dashboard({ stats, recentEvents = [], recentBookings = [] }: DashboardProps) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(amount || 0);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'No date';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="m-6">
                <CreateAdmin
                    title="Dashboard Ticketing System"
                    description="Lihat informasi dan statistik event terbaru"
                    createRoute="/events/create"
                    createLabel="Create New Event"
                    isEmpty={false}
                    emptyMessage=""
                >
                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="flex h-full flex-1 flex-col gap-6">
                            {/* Statistics Cards */}
                            <div className="grid auto-rows-min gap-6 md:grid-cols-3">
                                {/* Total Events */}
                                <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border bg-white p-6 dark:bg-gray-800">
                                    <div className="relative z-10">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Events</h3>
                                        <p className="mt-2 text-3xl font-bold text-blue-600">{stats?.totalEvents || 0}</p>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Active events</p>
                                    </div>
                                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                                </div>

                                {/* Total Bookings */}
                                <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border bg-white p-6 dark:bg-gray-800">
                                    <div className="relative z-10">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Bookings</h3>
                                        <p className="mt-2 text-3xl font-bold text-green-600">{stats?.totalBookings || 0}</p>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tickets sold: {stats?.totalTicketsSold || 0}</p>
                                    </div>
                                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                                </div>

                                {/* Total Revenue */}
                                <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border bg-white p-6 dark:bg-gray-800">
                                    <div className="relative z-10">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Revenue</h3>
                                        <p className="mt-2 text-2xl font-bold text-purple-600">{formatCurrency(stats?.totalRevenue || 0)}</p>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">All time earnings</p>
                                    </div>
                                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[600px] flex-1 overflow-hidden rounded-xl border bg-white dark:bg-gray-800">
                                <div className="relative z-10 p-6">
                                    <div className="grid h-full gap-6 md:grid-cols-2">
                                        {/* Recent Events */}
                                        <div>
                                            <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Recent Events</h3>
                                            <div className="space-y-3">
                                                {recentEvents && recentEvents.length > 0 ? (
                                                    recentEvents.map((event) => (
                                                        <div key={event.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                                {event.name || 'Unnamed Event'}
                                                            </h4>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {event.location || 'No location'}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(event.event_date)}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 dark:text-gray-400">No recent events</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Recent Bookings */}
                                        <div>
                                            <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Recent Bookings</h3>
                                            <div className="space-y-3">
                                                {recentBookings && recentBookings.length > 0 ? (
                                                    recentBookings.map((booking) => (
                                                        <div key={booking.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                                {booking.event?.name || 'Unknown Event'}
                                                            </h4>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Customer: {booking.user?.name || 'Unknown User'}
                                                            </p>
                                                            <p className="text-sm font-medium text-green-600">
                                                                {formatCurrency(booking.total_amount)}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {formatDate(booking.booking_time)}
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 dark:text-gray-400">No recent bookings</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5" />
                            </div>
                        </div>
                    )}
                </CreateAdmin>
            </div>
        </AppLayout>
    );
}
