'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  RotateCcw, 
  Move, 
  Layers, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  CreditCard,
  Eye,
  Type
} from 'lucide-react';

// --- Types ---
type CardSize = 'bureau' | 'postcard' | 'eyeball';
type CardFinish = 'standard' | 'matte' | 'linen';
type CardSide = 'front' | 'back';

interface DesignState {
  size: CardSize;
  finish: CardFinish;
  isFolded: boolean;
  addOns: {
    roundedCorners: boolean;
    heavyStock: boolean;
  };
  assets: {
    frontImg: string | null;
    backImg: string | null;
  };
  gridSettings: {
    showSimulation: boolean;    // The "W1AW" dummy data
    enableContrast: boolean;    // The semi-transparent box
    position: { x: number; y: number }; // Coordinate placement
  };
}

// --- Pricing Logic Internalized ---
const calculateTotal = (state: DesignState) => {
  const BASES = { bureau: 45, postcard: 55, eyeball: 29 };
  let price = BASES[state.size];
  
  if (state.isFolded) price *= 2;
  if (state.finish === 'linen') price += (price * 0.20);
  if (state.addOns.roundedCorners) price += 5;
  if (state.addOns.heavyStock) price += 10;
  
  return price.toFixed(2);
};

export default function QslAdvancedDesigner() {
  const [activeSide, setActiveSide] = useState<CardSide>('front');
  const [lowResWarning, setLowResWarning] = useState<boolean>(false);
  
  const [design, setDesign] = useState<DesignState>({
    size: 'bureau',
    finish: 'standard',
    isFolded: false,
    addOns: { roundedCorners: false, heavyStock: false },
    assets: { frontImg: null, backImg: null },
    gridSettings: {
      showSimulation: false,
      enableContrast: false,
      position: { x: 0, y: 0 }
    }
  });

  // --- Handlers ---

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: CardSide) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      
      // Resolution Check (Phase 2 Requirement)
      const img = new Image();
      img.src = url;
      img.onload = () => {
        // Assume 300 DPI for 3.5" width = 1050px
        if (img.width < 1050) setLowResWarning(true);
        else setLowResWarning(false);
      };

      setDesign(prev => ({
        ...prev,
        assets: { ...prev.assets, [side === 'front' ? 'frontImg' : 'backImg']: url }
      }));
    }
  };

  const handleNudge = (dx: number, dy: number) => {
    setDesign(prev => ({
      ...prev,
      gridSettings: {
        ...prev.gridSettings,
        position: {
          x: prev.gridSettings.position.x + dx,
          y: prev.gridSettings.position.y + dy
        }
      }
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8 flex flex-col lg:flex-row gap-8">
      
      {/* =======================
          LEFT: VISUALIZER ENGINE 
         ======================= */}
      <div className="lg:w-2/3 flex flex-col gap-6">
        
        {/* Toolbar */}
        <div className="flex justify-between items-center bg-slate-900 p-4 rounded-lg border border-slate-800">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveSide('front')}
              className={`px-4 py-2 rounded text-sm font-bold flex items-center gap-2 ${activeSide === 'front' ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'}`}
            >
              <CreditCard size={16} /> FRONT
            </button>
            <button 
              onClick={() => setActiveSide('back')}
              className={`px-4 py-2 rounded text-sm font-bold flex items-center gap-2 ${activeSide === 'back' ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'}`}
            >
              <Type size={16} /> BACK
            </button>
          </div>

          <div className="flex items-center gap-4">
            {activeSide === 'back' && (
              <>
                <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={design.gridSettings.showSimulation}
                    onChange={(e) => setDesign(prev => ({...prev, gridSettings: {...prev.gridSettings, showSimulation: e.target.checked}}))}
                    className="accent-emerald-500"
                  />
                  QSO Sim
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={design.gridSettings.enableContrast}
                    onChange={(e) => setDesign(prev => ({...prev, gridSettings: {...prev.gridSettings, enableContrast: e.target.checked}}))}
                    className="accent-emerald-500"
                  />
                  Contrast Box
                </label>
                {/* Nudge Controls */}
                <div className="flex items-center bg-slate-800 rounded px-2 py-1 gap-2">
                  <Move size={14} className="text-slate-400" />
                  <button onClick={() => handleNudge(0, -5)} className="hover:text-white">↑</button>
                  <button onClick={() => handleNudge(0, 5)} className="hover:text-white">↓</button>
                  <button onClick={() => handleNudge(-5, 0)} className="hover:text-white">←</button>
                  <button onClick={() => handleNudge(5, 0)} className="hover:text-white">→</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* The Stage */}
        <div className="flex-1 flex items-center justify-center bg-slate-900/50 rounded-xl p-8 border border-slate-800 relative overflow-hidden">
          
          {/* Resolution Warning Toast */}
          {lowResWarning && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500/90 text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 z-50 animate-bounce">
              <AlertTriangle size={14} /> Low Resolution Image (&lt;300 DPI)
            </div>
          )}

          {/* CARD PREVIEW */}
          <div 
            className={`
              relative bg-white shadow-2xl transition-all duration-500 ease-in-out
              ${design.finish === 'linen' ? 'brightness-95 contrast-[1.05]' : ''} 
              ${design.addOns.roundedCorners ? 'rounded-2xl' : 'rounded-none'}
            `}
            style={{
              width: design.size === 'bureau' ? '550px' : design.size === 'postcard' ? '600px' : '350px',
              height: design.size === 'bureau' ? '350px' : design.size === 'postcard' ? '400px' : '200px',
              // Linen Texture Simulation using CSS Gradient
              backgroundImage: design.finish === 'linen' 
                ? `repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0.03) 2px)` 
                : 'none'
            }}
          >
            {/* Background Image Layer */}
            <div className="absolute inset-0 overflow-hidden">
               {activeSide === 'front' && design.assets.frontImg ? (
                 <img src={design.assets.frontImg} className="w-full h-full object-cover" />
               ) : activeSide === 'back' && design.assets.backImg ? (
                 <img src={design.assets.backImg} className="w-full h-full object-cover opacity-50" />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-100">
                    <Upload size={32} className="mb-2 text-slate-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Drag & Drop {activeSide}</span>
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleFileUpload(e, activeSide)}
                    />
                 </div>
               )}
            </div>

            {/* Back Side: QSO Logic & Overlays */}
            {activeSide === 'back' && (
              <div 
                className="absolute inset-0 p-6 flex flex-col justify-center"
                style={{ 
                  transform: `translate(${design.gridSettings.position.x}px, ${design.gridSettings.position.y}px)` 
                }}
              >
                {/* Contrast Box */}
                <div className={`
                  ${design.gridSettings.enableContrast ? 'bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm' : ''} 
                  p-4 rounded transition-all duration-200
                `}>
                  {/* Standard QSL Grid Layout */}
                  <div className="grid grid-cols-6 gap-2 text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b-2 border-slate-300 pb-1 mb-2">
                    <div>Station</div>
                    <div>Day/M/Year</div>
                    <div>Time</div>
                    <div>Band</div>
                    <div>Mode</div>
                    <div>RST</div>
                  </div>
                  
                  {/* Simulation Data or Placeholders */}
                  <div className={`grid grid-cols-6 gap-2 text-sm font-mono ${design.gridSettings.showSimulation ? 'text-slate-900' : 'text-slate-300'}`}>
                    <div>{design.gridSettings.showSimulation ? 'W1AW' : '————'}</div>
                    <div>{design.gridSettings.showSimulation ? '12/10/25' : '————'}</div>
                    <div>{design.gridSettings.showSimulation ? '14:00' : '————'}</div>
                    <div>{design.gridSettings.showSimulation ? '20M' : '————'}</div>
                    <div>{design.gridSettings.showSimulation ? 'CW' : '————'}</div>
                    <div>{design.gridSettings.showSimulation ? '599' : '————'}</div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* =======================
          RIGHT: PRODUCTION OPTIONS
         ======================= */}
      <div className="lg:w-1/3 bg-slate-900 border-l border-slate-800 p-6 shadow-2xl overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Layers className="text-emerald-500" /> Production Specs
        </h2>

        {/* 1. Size Selection */}
        <section className="mb-8">
          <h3 className="text-xs uppercase text-slate-500 font-bold mb-3">Card Size</h3>
          <div className="space-y-2">
            {[
              { id: 'bureau', label: '3.5" x 5.5"', sub: 'Bureau Standard', tip: 'Accepted by ARRL & Int\'l Bureaus' },
              { id: 'postcard', label: '4.0" x 6.0"', sub: 'Standard Postcard', tip: 'Great for direct mailing' },
              { id: 'eyeball', label: '2.0" x 3.5"', sub: 'Eyeball QSL', tip: 'Business card size for hamfests' },
            ].map((opt) => (
              <div 
                key={opt.id}
                onClick={() => setDesign(p => ({...p, size: opt.id as CardSize}))}
                className={`
                  group relative flex items-center justify-between p-3 rounded cursor-pointer border transition-all
                  ${design.size === opt.id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}
                `}
              >
                <div>
                  <div className="font-bold">{opt.label}</div>
                  <div className="text-xs opacity-70">{opt.sub}</div>
                </div>
                
                {/* Info Tooltip */}
                <div className="relative group/icon">
                   <Info size={16} className="text-slate-600 group-hover:text-emerald-500" />
                   <div className="absolute right-8 top-0 w-48 bg-black text-white text-xs p-2 rounded shadow-xl hidden group-hover/icon:block z-50">
                      {opt.tip}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Finish Selection */}
        <section className="mb-8">
          <h3 className="text-xs uppercase text-slate-500 font-bold mb-3">Paper Finish</h3>
          <div className="grid grid-cols-1 gap-2">
             <FinishCard 
                active={design.finish === 'standard'} 
                title="Glossy Front" 
                desc="High-Gloss UV front, Matte back for writing." 
                onClick={() => setDesign(p => ({...p, finish: 'standard'}))} 
             />
             <FinishCard 
                active={design.finish === 'matte'} 
                title="Full Matte" 
                desc="Elegant, non-reflective finish on both sides." 
                onClick={() => setDesign(p => ({...p, finish: 'matte'}))} 
             />
             <FinishCard 
                active={design.finish === 'linen'} 
                title="Linen Texture" 
                desc="Premium woven texture feels like canvas." 
                price="+20%"
                onClick={() => setDesign(p => ({...p, finish: 'linen'}))} 
             />
          </div>
        </section>

        {/* 3. Add-Ons & Folding */}
        <section className="mb-8">
          <h3 className="text-xs uppercase text-slate-500 font-bold mb-3">Upgrades</h3>
          <div className="space-y-3">
            <ToggleRow 
              label="Rounded Corners" 
              price="+$5.00" 
              checked={design.addOns.roundedCorners} 
              onChange={() => setDesign(p => ({...p, addOns: {...p.addOns, roundedCorners: !p.addOns.roundedCorners}}))} 
            />
            <ToggleRow 
              label="Heavy Stock (16pt)" 
              price="+$10.00" 
              checked={design.addOns.heavyStock} 
              onChange={() => setDesign(p => ({...p, addOns: {...p.addOns, heavyStock: !p.addOns.heavyStock}}))} 
            />
            <div className="h-px bg-slate-800 my-4"></div>
            <ToggleRow 
              label="Folded Card (7x5.5)" 
              price="2x Price" 
              highlight 
              checked={design.isFolded} 
              onChange={() => setDesign(p => ({...p, isFolded: !p.isFolded}))} 
            />
          </div>
        </section>

        {/* Total Price Sticky Footer */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mt-auto">
          <div className="flex justify-between items-end">
             <span className="text-slate-400 text-sm">Estimated Total (100 Cards)</span>
             <span className="text-3xl font-mono text-emerald-400">${calculateTotal(design)}</span>
          </div>
          <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 mt-4 rounded transition-colors uppercase tracking-widest text-sm">
             Add to Cart
          </button>
        </div>

      </div>
    </div>
  );
}

// --- Sub-Components ---

function FinishCard({ active, title, desc, price, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`
        p-3 rounded border cursor-pointer transition-all
        ${active ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}
      `}
    >
      <div className="flex justify-between">
        <span className={`font-bold ${active ? 'text-emerald-400' : 'text-slate-300'}`}>{title}</span>
        {price && <span className="text-xs bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded">{price}</span>}
      </div>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </div>
  );
}

function ToggleRow({ label, price, checked, onChange, highlight }: any) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-emerald-600 border-emerald-600' : 'bg-slate-900 border-slate-700'}`}>
          {checked && <CheckCircle2 size={14} className="text-white" />}
        </div>
        <span className={`${highlight ? 'text-white font-bold' : 'text-slate-300'}`}>{label}</span>
      </div>
      <span className={`text-xs ${highlight ? 'text-emerald-400' : 'text-slate-500'}`}>{price}</span>
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
    </label>
  );
}