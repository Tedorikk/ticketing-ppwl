import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Event {
    id: number;
    name: string;
    description: string;
    location: string;
    event_date: string;
    start_time: string;
    end_time: string;
    status: 'active' | 'inactive' | 'canceled';
    max_seats: number;
    price: number;
}

interface EditEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Event;
}

export default function EditEventModal({ isOpen, onClose, event }: EditEventModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
        location: '',
        event_date: '',
        start_time: '',
        end_time: '',
        status: 'active',
        max_seats: '',
        price: '',
    });

    useEffect(() => {
        if (event && isOpen) {
            setData({
                name: event.name || '',
                description: event.description || '',
                location: event.location || '',
                event_date: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : '',
                start_time: event.start_time ? new Date(event.start_time).toISOString().slice(0, 16) : '',
                end_time: event.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : '',
                status: event.status || 'active',
                max_seats: event.max_seats?.toString() || '',
                price: event.price?.toString() || '',
            });
        }
    }, [event, isOpen, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        put(`/admin/events/${event.id}`, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            reset();
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Event</DialogTitle>
                    <DialogDescription>
                        Update the event details below. Changes will be saved immediately.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Event Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Event Name *</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={errors.name ? 'border-red-500' : ''}
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <Label htmlFor="location">Location *</Label>
                            <Input
                                id="location"
                                type="text"
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                className={errors.location ? 'border-red-500' : ''}
                                required
                            />
                            {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                        </div>

                        {/* Event Date */}
                        <div className="space-y-2">
                            <Label htmlFor="event_date">Event Date *</Label>
                            <Input
                                id="event_date"
                                type="date"
                                value={data.event_date}
                                onChange={(e) => setData('event_date', e.target.value)}
                                className={errors.event_date ? 'border-red-500' : ''}
                                required
                            />
                            {errors.event_date && <p className="text-red-500 text-sm">{errors.event_date}</p>}
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="canceled">Canceled</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                        </div>

                        {/* Start Time */}
                        <div className="space-y-2">
                            <Label htmlFor="start_time">Start Time *</Label>
                            <Input
                                id="start_time"
                                type="datetime-local"
                                value={data.start_time}
                                onChange={(e) => setData('start_time', e.target.value)}
                                className={errors.start_time ? 'border-red-500' : ''}
                                required
                            />
                            {errors.start_time && <p className="text-red-500 text-sm">{errors.start_time}</p>}
                        </div>

                        {/* End Time */}
                        <div className="space-y-2">
                            <Label htmlFor="end_time">End Time *</Label>
                            <Input
                                id="end_time"
                                type="datetime-local"
                                value={data.end_time}
                                onChange={(e) => setData('end_time', e.target.value)}
                                className={errors.end_time ? 'border-red-500' : ''}
                                required
                            />
                            {errors.end_time && <p className="text-red-500 text-sm">{errors.end_time}</p>}
                        </div>

                        {/* Max Seats */}
                        <div className="space-y-2">
                            <Label htmlFor="max_seats">Maximum Seats *</Label>
                            <Input
                                id="max_seats"
                                type="number"
                                min="1"
                                value={data.max_seats}
                                onChange={(e) => setData('max_seats', e.target.value)}
                                className={errors.max_seats ? 'border-red-500' : ''}
                                required
                            />
                            {errors.max_seats && <p className="text-red-500 text-sm">{errors.max_seats}</p>}
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <Label htmlFor="price">Ticket Price *</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                className={errors.price ? 'border-red-500' : ''}
                                required
                            />
                            {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className={errors.description ? 'border-red-500' : ''}
                            rows={4}
                            placeholder="Enter event description..."
                        />
                        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onClose()}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? 'Updating...' : 'Update Event'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
