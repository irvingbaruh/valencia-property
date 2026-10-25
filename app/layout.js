export const metadata = {
  title: 'Valencia Property - Test',
  description: 'Valencia Property Platform - GoDaddy Node.js Test',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
