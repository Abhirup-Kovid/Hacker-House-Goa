import BadgeGenerator from '@/components/BadgeGenerator';
import './page.module.css'; // We'll use this or global styles

export default function Home() {
  return (
    <main style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center', position: 'relative', width: '100%', maxWidth: '1000px', padding: '2rem 0' }}>
        <h1 style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: 'clamp(4rem, 12vw, 10rem)', 
          color: 'var(--color-primary)', 
          lineHeight: '0.9',
          textTransform: 'uppercase',
          letterSpacing: '-2px',
          fontWeight: 400,
          margin: 0
        }}>
          HACKER HOUSE
        </h1>
        <div style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-5deg)',
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          color: 'var(--color-secondary)',
          fontWeight: 800,
          textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
          zIndex: 10
        }}>
          गोवा
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', marginTop: '2rem', fontSize: '0.9rem', borderBottom: '1px solid var(--color-primary)', paddingBottom: '0.5rem' }}>
          <span>GOA, INDIA • 28 - 31 OCT 2026</span>
          <span>2:47 PM STUDIO</span>
        </div>
      </header>
      <BadgeGenerator />
    </main>
  );
}
