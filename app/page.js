"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Cpu, MemoryStick, HardDrive, Layout, Wind, Power, TrendingUp, Search, Activity, Lock, Check } from 'lucide-react';

export default function HwCoreAnalyzer() {
  const [composants, setComposants] = useState([]);
  const [isVip, setIsVip] = useState(false);
  const [freeAnalysesLeft, setFreeAnalysesLeft] = useState(1);
  const [selection, setSelection] = useState({ 
    gpu: { prix: 0, nom: '' }, cpu: { prix: 0, nom: '' }, ram: { prix: 0, nom: '' }, 
    ssd: { prix: 0, nom: '' }, boitier: { prix: 0, nom: '' }, cm: { prix: 0, nom: '' }, 
    ventilo: { prix: 0, nom: '' }, alim: { prix: 0, nom: '' } 
  });
  const [prixAchat, setPrixAchat] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState({ benefice: 0, revente: 0, show: false });

  useEffect(() => {
    // 1. VERIFICATION VIP
    const params = new URLSearchParams(window.location.search);
    if (params.get('access') === 'VIP_ANALYZER_2026' || localStorage.getItem('hw_vip') === 'true') {
      setIsVip(true);
      localStorage.setItem('hw_vip', 'true');
    }

    // 2. VERIFICATION ESSAI GRATUIT
    const lastAnalysisDate = localStorage.getItem('last_free_analysis');
    if (lastAnalysisDate === new Date().toDateString()) {
      setFreeAnalysesLeft(0);
    }

    async function getComposants() {
      const { data } = await supabase.from('composants').select('*');
      if (data) setComposants(data);
    }
    getComposants();
  }, []);

  const handleAnalyze = () => {
    if (!isVip && freeAnalysesLeft <= 0) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const totalPieces = Object.values(selection).reduce((acc, curr) => acc + (curr.prix || 0), 0);
      const prixRevente = totalPieces * 0.9;
      const beneficeFinal = prixRevente - prixAchat;
      
      setResults({
        benefice: Math.round(beneficeFinal),
        revente: Math.round(prixRevente),
        show: true
      });
      setIsAnalyzing(false);

      if (!isVip) {
        setFreeAnalysesLeft(0);
        localStorage.setItem('last_free_analysis', new Date().toDateString());
      }
    }, 1200); 
  };

  const selecteurs = [
    { key: 'gpu', label: "CARTE GRAPHIQUE", icon: <Package size={18}/> },
    { key: 'cpu', label: "PROCESSEUR", icon: <Cpu size={18}/> },
    { key: 'cm', label: "CARTE MÈRE", icon: <Layout size={18}/> },
    { key: 'ram', label: "MÉMOIRE RAM", icon: <MemoryStick size={18}/> },
    { key: 'ssd', label: "STOCKAGE SSD", icon: <HardDrive size={18}/> },
    { key: 'boitier', label: "BOÎTIER PC", icon: <Package size={18}/> },
    { key: 'alim', label: "ALIMENTATION", icon: <Power size={18}/> },
    { key: 'ventilo', label: "REFROIDISSEMENT", icon: <Wind size={18}/> },
  ];

  return (
    <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)', // Nouveau fond (noir vers gris foncé)
        color: '#ffffff', // Tout le texte en blanc par défaut
        fontFamily: 'sans-serif', 
        padding: '40px 20px 250px 20px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
    }}>
      <div style={{ width: '100%', maxWidth: '900px' }}>
        
        {/* HEADER */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '900', fontStyle: 'italic', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>
            HWCORE <span style={{color: '#ffffff', opacity: 0.5}}>ANALYZER</span> {/* Label en blanc translucide */}
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ background: isVip ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.03)', padding: '8px 15px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', color: isVip ? '#22c55e' : '#ffffff', border: `1px solid ${isVip ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={14} color={isVip ? "#22c55e" : "#ffffff"}/> 
                {isVip ? "VIP UNLIMITED" : `FREE TRIAL: ${freeAnalysesLeft}/1`}
            </div>
          </div>
        </header>

        {/* GRILLE DES COMPOSANTS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '30px' }}>
          {selecteurs.map(s => (
            <SearchableSelect 
              key={s.key}
              label={s.label} 
              icon={s.icon}
              data={composants.filter(c => c.categorie === s.key)} 
              onSelect={(v) => {
                setSelection({...selection, [s.key]: v});
                setResults({...results, show: false});
              }} 
            />
          ))}
        </div>

        {/* SECTION ACTION */}
        <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '30px', textAlign: 'center', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          
          <div>
            <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#ffffff', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '10px' }}>Investissement</p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
              <input 
                type="number" 
                style={{ background: 'transparent', border: '1px solid #3a3a3a', borderRadius: '8px', color: '#ffffff', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', width: '120px', padding: '8px' }}
                placeholder="0"
                onChange={(e) => {
                  setPrixAchat(Number(e.target.value));
                  setResults({...results, show: false});
                }}
              />
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', opacity: 0.5 }}>EUR</span>
            </div>
          </div>

          {!isVip && freeAnalysesLeft === 0 ? (
            /* BLOC DE PAIEMENT */
            <div style={{ background: '#080808', border: '1px solid #22c55e', padding: '30px', borderRadius: '12px', width: '100%', animation: 'slideUp 0.3s ease' }}>
              <Lock size={20} color="#22c55e" style={{ marginBottom: '10px' }}/>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff', marginBottom: '20px' }}>LIMITE JOURNALIÈRE ATTEINTE</p>
              <button 
                onClick={() => window.location.href = 'https://buy.stripe.com/6oU3cv4UObGV5r56rW4c802'} 
                style={{ background: '#ffffff', color: '#000000', padding: '15px', borderRadius: '8px', fontWeight: '900', border: 'none', cursor: 'pointer', width: '100%' }}
              >
                PASSER AU VIP (9.99€)
              </button>
            </div>
          ) : (
            /* BOUTON ANALYSER */
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              style={{ background: '#ffffff', color: '#000000', padding: '15px 50px', borderRadius: '8px', fontWeight: '900', fontSize: '14px', letterSpacing: '2px', cursor: 'pointer', opacity: isAnalyzing ? 0.5 : 1 }}
            >
              {isAnalyzing ? "CHARGEMENT..." : "ANALYSER LE SETUP"}
            </button>
          )}
        </div>

        {/* BARRE DE SCORE FLOTTANTE */}
        {results.show && (
          <div style={{ position: 'fixed', bottom: '60px', left: '0', right: '0', padding: '0 20px', zIndex: 100 }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(5, 5, 5, 0.98)', backdropFilter: 'blur(10px)', border: `1px solid ${results.benefice > 0 ? '#22c55e' : '#ef4444'}`, borderRadius: '16px', padding: '25px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.9)', animation: 'slideUp 0.4s ease-out' }}>
              <div>
                <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#ffffff', opacity: 0.5, textTransform: 'uppercase' }}>Profit Net Estimé</p>
                <p style={{ fontSize: '50px', fontWeight: '900', color: results.benefice > 0 ? '#22c55e' : '#ef4444', margin: 0, textShadow: results.benefice > 0 ? '0 0 20px rgba(34, 197, 94, 0.2)' : 'none' }}>
                  {results.benefice}€
                </p>
              </div>
              {!isVip && (
                <button 
                    onClick={() => window.location.href = 'https://buy.stripe.com/6oU3cv4UObGV5r56rW4c802'}
                    style={{ background: '#22c55e', color: '#000000', border: 'none', padding: '12px 25px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                >
                    DEVENIR VIP
                </button>
              )}
            </div>
          </div>
        )}

      </div>
      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function SearchableSelect({ label, data, onSelect, icon }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const filtered = data.filter(item => item.nom.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ position: 'relative' }}>
      <div 
        style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ color: '#ffffff', opacity: 0.2 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '8px', fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', margin: 0 }}>{label}</p>
          <input 
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#ffffff', fontWeight: 'bold', fontSize: '12px', width: '100%' }}
            placeholder="Sélectionner..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
          />
        </div>
      </div>

      {isOpen && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '8px', maxHeight: '180px', overflowY: 'auto', zIndex: 200, boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
          {filtered.map(item => (
            <div 
              key={item.id}
              style={{ padding: '12px 15px', borderBottom: '1px solid #1a1a1a', cursor: 'pointer', fontSize: '12px' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              onClick={() => {
                onSelect(item);
                setQuery(item.nom);
                setIsOpen(false);
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#ffffff' }}>{item.nom}</span>
                <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{item.prix}€</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
