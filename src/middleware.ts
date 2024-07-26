import { NextResponse, NextRequest } from 'next/server';
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export const config = {
    matcher: ['/sign-in', '/signup', '/', '/dashboard/:path*', '/verify/:path*'],
};

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const url = request.nextUrl;

    if (token) {
        if (
            url.pathname.startsWith('/sign-in') ||
            url.pathname.startsWith('/signup') ||
            url.pathname.startsWith('/verify')
        ) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    } else {
        if (url.pathname.startsWith('/dashboard')) {
            if (url.pathname !== '/sign-in') {
                return NextResponse.redirect(new URL('/sign-in', request.url));
            }
        }
    }

    return NextResponse.next();
}
