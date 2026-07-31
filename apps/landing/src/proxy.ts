import { NextResponse, type NextRequest } from 'next/server';

import { resolveLocale, supportedLocales } from '@lumina/i18n';

const localePrefix = new RegExp(`^/(${supportedLocales.join('|')})(/|$)`);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (localePrefix.test(pathname)) {
    return NextResponse.next();
  }

  const locale = resolveLocale(request.headers.get('accept-language'));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = { matcher: ['/((?!_next|api|.*\\..*).*)'] };
