import { NextResponse, NextRequest } from 'next/server'
export { default } from "next-auth/middleware"
import { getToken } from "next-auth/jwt"

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/sign-in', '/signup', '/', '/dashboard/:path*', '/verify/:path*'],
}

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {

    const token = await getToken({ req: request })
    const url = request.nextUrl

    if (token &&
        (
            url.pathname.startsWith('/sign-in') ||
            url.pathname.startsWith('/signup') ||
            url.pathname.startsWith('/verify') ||
            url.pathname.startsWith('/')
        )
    ) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (!token && url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}
