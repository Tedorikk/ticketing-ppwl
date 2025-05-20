import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';

interface CreateAdminProps {
    title: string;
    description?: string;
    createRoute?: string;
    createLabel?: string;
    breadcrumbs?: BreadcrumbItem[];
    showCreateButton?: boolean;
    isEmpty?: boolean;
    emptyMessage?: string;
}

export default function CreateAdmin({
    children,
    title,
    description = '',
    createRoute = '',
    createLabel = 'Create New',
    showCreateButton = true,
    isEmpty = false,
    emptyMessage = 'No data available. Create one now!',
}: PropsWithChildren<CreateAdminProps>) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    {description && (
                        <CardDescription>{description}</CardDescription>
                    )}
                </div>
                {showCreateButton && createRoute && (
                    <Button asChild>
                        <Link href={createRoute}>{createLabel}</Link>
                    </Button>
                )}
            </CardHeader>

            <CardContent className="px-6 py-6">
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-muted p-3 mb-4">
                            <PlusCircle className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{emptyMessage}</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Click the button to add one.
                        </p>
                        {showCreateButton && createRoute && (
                            <Button size="lg" asChild>
                                <Link href={createRoute}>{createLabel}</Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    );
}