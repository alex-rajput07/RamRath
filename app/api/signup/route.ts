import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/signup
 * Handles signup requests with admin blocking logic
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, phone, email } = body;

    // Block admin signup - this is a security gate
    if (role === 'admin') {
      console.error('[SECURITY] Attempted admin signup via API:', {
        email,
        phone,
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      });

      return NextResponse.json(
        {
          error: 'admin_signup_not_allowed',
          message: 'Admin accounts cannot be created through signup. Please use system-provided admin accounts.',
        },
        { status: 403 }
      );
    }

    // For booker/driver, indicate they should use the client-side flow
    return NextResponse.json(
      {
        message: 'Please use the login page to sign up',
        redirectTo: '/login?tab=signup',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ERROR] Signup API error:', error);
    return NextResponse.json(
      { error: 'signup_error', message: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
