'use client';

import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Upload, Download, Copy, Share2, Image as ImageIcon, CreditCard, RefreshCw } from 'lucide-react';
import { getCroppedImg } from '@/utils/canvasUtils';

const FORMATS = {
  PFP: 'A',
  BADGE: 'B',
};

const TITLES = [
  "Beachside Neural Architect",
  "Goa Sunset Debugger",
  "On-Chain Sol-Man",
  "Tropical Code Ninja",
  "Cyber-Breeze Engineer",
  "Hackathon Hustler",
  "Fullstack Surfer",
  "Quantum Vibe Coder"
];

const THEMES = [
  { id: 'neon', name: 'Goa Sunset Neon', color1: '#FF5E3A', color2: '#8A2BE2' },
  { id: 'minimal', name: 'Builder Minimalist', color1: '#ffffff', color2: '#cccccc' },
  { id: 'cyber', name: 'Cyber Beach', color1: '#00F2FE', color2: '#4FACFE' },
];

export default function BadgeGenerator() {
  const [format, setFormat] = useState(FORMATS.PFP);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Badge Form State
  const [name, setName] = useState('John Doe');
  const [role, setRole] = useState('Fullstack Developer');
  const [title, setTitle] = useState(TITLES[0]);
  const [theme, setTheme] = useState(THEMES[0]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      alert("File is too large! Please upload a file smaller than 15MB.");
      return;
    }
    
    setIsProcessing(true);
    let finalFile = file;

    // Handle HEIC
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      try {
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        });
        finalFile = new File([convertedBlob as Blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
      } catch (error) {
        console.error("HEIC conversion failed:", error);
        alert("Failed to process HEIC image.");
        setIsProcessing(false);
        return;
      }
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result?.toString() || null);
      setIsProcessing(false);
    });
    reader.readAsDataURL(finalFile);
  };

  const generateRandomTitle = () => {
    const randomTitle = TITLES[Math.floor(Math.random() * TITLES.length)];
    setTitle(randomTitle);
  };

  // Canvas drawing logic for preview and export
  const drawCanvas = async (exportMode = false): Promise<string | null> => {
    if (!imageSrc || !croppedAreaPixels) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // High res for export, lower res for preview (preview is handled by CSS mostly, but we can draw it too)
    const size = format === FORMATS.PFP ? 3000 : 1200;
    const height = format === FORMATS.PFP ? 3000 : 1500;
    canvas.width = exportMode ? size : size / 4;
    canvas.height = exportMode ? height : height / 4;
    const scale = exportMode ? 1 : 0.25;

    // 1. Draw Background
    if (format === FORMATS.PFP) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      // Badge Background
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw gradient header
      const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad.addColorStop(0, theme.color1);
      grad.addColorStop(1, theme.color2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, 300 * scale);
    }

    // 2. Process and draw Cropped Image
    try {
      const croppedImageSrc = await getCroppedImg(imageSrc, croppedAreaPixels);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = croppedImageSrc;
      });

      if (format === FORMATS.PFP) {
        // Draw circular image
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - (100 * scale), 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 100 * scale, 100 * scale, canvas.width - (200 * scale), canvas.height - (200 * scale));
        ctx.restore();

        // Draw ring overlay
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - (100 * scale), 0, Math.PI * 2);
        ctx.lineWidth = 60 * scale;
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, theme.color1);
        grad.addColorStop(1, theme.color2);
        ctx.strokeStyle = grad;
        ctx.stroke();
        
        // Draw text overlay
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${200 * scale}px Outfit`;
        ctx.textAlign = 'center';
        ctx.fillText('HH GOA 2026', canvas.width / 2, canvas.height - (150 * scale));

      } else {
        // Badge Image (Square)
        const imgSize = 600 * scale;
        const imgX = 300 * scale; // 25% of 1200 width
        const imgY = 150 * scale; // 10% of 1500 height
        
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgSize, imgSize, 40 * scale);
        ctx.clip();
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
        ctx.restore();
        
        // Border for image
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgSize, imgSize, 40 * scale);
        ctx.lineWidth = 15 * scale;
        ctx.strokeStyle = theme.color1;
        ctx.stroke();

        // Draw Texts
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        
        // Name
        let safeName = name.substring(0, 25);
        ctx.font = `bold ${100 * scale}px Outfit`;
        ctx.fillText(safeName || 'YOUR NAME', canvas.width / 2, imgY + imgSize + (140 * scale));
        
        // Role
        ctx.font = `bold ${55 * scale}px Inter`;
        ctx.fillStyle = theme.color2;
        ctx.fillText((role || 'YOUR ROLE').toUpperCase(), canvas.width / 2, imgY + imgSize + (220 * scale));
        
        // Title
        ctx.font = `italic 400 ${45 * scale}px Inter`;
        ctx.fillStyle = '#cccccc';
        ctx.fillText(title, canvas.width / 2, imgY + imgSize + (290 * scale));
        
        // Footer branding
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${65 * scale}px Outfit`;
        ctx.fillText('HACKER HOUSE GOA 2026', canvas.width / 2, canvas.height - (180 * scale));
        ctx.font = `400 ${35 * scale}px Inter`;
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText('OFFICIAL ATTENDEE / BUILDER', canvas.width / 2, canvas.height - (110 * scale));
      }

      // Cleanup blob url
      URL.revokeObjectURL(croppedImageSrc);
      
      return canvas.toDataURL('image/png');
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleDownload = async () => {
    const dataUrl = await drawCanvas(true);
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `hh-goa-2026-${format === FORMATS.PFP ? 'pfp' : 'badge'}.png`;
    a.click();
  };

  const handleCopy = async () => {
    try {
      const dataUrl = await drawCanvas(true);
      if (!dataUrl) return;
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert("Image copied to clipboard! Paste it directly into your tweet.");
    } catch (err) {
      console.error(err);
      alert("Failed to copy image. Your browser might not support it.");
    }
  };

  const handleShareX = async () => {
    await handleCopy();
    const text = encodeURIComponent("I'm ready for Hacker House Goa 2026! 🌴🚀 Built my badge with the HH Goa 2026 generator. See you at the beach! #HHGoa2026 #HackerHouseGoa #BuildInPublic");
    window.open(`https://x.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', width: '100%', maxWidth: '1200px', flexWrap: 'wrap', justifyContent: 'center' }}>
      
      {/* LEFT COLUMN: Controls */}
      <div className="glass-panel" style={{ flex: '1 1 400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '0.5rem' }}>
          <button 
            onClick={() => setFormat(FORMATS.PFP)}
            style={{ 
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: format === FORMATS.PFP ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.3s'
            }}
          >
            <ImageIcon size={18} /> PFP Frame
          </button>
          <button 
            onClick={() => setFormat(FORMATS.BADGE)}
            style={{ 
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: format === FORMATS.BADGE ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.3s'
            }}
          >
            <CreditCard size={18} /> ID Badge
          </button>
        </div>

        {/* Upload Area */}
        {!imageSrc ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--color-card-border)', borderRadius: '16px', padding: '3rem 2rem',
              textAlign: 'center', cursor: 'pointer', transition: '0.3s',
              background: 'rgba(0,0,0,0.2)'
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                processFile(e.dataTransfer.files[0]);
              }
            }}
          >
            {isProcessing ? (
              <p>Processing image...</p>
            ) : (
              <>
                <Upload size={40} style={{ margin: '0 auto 1rem', color: 'var(--color-cyan)' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>Upload your photo</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Supports JPG, PNG, WEBP, HEIC (Max 15MB)</p>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#00F2FE' }}>✓ Photo uploaded</span>
            <button className="btn-secondary" onClick={() => setImageSrc(null)} style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
              Change Photo
            </button>
          </div>
        )}

        <input 
          type="file" 
          accept="image/jpeg, image/png, image/webp, image/heic, .heic" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
        />

        {/* Format Specific Controls */}
        {imageSrc && format === FORMATS.BADGE && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label className="input-label">Name (Max 25 chars)</label>
              <input 
                type="text" 
                className="input-field" 
                value={name} 
                onChange={(e) => setName(e.target.value.substring(0, 25))} 
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="input-label">Role / Primary Stack</label>
              <input 
                type="text" 
                className="input-field" 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                placeholder="e.g. UI/UX, Web3, Fullstack"
              />
            </div>
            <div>
              <label className="input-label">Builder Title</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Beachside Neural Architect"
                />
                <button className="btn-secondary" onClick={generateRandomTitle} title="Random Title" style={{ padding: '0 15px' }}>
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Theme Selector */}
        {imageSrc && (
          <div style={{ marginTop: '1rem' }}>
            <label className="input-label">Frame Theme</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {THEMES.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setTheme(t)}
                  style={{
                    padding: '8px 12px', borderRadius: '20px', border: `1px solid ${theme.id === t.id ? t.color1 : 'rgba(255,255,255,0.2)'}`,
                    background: theme.id === t.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: 'white', cursor: 'pointer', fontSize: '0.85rem', transition: '0.2s'
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {imageSrc && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto', paddingTop: '2rem' }}>
            <button className="btn-primary" onClick={handleDownload}>
              <Download size={20} /> Download PNG
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={handleCopy}>
                <Copy size={18} /> Copy
              </button>
              <button className="btn-secondary" style={{ flex: 1, backgroundColor: '#000000', borderColor: '#333' }} onClick={handleShareX}>
                <Share2 size={18} color="white" /> Share to X
              </button>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: Preview & Cropper */}
      <div className="glass-panel" style={{ flex: '1 1 400px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '500px', overflow: 'hidden' }}>
        
        {!imageSrc ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            <ImageIcon size={60} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Upload a photo to see live preview</p>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--color-cyan)' }}>Live Preview</h3>
            
            {/* Interactive Preview Container */}
            <div 
              style={{ 
                position: 'relative', 
                width: '100%', 
                aspectRatio: format === FORMATS.PFP ? '1/1' : '4/5',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#000',
                boxShadow: `0 0 40px ${theme.color1}40`
              }}
            >
              
              {/* React Easy Crop handles pan/zoom */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={format === FORMATS.PFP ? 1 : 1} // Always square crop for the avatar part
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  showGrid={false}
                  style={{ containerStyle: { background: 'transparent' } }}
                />
              </div>
              
              {/* Visual Overlays for Live Preview */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, pointerEvents: 'none' }}>
                
                {format === FORMATS.PFP ? (
                  /* PFP Frame Overlay */
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', top: '2%', left: '2%', right: '2%', bottom: '2%', 
                      borderRadius: '50%', border: `15px solid transparent`,
                      background: `linear-gradient(${theme.color1}, ${theme.color2}) border-box`,
                      WebkitMask: `linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)`,
                      WebkitMaskComposite: 'destination-out',
                      maskComposite: 'exclude',
                    }}></div>
                    <div style={{ position: 'absolute', bottom: '8%', width: '100%', textAlign: 'center' }}>
                      <span style={{ 
                        background: 'rgba(0,0,0,0.7)', padding: '4px 16px', borderRadius: '20px', 
                        fontFamily: 'var(--font-heading)', fontWeight: 'bold', letterSpacing: '2px', fontSize: '1rem' 
                      }}>
                        HH GOA 2026
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Badge Overlay */
                  <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                     {/* Cutout for the square crop to show through */}
                     <div style={{ 
                       position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                       background: 'var(--background)', zIndex: -1
                     }}></div>
                     
                     <div style={{ 
                       height: '15%', width: '100%', 
                       background: `linear-gradient(to right, ${theme.color1}, ${theme.color2})`,
                       position: 'absolute', top: 0, left: 0, zIndex: -1
                     }}></div>
                     
                     {/* Text content area that covers the rest of the badge, masking out the cropper except for the photo box */}
                     <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                       <defs>
                         <mask id="hole">
                           <rect width="100%" height="100%" fill="white"/>
                           <rect x="25%" y="10%" width="50%" height="40%" rx="16" fill="black" />
                         </mask>
                       </defs>
                       <rect width="100%" height="100%" fill="#0a0a1a" mask="url(#hole)" />
                       <rect width="100%" height="15%" fill={`url(#grad1)`} mask="url(#hole)" />
                       <linearGradient id="grad1">
                         <stop offset="0%" stopColor={theme.color1} />
                         <stop offset="100%" stopColor={theme.color2} />
                       </linearGradient>
                       {/* Stroke around the hole */}
                       <rect x="25%" y="10%" width="50%" height="40%" rx="16" fill="none" stroke={theme.color1} strokeWidth="4" />
                     </svg>
                     
                     <div style={{ position: 'absolute', top: '55%', width: '100%', textAlign: 'center', padding: '0 1rem' }}>
                       <h2 style={{ fontSize: '1.8rem', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-heading)' }}>
                         {name || 'YOUR NAME'}
                       </h2>
                       <p style={{ color: theme.color2, fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.2rem', textTransform: 'uppercase' }}>
                         {role || 'YOUR ROLE'}
                       </p>
                       <p style={{ color: '#aaa', fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                         {title}
                       </p>
                       
                       <div style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)', color: '#fff', marginTop: '1rem' }}>
                         HACKER HOUSE GOA 2026
                       </div>
                       <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px', letterSpacing: '1px' }}>
                         OFFICIAL ATTENDEE / BUILDER
                       </div>
                     </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Zoom Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '10px 15px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#aaa' }}>Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--color-cyan)' }}
              />
            </div>
            
          </div>
        )}
      </div>
      
    </div>
  );
}
