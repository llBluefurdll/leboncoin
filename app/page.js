"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Cpu, MemoryStick, HardDrive, Layout, Wind, Power, TrendingUp, Info } from 'lucide-react';

export default function FlipperProDashboard() {
  const [composants, setComposants] = useState([]);
  const [selection, setSelection] = useState({ 
    gpu: { prix: 0 }, cpu: { prix: 0 }, ram: { prix: 0 }, 
    ssd: { prix: 0 }, boitier: { prix: 0 }, cm: { prix: 0 }, 
    ventilo: { prix: 0 }, alim: { prix: 0 } 
  });
  const [prixAchat, setPrixAchat] = useState(0);

  useEffect(() => {
    async function getComposants() {
      const { data } = await supabase.from('composants').select('*');
      if (data) setComposants(data);
    }
    getComposants();
  }, []);

  const totalPieces = Object.values(selection).reduce((acc, curr) => acc + curr.prix, 0);
  const prixRevente = totalPieces * 0.9;
  const benefice = prixRevente - prixAchat;

  // Configuration des sélecteurs
  const selecteurs = [
    { key: 'gpu', label: "Carte Graphique", icon: <Package size={16}/> },
    { key: 'cpu', label: "Processeur", icon: <Cpu size={16}/> },
    { key: 'cm', label: "Carte Mère", icon: <Layout size={16}/> },
    { key: 'ram', label: "Mémoire RAM", icon: <MemoryStick size={16}/> },
    { key: 'ssd', label: "Stockage SSD", icon: <HardDrive size={18}/> },
    { key: 'boitier', label: "Boîtier PC", icon: <Package size={16}/> },
    { key: 'alim', label: "Alimentation", icon: <Power size={16}/> },
    { key: 'ventilo', label: "Refroidissement", icon: <Wind size={16}/> },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      // FOND : Un léger halo radial au centre pour donner de la vie (comme l'image)
      background: 'radial-gradient(circle at center, #111 0%, #050505 100%)',
      color: '#aaa',
      fontFamily: 'sans-serif',
      padding: '40px 20px 200px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: '950px' }}>
        
        {/* HEADER */}
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '50px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-2px', textTransform: 'uppercase', color: 'white', margin: 0 }}>
            FLIPPER<span style={{ color: '#aaa' }}>PRO</span> <span style={{ color: '#3b82f6', fontStyle: 'normal' }}>V2</span>
          </h1>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 15px', borderRadius: '50px', fontSize: '10px', fontWeight: 'bold', color: '#666', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={14} color="#22c55e"/> Profit x Scaling Activé
          </div>
        </header>

        {/* GRILLE D'ÉLITE (2 COLONNES comme sur l'image) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '40px' }}>
          {selecteurs.map(s => (
            <SearchableSelect 
              key={s.key}
              label={s.label} 
              icon={s.icon}
              data={composants.filter(c => c.categorie === s.key)} 
              onSelect={(v) => setSelection({...selection, [s.key]: v})} 
            />
          ))}
        </div>

        {/* INPUT PRIX ACHAT SECTION */}
        <div style={{ background: 'rgba(15, 15, 15, 0.5)', border: '1px solid rgba(59, 130, 246, 0.1)', borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase', letterSpacing: '5px', marginBottom: '30px' }}>Prix d'achat Leboncoin</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <input 
              type="number" 
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '120px', fontWeight: '900', textAlign: 'center', width: '350px' }}
              placeholder="0"
              onChange={(e) => setPrixAchat(Number(e.target.value))}
            />
            <span style={{ fontSize: '60px', fontWeight: '900', color: '#333' }}>€</span>
          </div>
        </div>

        {/* BARRE DE SCORE FIXE (Look "Vitre de PC CoolBox") */}
        <div style={{ position: 'fixed', bottom: '30px', left: '0', right: '0', padding: '0 20px' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto', background: 'rgba(10, 10, 10, 0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '30px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.8)' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', letterSpacing: '2px' }}>Bénéfice estimé Net</p>
              <p style={{ fontSize: '75px', fontWeight: '900', color: benefice > 0 ? '#3b82f6' : '#ef4444', margin: 0, letterSpacing: '-4px', lineHeight: 1 }}>
                {Math.round(benefice)}<span style={{ fontSize: '25px', color: '#333' }}>€</span>
              </p>
            </div>
            <div style={{ textAlign: 'right', h: '60px', display: 'flex', alignItems: 'end', gap: '20px' }}>
              <div style={{ width: '4px', height: '100%', background: 'linear-gradient(to top, #111, #333)', borderRadius: '10pxSc'}}></div>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' }}>Estimation Revente</p>
                <p style={{ fontSize: '30px', fontWeight: '900', color: 'white', margin: 0 }}>{Math.round(prixRevente)}€</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// SOUS-COMPOSANT AVEC STYLES EN LIGNE FORCÉS
function SearchableSelect({ label, data, onSelect, icon }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const filtered = data.filter(item => item.nom.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ position: 'relative' }}>
      <div 
        style={{ background: 'rgba(20, 20, 20, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '18px', display: 'flex', alignItems: 'center', gap: '18px', cursor: 'text', backdropFilter: 'blur(10px)' }}
        onClick={() => setIsOpen(true)}
      >
        <div style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.05)', p: '12px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', margin: '0 0 2px 0' }}>{label}</p>
          <input 
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontWeight: 'bold', fontSize: '14px', width: '100%' }}
            placeholder="Rechercher..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
          />
        </div>
      </div>

      {isOpen && (
        <>
          {/* Overlay invisible pour fermer */}
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} onClick={() => setIsOpen(false)} />
          {/* Liste Style GOAT */}
          <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', maxHeight: '200px', overflowY: 'auto', zIndex: 100, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            {filtered.map(item => (
              <div 
                key={item.id}
                style={{ padding: '12px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                onClick={() => {
                  onSelect(item);
                  setQuery(item.nom);
                  setIsOpen(false);
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '13px', color: '#ccc' }}>{item.nom}</span>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#3b82f6' }}>{item.prix}€</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}