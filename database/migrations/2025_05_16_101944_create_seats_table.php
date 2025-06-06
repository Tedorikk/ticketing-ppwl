<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('seats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id');
            $table->string('seat_number');
            $table->string('row')->nullable();
            $table->string('section')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('status')->default('available');
            $table->foreignId('user_id')->nullable()->constrained();
            $table->dateTime('booking_time')->nullable();
            $table->text('special_requirements')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seats');
    }
};
