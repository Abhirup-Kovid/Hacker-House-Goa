import BadgeGenerator from '@/components/BadgeGenerator';
import './page.module.css'; // We'll use this or global styles

export default function Home() {
  return (
    <main style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>HH GOA 2026</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>Official Graphic & Builder Badge Generator</p>
      </header>
      <BadgeGenerator />
    </main>
  );
}
