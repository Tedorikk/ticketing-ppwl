import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CreateAdmin from '@/components/create-admin';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        setTimeout(() => {
            setData([]);
            setLoading(false);
        }, 1000);
    }, []);

    const isEmpty = !loading && data.length === 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="m-6">
                <CreateAdmin
                    title="Dashboard"
                    description="Lihat informasi dan statistik terbaru"
                    createRoute="/dashboard/create-admin"
                    createLabel="Create New" 
                    isEmpty={isEmpty}
                    emptyMessage="Belum ada data admin"
                >
                    {loading ? (
                        <div className="flex justify-center items-center p-12">
                            <p>Loading...</p>
                        </div>
                    ) : (
                        <div className="flex h-full flex-1 flex-col gap-6">
                            <div className="grid auto-rows-min gap-6 md:grid-cols-3">
                                <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                </div>
                                <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                </div>
                                <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                </div>
                            </div>
                            <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                            </div>
                        </div>
                    )}
                </CreateAdmin>
            </div>
        </AppLayout>
    );
}