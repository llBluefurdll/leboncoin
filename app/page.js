"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Cpu, MemoryStick, HardDrive, Layout, Wind, Power, Activity, Lock, User, CheckCircle2, X } from 'lucide-react';

export default function HwCoreAnalyzer() {
  const [composants, setComposants] = useState([]);
  const [user, setUser] = useState(null);
  const [isVip, setIsVip] = useState(false);
  const [freeAnalysesLeft, setFreeAnalysesLeft] = useState(0); 
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // États pour la modale d'authentification pro
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' ou 'signup'
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
        const { data: profile } = await supabase.from('profiles').select('is_vip').eq('id', user.id).single();
        if (profile?.is_vip) setIsVip(true);
      }
      
      await checkIpUsage();
      const { data } = await supabase.from('composants').select('*');
      if (data) setComposants(data);
      setIsLoadingStatus(false);
    };
    initApp();
  }, []);

  const checkIpUsage = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const { ip } = await res.json();
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase.from('usage_logs').select('id').eq('ip_address', ip).eq('created_at', today);
      setFreeAnalysesLeft(!data || data.length === 0 ? 1 : 0);
    } catch (e) {
      setFreeAnalysesLeft(0);
    }
  };

  const handlePayment = () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    // MISE À JOUR : Nouveau lien Stripe à 9.99€
    const stripeUrl = "https://buy.stripe.com/5kA3cv2MGaCR8DdeUX"; 
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
    if (isVip) { runAnalysis(); return; }
    if (freeAnalysesLeft <= 0) return;

    setIsAnalyzing(true);
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipRes.json();
      runAnalysis();
      await supabase.from('usage_logs').insert([{ ip_address: ip }]);
      setFreeAnalysesLeft(0);
    } catch (err) { 
      runAnalysis(); 
    }
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #000 0%, #1a1a1a 100%)', color: '#fff', fontFamily: 'sans-serif', padding: '40px 20px 250px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '900px' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase' }}>HWCORE ANALYZER</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            {user ? (
              <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff', padding: '8px 15px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={14}/> {user.email.split('@')[0].toUpperCase()} (LOGOUT)
              </button>
            ) : (
              <>
                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} style={{ background: 'transparent', border: '1px solid #333', color: '#fff', padding: '8px 15px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                  CONNEXION
                </button>
                <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} style={{ background: '#fff', color: '#000', border: 'none', padding: '8px 15px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                  S'INSCRIRE
                </button>
              </>
            )}
            <div style={{ background: isVip ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.03)', padding: '8px 15px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={14} color={isVip ? "#22c55e" : "#fff"}/> 
              {isLoadingStatus ? "VÉRIF..." : isVip ? "VIP UNLIMITED" : `ESSAI : ${freeAnalysesLeft}/1`}
            </div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '30px' }}>
          {selecteurs.map(s => (
            <SearchableSelect key={s.key} label={s.label} icon={s.icon} data={composants.filter(c => c.categorie === s.key)} onSelect={(v) => { setSelection({...selection, [s.key]: v}); setResults({...results, show: false}); }} />
          ))}
        </div>

        <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '30px', textAlign: 'center', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 'bold', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '10px' }}>Investissement</p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
              <input type="number" style={{ background: 'transparent', border: '1px solid #3a3a3a', borderRadius: '8px', color: '#fff', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', width: '120px', padding: '8px' }} placeholder="0" onChange={(e) => { setPrixAchat(Number(e.target.value)); setResults({...results, show: false}); }} />
              <span style={{ fontSize: '18px', fontWeight: 'bold', opacity: 0.5 }}>EUR</span>
            </div>
          </div>

          {isLoadingStatus ? (
             <button style={{ background: '#111', color: '#444', padding: '15px 50px', borderRadius: '8px', border: '1px solid #222', cursor: 'wait' }}>CHARGEMENT...</button>
          ) : results.show ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #333', padding: '30px', borderRadius: '16px', width: '100%', animation: 'fadeIn 0.5s ease' }}>
                <p style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '2px', marginBottom: '10px' }}>ESTIMATION DE REVENTE</p>
                <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#22c55e', margin: 0 }}>{results.revente}€</h2>
                <div style={{ marginTop: '15px', padding: '10px', background: results.benefice >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', display: 'inline-block' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: results.benefice >= 0 ? '#22c55e' : '#ef4444' }}>
                        Bénéfice : {results.benefice}€
                    </p>
                </div>
                {!isVip && (
                    <p style={{ fontSize: '11px', color: '#666', marginTop: '20px' }}>
                        C'était votre essai gratuit. Pour d'autres analyses, passez VIP.
                    </p>
                )}
            </div>
          ) : (!isVip && freeAnalysesLeft === 0) ? (
            <div style={{ border: '1px solid #22c55e33', background: 'rgba(0,0,0,0.3)', padding: '30px', borderRadius: '16px', width: '100%', animation: 'slideUp 0.3s ease', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Lock size={18} color="#22c55e"/>
                <p style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '1px' }}>ACCÈS LIMITÉ — PASSEZ AU VIP</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ background: user ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.03)', border: '1px solid #222', padding: '20px', borderRadius: '12px', textAlign: 'left', position: 'relative' }}>
                  {user && <CheckCircle2 size={16} color="#22c55e" style={{ position: 'absolute', top: '10px', right: '10px' }}/>}
                  <p style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>ÉTAPE 1</p>
                  <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '15px' }}>{user ? "COMPTE CRÉÉ" : "CRÉER UN COMPTE"}</p>
                  <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} disabled={user} style={{ background: user ? 'transparent' : '#fff', color: user ? '#22c55e' : '#000', padding: '10px', borderRadius: '6px', width: '100%', border: user ? '1px solid #22c55e' : 'none', fontSize: '11px', fontWeight: 'bold', cursor: user ? 'default' : 'pointer' }}>
                    {user ? "IDENTIFIÉ ✓" : "S'INSCRIRE"}
                  </button>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid #222', padding: '20px', borderRadius: '12px', textAlign: 'left' }}>
                  <p style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>ÉTAPE 2</p>
                  <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '15px' }}>ACCÈS ILLIMITÉ</p>
                  <button onClick={handlePayment} style={{ background: '#fff', color: '#000', padding: '10px', borderRadius: '6px', width: '100%', border: 'none', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}>
                    PASSER VIP
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={handleAnalyze} disabled={isAnalyzing} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', padding: '15px 50px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', opacity: isAnalyzing ? 0.5 : 1 }}>
              {isAnalyzing ? "ANALYSE..." : "ANALYSER LE SETUP"}
            </button>
          )}
        </div>
      </div>

      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '30px', position: 'relative', animation: 'fadeIn 0.3s ease' }}>
            
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '18px', fontWeight: '900', textAlign: 'center', marginBottom: '25px', letterSpacing: '2px' }}>
              {authMode === 'login' ? 'CONNEXION' : 'INSCRIPTION'}
            </h2>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#aaa', cursor: 'pointer', padding: '5px 0' }}>
                  <input type="checkbox" required onChange={(e) => setAuthForm({...authForm, confirmEmail: e.target.checked})} />
                  Je confirme que mon email est correct
                </label>
              )}

              <button type="submit" disabled={isAuthLoading} style={{ background: '#fff', color: '#000', padding: '12px', borderRadius: '8px', fontWeight: 'bold', border: 'none', marginTop: '10px', cursor: 'pointer', opacity: isAuthLoading ? 0.7 : 1 }}>
                {isAuthLoading ? 'Chargement...' : authMode === 'login' ? 'Se connecter' : 'Créer mon compte'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '12px', marginTop: '20px', color: '#666' }}>
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
      <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', position: 'relative', zIndex: 160 }} onClick={() => setIsOpen(!isOpen)}>
        <div style={{ color: '#fff', opacity: 0.2 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', margin: 0, opacity: 0.5 }}>{label}</p>
          <input style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontWeight: 'bold', fontSize: '12px', width: '100%', cursor: 'pointer' }} placeholder="Choisir..." value={query} onClick={(e) => { e.stopPropagation(); setQuery(''); setIsOpen(true); }} onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)} />
        </div>
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', maxHeight: '220px', overflowY: 'auto', zIndex: 200, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          {filtered.length > 0 ? filtered.map(item => (
            <div key={item.id} style={{ padding: '12px 15px', borderBottom: '1px solid #1a1a1a', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} onClick={(e) => { e.stopPropagation(); onSelect(item); setQuery(`${item.nom} (${item.prix}€)`); setIsOpen(false); }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fff' }}>{item.nom}</span>
                <span style={{ color: '#22c55e', fontWeight: 'bold', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>{item.prix}€</span>
              </div>
            </div>
          )) : <div style={{ padding: '15px', fontSize: '12px', color: '#666', textAlign: 'center' }}>Aucun résultat</div>}
        </div>
      )}
    </div>
  );
}
