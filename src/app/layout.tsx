import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'EarLab — Functional Ear Training & Audiation',
  description: 'Scientific, adaptive functional ear training platform for musicians. Master relative pitch, audiation, and transcription.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EarLab',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/icons/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icons/icon-512.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EarLab" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                var refreshingForServiceWorker = false;
                navigator.serviceWorker.addEventListener('controllerchange', function() {
                  if (refreshingForServiceWorker || sessionStorage.getItem('earlab-sw-refresh')) return;
                  refreshingForServiceWorker = true;
                  sessionStorage.setItem('earlab-sw-refresh', '1');
                  window.location.reload();
                });
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(registration) {
                      registration.update();
                      sessionStorage.removeItem('earlab-sw-refresh');
                      console.log('EarLab PWA ServiceWorker active with scope:', registration.scope);
                    })
                    .catch(function(err) {
                      console.log('EarLab ServiceWorker note:', err);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
