import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/user-layout';
import { type Booking } from '@/types/booking';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Bookings',
        href: '/ticket',
    },
];

export default function Index() {
    const { bookings } = usePage().props as unknown as {
        bookings: Booking[];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Bookings" />

            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-semibold">My Bookings</h1>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="rounded-xl border p-4 shadow-sm hover:shadow-md transition"
                        >
                            <h2 className="text-lg font-bold">
                                {booking.event?.name}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {booking.event?.location} — {booking.event?.event_date}
                            </p>
                            <p className="mt-2 text-sm">
                                Status:{' '}
                                <span className="capitalize font-medium">{booking.status}</span>
                            </p>
                            <p className="text-sm">Total: Rp{booking.total_amount}</p>
                            <p className="text-sm">Booked by: {booking.user?.name}</p>
                            <p className="text-xs text-muted-foreground">
                                At: {new Date(booking.booking_time).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>

                {bookings.length === 0 && (
                    <div className="text-center text-muted-foreground py-12">
                        No bookings found.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
