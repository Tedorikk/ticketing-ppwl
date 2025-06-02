import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';

interface Flash {
    success?: string;
    error?: string;
    info?: string;
    warning?: string;
}

interface PageProps {
    flash: Flash;
    [key: string]: unknown;
}

export default function ToastHandler() {
    const { flash } = usePage<PageProps>().props;

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success, {
                description: new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                duration: 4000,
            });
        }
        
        if (flash.error) {
            toast.error(flash.error, {
                description: 'Please try again or contact support if the problem persists.',
                duration: 5000,
            });
        }
        
        if (flash.info) {
            toast.info(flash.info, {
                duration: 4000,
            });
        }
        
        if (flash.warning) {
            toast.warning(flash.warning, {
                description: 'Please review your action and try again.',
                duration: 4000,
            });
        }
    }, [flash]);

    return null; // This component doesn't render anything
}
