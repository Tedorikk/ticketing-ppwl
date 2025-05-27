// components/CardEvent.tsx
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardFooter,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { router } from "@inertiajs/react";
import { useState } from "react";

interface CardEventProps {
  id: number;
  name: string;
  description: string;
  location: string;
  event_date: string;
  start_time: string;
  end_time: string;
  status: string;
  organizer_id: number;
  max_seats: number;
  price: number;
}

export default function CardEvent({
  id,
  name,
  description,
  location,
  event_date,
  start_time,
  end_time,
  status,
  organizer_id,
  max_seats,
  price,
}: CardEventProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatTime = (timeStr: string) =>
    new Date(timeStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleDelete = () => {
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    router.delete(`/events/${id}`);
  };

  return (
    <>
      <Card className="mb-6 overflow-hidden transition-all duration-300 hover:shadow-lg">
        <Dialog>
          <DialogTrigger className="text-left w-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="mb-2 capitalize">{status}</Badge>
                  <CardTitle>{name}</CardTitle>
                  <CardDescription className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="px-6 pb-4 text-sm text-gray-600 space-y-1">
              <p><strong>Lokasi:</strong> {location}</p>
              <p><strong>Tanggal:</strong> {formatDate(event_date)}</p>
              <p><strong>Waktu:</strong> {formatTime(start_time)} - {formatTime(end_time)}</p>
              <p><strong>Harga:</strong> {formattedPrice}</p>
              <p><strong>Kapasitas:</strong> {max_seats} orang</p>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <h2 className="text-lg font-semibold">{name}</h2>
            </DialogHeader>
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>Deskripsi:</strong> {description}</p>
              <p><strong>Lokasi:</strong> {location}</p>
              <p><strong>Tanggal:</strong> {formatDate(event_date)}</p>
              <p><strong>Jam:</strong> {formatTime(start_time)} - {formatTime(end_time)}</p>
              <p><strong>Kapasitas Maks:</strong> {max_seats}</p>
              <p><strong>Status:</strong> {status}</p>
              <p><strong>Harga:</strong> {formattedPrice}</p>
            </div>
            <div className="flex justify-end mt-4 gap-2">
              {/* <EditEventDialog id={id} />  Tambahkan komponen edit jika sudah tersedia */}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                Hapus
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <CardFooter className="flex justify-between items-center border-t px-6 py-4">
          <span className="font-semibold text-primary text-sm">
            {formattedPrice}
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            Hapus
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Hapus Event "{name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Event ini akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
