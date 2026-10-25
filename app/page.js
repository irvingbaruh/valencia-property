export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: '#fff',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
        🏠 Valencia Property
      </h1>
      <p style={{ fontSize: '1.2rem', opacity: 0.8, maxWidth: '500px' }}>
        Avrupa ve Türkiye'den İspanya'da Mülk Yatırımı
      </p>
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem 2rem',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>
          ✅ Next.js on GoDaddy — Çalışıyor!
        </p>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', opacity: 0.5 }}>
          Node.js 22 • App Router • Test Deploy
        </p>
      </div>
    </main>
  )
}
