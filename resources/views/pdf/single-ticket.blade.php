<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ticket - {{ $ticket->event->name }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .ticket {
            border: 3px solid #333;
            border-radius: 10px;
            padding: 30px;
            max-width: 600px;
            margin: 0 auto;
        }
        .ticket-header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .event-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .ticket-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        .left-info, .right-info {
            width: 45%;
        }
        .detail-row {
            margin-bottom: 10px;
        }
        .detail-label {
            font-weight: bold;
            display: inline-block;
            width: 80px;
        }
        .qr-section {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px dashed #333;
        }
        .qr-placeholder {
            width: 100px;
            height: 100px;
            border: 2px solid #333;
            margin: 0 auto 10px;
            line-height: 100px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="ticket">
        <div class="ticket-header">
            <div class="event-name">{{ $ticket->event->name }}</div>
            <div>{{ $ticket->event->location }}</div>
        </div>

        <div class="ticket-info">
            <div class="left-info">
                <div class="detail-row">
                    <span class="detail-label">Date:</span> {{ \Carbon\Carbon::parse($ticket->event->event_date)->format('l, F j, Y') }}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span> {{ \Carbon\Carbon::parse($ticket->event->start_time)->format('H:i') }}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Seat:</span> {{ $ticket->seat->row }}{{ $ticket->seat->seat_number }}
                </div>
                @if($ticket->seat->section)
                <div class="detail-row">
                    <span class="detail-label">Section:</span> {{ $ticket->seat->section }}
                </div>
                @endif
            </div>
            
            <div class="right-info">
                <div class="detail-row">
                    <span class="detail-label">Price:</span> Rp {{ number_format($ticket->price, 0, ',', '.') }}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span> {{ ucfirst($ticket->status) }}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Booking:</span> #{{ $ticket->booking->id }}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Customer:</span> {{ $ticket->user->name }}
                </div>
            </div>
        </div>

        <div class="qr-section">
            <div class="qr-placeholder">
                QR CODE
            </div>
            <div style="font-size: 12px;">
                Ticket ID: {{ $ticket->id }}
            </div>
            <div style="font-size: 12px; margin-top: 10px;">
                Scan this code at the entrance
            </div>
        </div>
    </div>

    <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
        Generated on {{ now()->format('F j, Y \a\t H:i') }}
    </div>
</body>
</html>
