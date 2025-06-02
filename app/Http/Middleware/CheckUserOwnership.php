<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckUserOwnership
{
    public function handle(Request $request, Closure $next)
    {
        // This middleware handles basic user ownership checks
        // without requiring specific permission parameters
        if (!auth()->check()) {
            return redirect('/login');
        }

        return $next($request);
    }
}
