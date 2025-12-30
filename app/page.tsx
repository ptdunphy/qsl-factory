'use client';

import React, { useState, useRef } from 'react';
import { Upload, RefreshCw, Printer, Radio } from 'lucide-react';

// TypeScript Interface for the Card Design State
interface QslDesign {
  callsign: string;
  gridSquare: string;
  backgroundUrl: string;
  themeColor: string; // Hex or Tailwind class
  qsoData: {
    toCall: string;
    date: string;
    time: string;
    band: string;
    mode: string;
    rst: string;
  };
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=2670&auto=format&fit=crop";

export default function QslCardFactory() {
  const [design, setDesign] = useState<QslDesign>({
    callsign: 'K1HAM',
    gridSquare: 'FN42',
    backgroundUrl: DEFAULT_IMAGE,
    themeColor: '#10b981', // Emerald-500
    qsoData: {
      toCall: 'W1AW',
      date: '2023-10-25',
      time: '14:32 UTC',
      band: '20M',
      mode: 'SSB',
      rst: '59',
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Check if it's nested QSO data or top-level design data
    if (['toCall', 'date', 'time', 'band', 'mode', 'rst'].includes(name)) {
      setDesign((prev) => ({ ...prev, qsoData: { ...prev.qsoData, [name]: value } }));
    } else {
      setDesign((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono p-4 md:p-8">
      
      {/* Header */}
      <header className="mb-8 flex items-center gap-3 border-b border-slate-800 pb-4">
        <Radio className="text-emerald-500 h-8 w-8 animate-pulse" />
        <div>
          <h1 className="text-2xl font-bold tracking-tighter text-emerald-400">QSL FACTORY <span className="text-xs text-slate-500 ml-2">v1.0</span></h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Amateur Radio Design Workbench</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-emerald-500 font-bold mb-4 uppercase text-sm border-l-4 border-emerald-500 pl-2">Station Identity</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-slate-500 mb-1">Your Callsign</label>
                <input
                  type="text"
                  name="callsign"
                  value={design.callsign}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500 transition-colors uppercase"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-slate-500 mb-1">Grid Square</label>
                <input
                  type="text"
                  name="gridSquare"
                  value={design.gridSquare}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500 transition-colors uppercase"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-amber-500 font-bold mb-4 uppercase text-sm border-l-4 border-amber-500 pl-2">QSO Simulation Data</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase text-slate-500 mb-1">To Station</label>
                <input name="toCall" value={design.qsoData.toCall} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs uppercase text-slate-500 mb-1">Band</label>
                <input name="band" value={design.qsoData.band} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs uppercase text-slate-500 mb-1">Mode</label>
                <input name="mode" value={design.qsoData.mode} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs uppercase text-slate-500 mb-1">RST</label>
                <input name="rst" value={design.qsoData.rst} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800">
               <button className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors w-full justify-center">
                  <Upload size={14} /> Import ADIF File
               </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: The Visualizer */}
        <div className="lg:col-span-8 flex flex-col items-center justify-start">
          
          <div className="w-full flex justify-between items-center mb-4">
            <h3 className="text-sm uppercase text-slate-400">Live Preview (3.5" x 5.5")</h3>
            <div className="flex gap-2">
                <button className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded text-xs flex items-center gap-2 transition-colors">
                    <RefreshCw size={12} /> Randomize BG
                </button>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1 rounded text-xs flex items-center gap-2 font-bold transition-colors shadow-lg shadow-emerald-900/50">
                    <Printer size={12} /> ORDER PRINTS
                </button>
            </div>
          </div>

          {/* THE CARD ITSELF - Fixed Aspect Ratio Container */}
          {/* Standard Postcard is 3.5x5.5 inches. Aspect Ratio ~1.57 */}
          <div className="relative w-full max-w-3xl aspect-[1.57/1] shadow-2xl rounded-sm overflow-hidden group">
            
            {/* Background Image Layer */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${design.backgroundUrl})` }}
            >
              {/* Overlay for readability */}
              <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Design Layer */}
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between">
                
                {/* Header: Callsign */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 
                          className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
                          style={{ fontFamily: 'Arial, sans-serif' }} // Or a custom font
                        >
                            {design.callsign || 'CALL'}
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                             <span className="bg-emerald-500 text-black font-bold px-2 py-0.5 text-sm rounded-sm">GRID: {design.gridSquare}</span>
                             <span className="text-white/80 text-sm font-medium tracking-wide">ITU Zone 8 • CQ Zone 5</span>
                        </div>
                    </div>
                    
                    {/* Retro Badge */}
                    <div className="border-2 border-white/30 rounded-full h-24 w-24 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-white/50 text-xs font-bold -rotate-12">QSL<br/>VIA<br/>BURO</span>
                    </div>
                </div>

                {/* Footer: QSO Table */}
                <div className="bg-slate-900/90 backdrop-blur-md border-t-4 border-emerald-500 text-slate-200 p-4 rounded-sm shadow-lg">
                    <div className="grid grid-cols-6 text-xs uppercase text-slate-500 font-bold mb-2 tracking-wider">
                        <div>To Radio</div>
                        <div>Date</div>
                        <div>Time</div>
                        <div>Band</div>
                        <div>Mode</div>
                        <div>RST</div>
                    </div>
                    <div className="grid grid-cols-6 text-lg md:text-2xl font-mono text-emerald-400 items-baseline">
                        <div className="text-white">{design.qsoData.toCall}</div>
                        <div>{design.qsoData.date.split('-').slice(1).join('/')}</div>
                        <div>{design.qsoData.time}</div>
                        <div>{design.qsoData.band}</div>
                        <div>{design.qsoData.mode}</div>
                        <div>{design.qsoData.rst}</div>
                    </div>
                    <div className="mt-2 text-xs text-slate-400 italic text-right">
                        Tnx for the QSO! 73, {design.callsign}
                    </div>
                </div>

            </div>
          </div>
          
          <p className="mt-4 text-xs text-slate-600">
            *High-Gloss UV Coating applied to front side. 14pt Cardstock.
          </p>

        </div>
      </div>
    </div>
  );
}