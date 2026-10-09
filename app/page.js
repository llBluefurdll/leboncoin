"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Cpu, MemoryStick, HardDrive, Layout, Wind, Power, Activity, Lock, User, CheckCircle2, X, Sparkles } from 'lucide-react';

export default function HwCoreAnalyzer() {
  const [composants, setComposants] = useState([]);
  const [user, setUser] = useState(null);
  const [isVip, setIsVip] = useState(false);
  const [freeAnalysesLeft, setFreeAnalysesLeft] = useState(0); 
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', confirmEmail: false });
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [selection, setSelection] = useState({ 
    gpu: { prix: 0, nom: '' }, cpu: { prix: 0, nom: '' }, ram: { prix: 0, nom: '' }, 
    ssd: { prix: 0, nom: '' }, boitier: { prix: 0, nom: '' }, cm: { prix: 0, nom: '' }, 
    ventilo: { prix: 0, nom: '' }, alim: { prix: 0, nom: '' } 
  });
  const [prixAchat, setPrixAchat] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState({ benefice: 0, revente: 0, show: false });

  useEffect(() => {
    const initApp = async () => {
      setIsLoadingStatus(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) {
          if (profile.is_vip) setIsVip(true);
          setFreeAnalysesLeft(profile.free_analyses_left ?? 0);
        }
      } else {
        const hasUsed = localStorage.getItem('hw_guest_analyzed');
        setFreeAnalysesLeft(hasUsed ? 0 : 1);
      }
      
      const { data } = await supabase.from('composants').select('*');
      if (data) setComposants(data);
      setIsLoadingStatus(false);
    };
    initApp();
  }, []);

  const handlePayment = () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    const stripeUrl = "https://buy.stripe.com/7sY00jbjc6mB6v903y4c804"; 
    window.location.href = `${stripeUrl}?client_reference_id=${user.id}`;
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsAuthLoading(true);
    const { email, password, confirmEmail } = authForm;

    if (authMode === 'signup') {
      if (!confirmEmail) {
        alert("Veuillez confirmer votre email avant de continuer.");
        setIsAuthLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else {
        alert("Compte créé ! Connectez-vous maintenant.");
        setAuthMode('login');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Email ou mot de passe incorrect.");
      else window.location.reload();
    }
    setIsAuthLoading(false);
  };

  const handleLogout = async () => {
    if (confirm("Voulez-vous vous déconnecter ?")) {
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  const handleAnalyze = async () => {
    if (isVip) { 
      runAnalysis(); 
      return; 
    }

    if (freeAnalysesLeft <= 0) return;

    setIsAnalyzing(true);
    setFreeAnalysesLeft(0);

    if (user) {
      await supabase.from('profiles').update({ free_analyses_left: 0 }).eq('id', user.id);
    } else {
      localStorage.setItem('hw_guest_analyzed', 'true');
    }

    runAnalysis();
  };

  const runAnalysis = () => {
    setTimeout(() => {
      const totalPieces = Object.values(selection).reduce((acc, curr) => acc + (curr.prix || 0), 0);
      const prixRevente = totalPieces * 0.9;
      setResults({ 
        benefice: Math.round(prixRevente - prixAchat), 
        revente: Math.round(prixRevente), 
        show: true 
      });
      setIsAnalyzing(false);
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #000 0%, #1a1a1a 100%)', color: '#fff', fontFamily: 'sans-serif', padding: '20px 15px 140px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box', overflowY: 'auto' }}>
      
      {/* CSS Responsive optimisé pour téléphones */}
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          background-color: #000;
          overflow-x: hidden;
        }
        .grid-selecteurs {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 25px;
        }
        .step-cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 15px;
        }
        .header-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }
        @media (min-width: 640px) {
          .grid-selecteurs {
            grid-template-columns: 1fr 1fr;
          }
          .step-cards {
            grid-template-columns: 1fr 1fr;
          }
          .header-container {
            flex-direction: row;
            justify-content: space-between;
          }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: '900px' }}>
        
        <header className="header-container">
          <h1 style={{ fontSize: '20px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', margin: 0, textAlign: 'center' }}>HWCORE ANALYZER</h1>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {user ? (
              <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14}/> {user.email.split('@')[0].toUpperCase()}
              </button>
            ) : (
              <>
                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} style={{ background: 'transparent', border: '1px solid #333', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                  CONNEXION
                </button>
                <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} style={{ background: '#fff', color: '#000', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                  S'INSCRIRE
                </button>
              </>
            )}
            <div style={{ background: isVip ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #333', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} color={isVip ? "#22c55e" : "#fff"}/> 
              {isLoadingStatus ? "VÉRIF..." : isVip ? "VIP UNLIMITED" : `ESSAI : ${freeAnalysesLeft}/1`}
            </div>
          </div>
        </header>

        <div className="grid-selecteurs">
          {selecteurs.map(s => (
            <SearchableSelect key={s.key} label={s.label} icon={s.icon} data={composants.filter(c => c.categorie === s.key)} onSelect={(v) => { setSelection({...selection, [s.key]: v}); setResults({...results, show: false}); }} />
          ))}
        </div>

        <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '25px', textAlign: 'center', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', paddingBottom: '30px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 'bold', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}>Investissement</p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <input type="number" style={{ background: 'transparent', border: '1px solid #3a3a3a', borderRadius: '8px', color: '#fff', fontSize: '22px', fontWeight: 'bold', textAlign: 'center', width: '110px', padding: '8px' }} placeholder="0" onChange={(e) => { setPrixAchat(Number(e.target.value)); setResults({...results, show: false}); }} />
              <span style={{ fontSize: '16px', fontWeight: 'bold', opacity: 0.5 }}>EUR</span>
            </div>
          </div>

          {isLoadingStatus ? (
             <button style={{ background: '#111', color: '#444', padding: '15px 40px', borderRadius: '8px', border: '1px solid #222', cursor: 'wait', width: '100%' }}>CHARGEMENT...</button>
          ) : results.show ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #333', padding: '20px', borderRadius: '16px', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <p style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '2px', margin: 0 }}>ESTIMATION DE REVENTE</p>
                <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#22c55e', margin: 0 }}>{results.revente}€</h2>
                <div style={{ padding: '8px 16px', background: results.benefice >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: results.benefice >= 0 ? '#22c55e' : '#ef4444' }}>
                        Bénéfice : {results.benefice}€
                    </p>
                </div>

                {!isVip && (
                  <div style={{ marginTop: '15px', paddingTop: '20px', borderTop: '1px solid #222', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <p style={{ fontSize: '12px', color: '#22c55e', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={16}/> Essai gratuit utilisé.
                    </p>
                    <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>
                      Débloquez l'accès VIP pour effectuer des analyses illimitées.
                    </p>
                    <button onClick={handlePayment} style={{ background: '#22c55e', color: '#000', padding: '12px 20px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: '900', cursor: 'pointer', width: '100%' }}>
                      PASSER VIP MAINTENANT
                    </button>
                  </div>
                )}
            </div>
          ) : (!isVip && freeAnalysesLeft === 0) ? (
            <div style={{ border: '1px solid rgba(34, 197, 94, 0.2)', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Lock size={18} color="#22c55e"/>
                <p style={{ fontSize: '13px', fontWeight: '900', letterSpacing: '1px', margin: 0 }}>ACCÈS LIMITÉ — PASSEZ AU VIP</p>
              </div>

              <div className="step-cards">
                <div style={{ background: user ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.03)', border: '1px solid #222', padding: '15px', borderRadius: '12px', textAlign: 'left', position: 'relative' }}>
                  {user && <CheckCircle2 size={16} color="#22c55e" style={{ position: 'absolute', top: '10px', right: '10px' }}/>}
                  <p style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>ÉTAPE 1</p>
                  <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '12px' }}>{user ? "COMPTE CRÉÉ" : "CRÉER UN COMPTE"}</p>
                  <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} disabled={user} style={{ background: user ? 'transparent' : '#fff', color: user ? '#22c55e' : '#000', padding: '10px', borderRadius: '6px', width: '100%', border: user ? '1px solid #22c55e' : 'none', fontSize: '11px', fontWeight: 'bold', cursor: user ? 'default' : 'pointer' }}>
                    {user ? "IDENTIFIÉ ✓" : "S'INSCRIRE"}
                  </button>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid #222', padding: '15px', borderRadius: '12px', textAlign: 'left' }}>
                  <p style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>ÉTAPE 2</p>
                  <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '12px' }}>ACCÈS ILLIMITÉ</p>
                  <button onClick={handlePayment} style={{ background: '#fff', color: '#000', padding: '10px', borderRadius: '6px', width: '100%', border: 'none', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}>
                    PASSER VIP
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={handleAnalyze} disabled={isAnalyzing} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', padding: '15px 30px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', opacity: isAnalyzing ? 0.5 : 1, width: '100%' }}>
              {isAnalyzing ? "ANALYSE..." : "ANALYSER LE SETUP"}
            </button>
          )}
        </div>
      </div>

      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px', overflowY: 'auto' }}>
          <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px', width: '100%', maxWidth: '380px', padding: '25px', position: 'relative', boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '16px', fontWeight: '900', textAlign: 'center', marginBottom: '20px', letterSpacing: '1px' }}>
              {authMode === 'login' ? 'CONNEXION' : 'INSCRIPTION'}
            </h2>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="email" placeholder="Email" required
                style={{ background: '#000', border: '1px solid #333', padding: '12px', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }}
                onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
              />
              <input 
                type="password" placeholder="Mot de passe" required
                style={{ background: '#000', border: '1px solid #333', padding: '12px', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }}
                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
              />

              {authMode === 'signup' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#aaa', cursor: 'pointer', padding: '4px 0' }}>
                  <input type="checkbox" required onChange={(e) => setAuthForm({...authForm, confirmEmail: e.target.checked})} />
                  Je confirme que mon email est correct
                </label>
              )}

              <button type="submit" disabled={isAuthLoading} style={{ background: '#fff', color: '#000', padding: '12px', borderRadius: '8px', fontWeight: 'bold', border: 'none', marginTop: '8px', cursor: 'pointer', opacity: isAuthLoading ? 0.7 : 1 }}>
                {isAuthLoading ? 'Chargement...' : authMode === 'login' ? 'Se connecter' : 'Créer mon compte'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '11px', marginTop: '15px', color: '#666' }}>
              {authMode === 'login' ? "Pas de compte ?" : "Déjà un compte ?"} 
              <span 
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                style={{ color: '#fff', marginLeft: '5px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {authMode === 'login' ? "S'inscrire" : "Se connecter"}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchableSelect({ label, data, onSelect, icon }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const filtered = query === '' ? data : data.filter(item => item.nom.toLowerCase().includes(query.toLowerCase()));
  return (
    <div style={{ position: 'relative' }}>
      {isOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 150 }} onClick={() => setIsOpen(false)} />}
      <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', position: 'relative', zIndex: 160 }} onClick={() => setIsOpen(!isOpen)}>
        <div style={{ color: '#fff', opacity: 0.2 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', margin: 0, opacity: 0.5 }}>{label}</p>
          <input style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontWeight: 'bold', fontSize: '12px', width: '100%', cursor: 'pointer' }} placeholder="Choisir..." value={query} onClick={(e) => { e.stopPropagation(); setQuery(''); setIsOpen(true); }} onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)} />
        </div>
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', maxHeight: '180px', overflowY: 'auto', zIndex: 200, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          {filtered.length > 0 ? filtered.map(item => (
            <div key={item.id} style={{ padding: '10px 12px', borderBottom: '1px solid #1a1a1a', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} onClick={(e) => { e.stopPropagation(); onSelect(item); setQuery(`${item.nom} (${item.prix}€)`); setIsOpen(false); }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fff' }}>{item.nom}</span>
                <span style={{ color: '#22c55e', fontWeight: 'bold', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>{item.prix}€</span>
              </div>
            </div>
          )) : <div style={{ padding: '12px', fontSize: '12px', color: '#666', textAlign: 'center' }}>Aucun résultat</div>}
        </div>
      )}
    </div>
  );
}
