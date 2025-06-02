<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Booking Tickets - {{ $booking->event->name }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .booking-info {
            background: #f9f9f9;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .ticket {
            border: 2px dashed #333;
            padding: 20px;
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        .ticket-header {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .ticket-details {
            display: flex;
            justify-content: space-between;
        }
        .left-details, .right-details {
            width: 48%;
        }
        .detail-row {
            margin-bottom: 10px;
        }
        .detail-label {
            font-weight: bold;
            display: inline-block;
            width: 100px;
        }
        .qr-placeholder {
            width: 80px;
            height: 80px;
            border: 1px solid #333;
            display: inline-block;
            text-align: center;
            line-height: 80px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Event Tickets</h1>
        <h2>{{ $booking->event->name }}</h2>
        <p>Booking #{{ $booking->id }}</p>
    </div>

    <div class="booking-info">
        <h3>Booking Information</h3>
        <div class="detail-row">
            <span class="detail-label">Customer:</span> {{ $booking->user->name }}
        </div>
        <div class="detail-row">
            <span class="detail-label">Email:</span> {{ $booking->user->email }}
        </div>
        <div class="detail-row">
            <span class="detail-label">Event:</span> {{ $booking->event->name }}
        </div>
        <div class="detail-row">
            <span class="detail-label">Location:</span> {{ $booking->event->location }}
        </div>
        <div class="detail-row">
            <span class="detail-label">Date:</span> {{ \Carbon\Carbon::parse($booking->event->event_date)->format('l, F j, Y') }}
        </div>
        <div class="detail-row">
            <span class="detail-label">Time:</span> {{ \Carbon\Carbon::parse($booking->event->start_time)->format('H:i') }} - {{ \Carbon\Carbon::parse($booking->event->end_time)->format('H:i') }}
        </div>
        <div class="detail-row">
            <span class="detail-label">Total:</span> Rp {{ number_format($booking->total_amount, 0, ',', '.') }}
        </div>
    </div>

    @foreach($booking->tickets as $index => $ticket)
    <div class="ticket">
        <div class="ticket-header">
            TICKET {{ $index + 1 }} - {{ $booking->event->name }}
        </div>
        
        <div class="ticket-details">
            <div class="left-details">
                <div class="detail-row">
                    <span class="detail-label">Seat:</span> {{ $ticket->seat->row }}{{ $ticket->seat->seat_number }}
                </div>
                @if($ticket->seat->section)
                <div class="detail-row">
                    <span class="detail-label">Section:</span> {{ $ticket->seat->section }}
                </div>
                @endif
                <div class="detail-row">
                    <span class="detail-label">Price:</span> Rp {{ number_format($ticket->price, 0, ',', '.') }}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span> {{ ucfirst($ticket->status) }}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Ticket ID:</span> {{ $ticket->id }}
                </div>
            </div>
            
            <div class="right-details">
                <div class="qr-placeholder">
                    QR CODE
                </div>
                <div style="margin-top: 10px; font-size: 12px;">
                    Scan at entrance
                </div>
            </div>
        </div>
    </div>
    @endforeach

    <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
        <p>Please present this ticket at the event entrance.</p>
        <p>Generated on {{ now()->format('F j, Y \a\t H:i') }}</p>
    </div>
</body>
</html>
