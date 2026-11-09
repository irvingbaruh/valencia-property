import '../styles/globals.css';

export const metadata = {
  metadataBase: new URL('https://lockandloft.com'),
  title: { default: 'Lock & Loft', template: '%s | Lock & Loft' },
  description: 'Property investment, decoration, renovation and rental management in Valencia, Spain',
  applicationName: 'Lock & Loft',
  openGraph: { siteName: 'Lock & Loft', type: 'website' },
};

export const viewport = { themeColor: '#0B0B11' };

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Jost:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
