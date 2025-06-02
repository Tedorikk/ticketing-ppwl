<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions based on the routing structure
        $permissions = [
            // Dashboard permissions
            'view-dashboard',
            'access-admin-dashboard',

            // Event permissions
            'view-events',
            'view-event-details',
            'view-event-stats',

            // Booking permissions
            'create-booking',
            'view-own-bookings',
            'view-own-booking-details',
            'confirm-own-booking',
            'cancel-own-booking',
            'use-own-ticket',
            
            // Admin booking permissions
            'view-all-bookings',
            'view-any-booking-details',
            'confirm-any-booking',
            'cancel-any-booking',
            'use-any-ticket',

            // Ticket permissions
            'view-own-tickets',
            'view-own-ticket-details',
            'download-own-tickets',
            'generate-own-tickets',
            
            // Admin ticket permissions
            'view-all-tickets',
            'view-any-ticket-details',
            'create-tickets',
            'update-tickets',
            'delete-tickets',
            'download-any-tickets',
            'validate-tickets',

            // Event management (Admin only)
            'create-events',
            'update-events',
            'delete-events',
            'manage-event-stats',

            // Seat management (Admin only)
            'create-seats',
            'update-seats',
            'delete-seats',
            'book-seats-for-others',
            'cancel-seat-bookings',

            // User management (Admin only)
            'view-all-users',
            'view-user-details',
            'manage-users',

            // Profile permissions
            'view-own-profile',
            'update-own-profile',

            // API permissions
            'access-booking-api',
            'access-event-api',
            'access-ticket-api',
            'access-admin-api',

            // Seat availability
            'view-seat-availability',
            'check-event-availability',

            // Search permissions
            'search-events',

            // System permissions
            'view-health-status',
        ];

        // Create permissions
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles
        $adminRole = Role::create(['name' => 'admin']);
        $userRole = Role::create(['name' => 'user']);

        // Assign permissions to User role
        $userPermissions = [
            'view-dashboard',
            'view-events',
            'view-event-details',
            'create-booking',
            'view-own-bookings',
            'view-own-booking-details',
            'confirm-own-booking',
            'cancel-own-booking',
            'use-own-ticket',
            'view-own-tickets',
            'view-own-ticket-details',
            'download-own-tickets',
            'generate-own-tickets',
            'view-own-profile',
            'update-own-profile',
            'access-booking-api',
            'access-event-api',
            'access-ticket-api',
            'view-seat-availability',
            'check-event-availability',
            'search-events',
        ];

        $userRole->givePermissionTo($userPermissions);

        // Assign ALL permissions to Admin role
        $adminRole->givePermissionTo(Permission::all());

        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password123')
        ]);
        $admin->assignRole($adminRole);

        // Create regular users
        $users = [
            [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => Hash::make('password123')
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'password' => Hash::make('password123')
            ],
            [
                'name' => 'Bob Johnson',
                'email' => 'bob@example.com',
                'password' => Hash::make('password123')
            ],
            [
                'name' => 'Alice Brown',
                'email' => 'alice@example.com',
                'password' => Hash::make('password123')
            ],
            [
                'name' => 'Charlie Wilson',
                'email' => 'charlie@example.com',
                'password' => Hash::make('password123')
            ],
        ];

        foreach ($users as $userData) {
            $user = User::create($userData);
            $user->assignRole($userRole);
        }

        // Create event organizer role (optional - for future use)
        $organizerRole = Role::create(['name' => 'organizer']);
        
        $organizerPermissions = [
            'view-dashboard',
            'view-events',
            'view-event-details',
            'create-events',
            'update-events',
            'view-event-stats',
            'manage-event-stats',
            'view-all-bookings',
            'view-any-booking-details',
            'view-all-tickets',
            'validate-tickets',
            'view-seat-availability',
            'access-admin-api',
        ];

        $organizerRole->givePermissionTo($organizerPermissions);

        // Create sample organizer
        $organizer = User::create([
            'name' => 'Event Organizer',
            'email' => 'organizer@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password123')
        ]);
        $organizer->assignRole($organizerRole);

        $this->command->info('Roles and permissions created successfully!');
        $this->command->info('Admin: admin@example.com / password123');
        $this->command->info('Organizer: organizer@example.com / password123');
        $this->command->info('Users: john@example.com, jane@example.com, bob@example.com, alice@example.com, charlie@example.com / password123');
    }
}
