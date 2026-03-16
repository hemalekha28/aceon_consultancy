import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Image from '../components/Image';
import { formatPrice } from '../utils/helpers';
import { constructImageUrl } from '../utils/imageUtils';
import { useCart } from '../context/cartContext';
import { useNotification } from '../context/notificationContext';
import { useAuth } from '../context/useAuth';

/* ─── Inline styles / design tokens ─────────────────────────────────── */
const S = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 20% 20%, #1a0a3e 0%, #0a0a2e 40%, #070718 100%)',
    fontFamily: '"DM Sans", sans-serif',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'fixed', top: '-120px', left: '-80px',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,92,252,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'fixed', bottom: '-100px', right: '-60px',
    width: '350px', height: '350px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(79,172,254,0.14) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  blob3: {
    position: 'fixed', top: '40%', right: '15%',
    width: '200px', height: '200px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,92,252,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  glass: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    backdropFilter: 'blur(16px)',
    borderRadius: '16px',
  },
  glassSelected: {
    background: 'rgba(124,92,252,0.18)',
    border: '1.5px solid rgba(124,92,252,0.7)',
    backdropFilter: 'blur(16px)',
    borderRadius: '16px',
    boxShadow: '0 0 20px rgba(124,92,252,0.25)',
  },
  h1: { fontFamily: '"Sora", sans-serif', fontWeight: 800 },
  h2: { fontFamily: '"Sora", sans-serif', fontWeight: 700 },
  accent: '#7C5CFC',
  blue: '#4FACFE',
  muted: 'rgba(255,255,255,0.6)',
  pill: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '6px 16px', borderRadius: '999px',
    background: 'rgba(124,92,252,0.18)',
    border: '1px solid rgba(124,92,252,0.4)',
    fontSize: '12px', fontWeight: 700,
    color: '#b8a0fc', letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
};

const fadeUp = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes barFill {
  from { width: 0%; }
  to   { width: 100%; }
}
@keyframes pulsePurple {
  0%, 100% { box-shadow: 0 0 0 0 rgba(124,92,252,0.4); }
  50%       { box-shadow: 0 0 0 16px rgba(124,92,252,0); }
}
.sq-fade { animation: fadeUp 0.45s ease both; }
.sq-delay-1 { animation-delay: 0.1s; }
.sq-delay-2 { animation-delay: 0.2s; }
.sq-delay-3 { animation-delay: 0.3s; }
.sq-delay-4 { animation-delay: 0.4s; }
`;

const QUESTIONS = [
  {
    key: 'position',
    title: "What's your primary sleep position?",
    options: [
      { id: 'side',    label: 'Side',        icon: '😴', desc: 'Hip & shoulder relief' },
      { id: 'back',    label: 'Back',        icon: '😌', desc: 'Spinal alignment' },
      { id: 'stomach', label: 'Stomach',     icon: '😪', desc: 'Core support' },
      { id: 'combo',   label: 'Combination', icon: '🔄', desc: 'Toss & turn at night' },
    ],
  },
  {
    key: 'weight',
    title: 'How would you describe your body weight?',
    options: [
      { id: 'light',   label: 'Light',   icon: '🌸', desc: 'Under 60 kg' },
      { id: 'average', label: 'Average', icon: '💪', desc: '60 – 105 kg' },
      { id: 'heavy',   label: 'Heavy',   icon: '🏋️', desc: 'Above 105 kg' },
    ],
  },
  {
    key: 'partner',
    title: 'Do you sleep with a partner?',
    options: [
      { id: 'yes', label: 'Yes', icon: '👫', desc: 'Motion isolation matters' },
      { id: 'no',  label: 'No',  icon: '🛏️', desc: 'Sleep alone' },
    ],
  },
  {
    key: 'firmness',
    title: 'How do you prefer your mattress firmness?',
    options: [
      { id: 'soft',     label: 'Soft',     icon: '☁️',  desc: 'Sink-in & plush' },
      { id: 'medium',   label: 'Medium',   icon: '🌙',  desc: 'Balanced feel' },
      { id: 'firm',     label: 'Firm',     icon: '🪨',  desc: 'Solid support' },
      { id: 'not-sure', label: 'Not Sure', icon: '🤷',  desc: 'Help me decide' },
    ],
  },
  {
    key: 'pain',
    title: 'Do you experience any of these?',
    options: [
      { id: 'back',     label: 'Back Pain',     icon: '🔵', desc: 'Lower or upper back' },
      { id: 'hip',      label: 'Hip Pain',      icon: '🟣', desc: 'Hip joint discomfort' },
      { id: 'shoulder', label: 'Shoulder Pain', icon: '🟡', desc: 'Shoulder pressure' },
      { id: 'none',     label: 'None',          icon: '✅', desc: 'No chronic pain' },
    ],
  },
  {
    key: 'budget',
    title: "What's your budget range?",
    options: [
      { id: 'budget',  label: 'Budget',  icon: '💰', desc: 'Under ₹15,000' },
      { id: 'mid',     label: 'Mid',     icon: '💳', desc: '₹15,000 – ₹35,000' },
      { id: 'premium', label: 'Premium', icon: '💎', desc: '₹35,000 – ₹70,000' },
      { id: 'luxury',  label: 'Luxury',  icon: '👑', desc: '₹70,000+' },
    ],
  },
];

/* ─── Scoring Engine ─────────────────────────────────────────────── */
function scoreProducts(products, answers) {
  const scored = products.map(p => {
    let score = 0;
    const reasons = [];
    const name = p.name.toLowerCase();
    const cat  = (p.category || '').toLowerCase();
    const price = p.price;

    // Budget (INR)
    if (answers.budget === 'budget'  && price < 15000)                     score += 30;
    else if (answers.budget === 'mid'     && price >= 15000 && price <= 35000) score += 30;
    else if (answers.budget === 'premium' && price > 35000 && price <= 70000)  score += 30;
    else if (answers.budget === 'luxury'  && price > 70000)                    score += 30;
    else score -= 8;

    // Sleep position
    if (answers.position === 'side') {
      if (cat.includes('foam') || cat.includes('softy') || name.includes('soft') || name.includes('foam')) {
        score += 25; reasons.push('Soft foam cushions shoulders & hips for side sleepers');
      } else if (cat === 'latex' || name.includes('latex')) {
        score += 20; reasons.push('Latex provides responsive pressure relief for side sleepers');
      }
    }
    if (answers.position === 'back' || answers.position === 'stomach') {
      if (cat === 'coir' || name.includes('firm') || name.includes('ortho')) {
        score += 25; reasons.push('Firm support maintains spinal alignment');
      } else if (cat === 'spring' || name.includes('spring')) {
        score += 20; reasons.push('Innerspring provides sturdy back support');
      }
    }
    if (answers.position === 'combo') {
      if (cat === 'latex' || cat === 'spring') {
        score += 22; reasons.push('Responsive material adapts to changing positions');
      }
    }

    // Weight
    if (answers.weight === 'heavy') {
      if (cat === 'coir' || cat === 'spring' || name.includes('firm') || name.includes('ortho')) {
        score += 18; reasons.push('Reinforced support handles higher weight without sag');
      }
    } else if (answers.weight === 'light') {
      if (cat.includes('foam') || cat.includes('softy') || cat === 'latex') {
        score += 18; reasons.push('Plush layers contour perfectly to lighter frames');
      }
    }

    // Partner (motion isolation)
    if (answers.partner === 'yes') {
      if (cat.includes('foam') || cat.includes('softy') || cat === 'latex') {
        score += 12; reasons.push('Excellent motion isolation — won\'t disturb your partner');
      }
    }

    // Firmness preference
    if (answers.firmness === 'soft') {
      if (cat.includes('foam') || cat.includes('softy') || name.includes('soft')) {
        score += 20; reasons.push('Cloud-like softness matches your comfort preference');
      }
    } else if (answers.firmness === 'firm') {
      if (cat === 'coir' || name.includes('firm') || name.includes('ortho')) {
        score += 20; reasons.push('Solid firmness level matches your preference');
      }
    } else if (answers.firmness === 'medium') {
      if (cat === 'latex' || cat === 'spring') {
        score += 18; reasons.push('Balanced medium feel — not too soft, not too firm');
      }
    }

    // Pain
    if (answers.pain === 'back') {
      if (name.includes('ortho') || name.includes('orthopedic')) {
        score += 30; reasons.push('Orthopedic design specifically targets back pain relief');
      } else if (cat === 'coir' || name.includes('firm')) {
        score += 14; reasons.push('Firm base reduces lower back strain');
      }
    }
    if (answers.pain === 'hip' || answers.pain === 'shoulder') {
      if (cat.includes('foam') || cat.includes('softy') || cat === 'latex') {
        score += 22; reasons.push('Pressure-relieving layers cushion joints and reduce pain');
      }
    }

    // Rating bonus
    if (p.rating) score += p.rating * 2;

    return { ...p, rawScore: score, reasons: reasons.slice(0, 3) };
  });

  const sorted = scored.sort((a, b) => b.rawScore - a.rawScore);
  const maxS = sorted[0]?.rawScore || 1;
  const minS = sorted[sorted.length - 1]?.rawScore || 0;
  const range = maxS - minS || 1;

  return sorted.map(p => ({
    ...p,
    matchScore: Math.min(97, Math.max(73, 78 + ((p.rawScore - minS) / range) * 19)),
  }));
}

/* ─── Component ──────────────────────────────────────────────────── */
export default function SleepQuiz() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showSuccess } = useNotification();
  const { user } = useAuth();

  const [step, setStep]         = useState(0);
  const [answers, setAnswers]   = useState({});
  const [products, setProducts] = useState([]);
  const [results, setResults]   = useState([]);
  const [addedIds, setAddedIds] = useState([]);

  useEffect(() => {
    api.getProducts().then(setProducts).catch(console.error);
  }, []);

  const currentQ  = QUESTIONS[step - 1];
  const selected  = currentQ ? answers[currentQ.key] : null;
  const totalSteps = QUESTIONS.length;

  const choose = (key, id) => setAnswers(prev => ({ ...prev, [key]: id }));

  const goNext = () => {
    if (step < totalSteps) { setStep(s => s + 1); }
    else {
      setStep(totalSteps + 1); // processing
      setTimeout(() => {
        const scored = scoreProducts(products, answers);
        const top3 = scored.slice(0, 3);
        setResults(top3);
        setStep(totalSteps + 2); // results

        // Save results to backend for analytics
        if (top3.length > 0) {
          api.saveQuizResults({
            answers,
            recommendedProductId: top3[0]._id,
            userId: user?._id
          }).catch(err => console.error("Error saving quiz results:", err));
        }
      }, 2400);
    }
  };

  const restart = () => {
    setStep(0); setAnswers({}); setResults([]); setAddedIds([]);
  };

  /* ── Layout wrapper ── */
  return (
    <div style={S.page}>
      <style>{fadeUp}</style>
      {/* Background blobs */}
      <div style={S.blob1} />
      <div style={S.blob2} />
      <div style={S.blob3} />

      {/* Header bar */}
      {step > 0 && step <= totalSteps + 2 && (
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
          <button
            onClick={() => step <= 1 ? navigate('/') : step === totalSteps + 2 ? restart() : setStep(s => s - 1)}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '8px 14px', color: '#fff', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600 }}
          >
            ← {step === totalSteps + 2 ? 'Retake' : 'Back'}
          </button>

          {step >= 1 && step <= totalSteps && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: S.muted, fontSize: '12px', fontFamily: '"DM Sans", sans-serif' }}>{step} / {totalSteps}</span>
              <div style={{ width: '140px', height: '4px', borderRadius: '999px', background: 'rgba(255,255,255,0.12)' }}>
                <div style={{ height: '100%', borderRadius: '999px', background: `linear-gradient(90deg, ${S.accent}, ${S.blue})`, width: `${(step / totalSteps) * 100}%`, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          )}

          {step === totalSteps + 2 && (
            <div style={S.pill}>✨ AI Results</div>
          )}

          <div style={{ width: '80px' }} />
        </div>
      )}

      {/* Content area */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: step === totalSteps + 2 ? '860px' : '480px', margin: '0 auto', padding: '0 20px 60px' }}>

        {/* ── LANDING ── */}
        {step === 0 && <Landing onStart={() => setStep(1)} />}

        {/* ── QUESTIONS ── */}
        {step >= 1 && step <= totalSteps && (
          <QuestionScreen
            q={currentQ}
            selected={answers[currentQ.key]}
            onChoose={(id) => choose(currentQ.key, id)}
            onNext={goNext}
          />
        )}

        {/* ── PROCESSING ── */}
        {step === totalSteps + 1 && <Processing count={products.length} />}

        {/* ── RESULTS ── */}
        {step === totalSteps + 2 && (
          <ResultsScreen results={results} navigate={navigate} addToCart={addToCart} showSuccess={showSuccess} addedIds={addedIds} setAddedIds={setAddedIds} onRetake={restart} />
        )}
      </div>
    </div>
  );
}

/* ─── LANDING SCREEN ─────────────────────────────────────────────── */
function Landing({ onStart }) {
  const features = [
    { icon: '🎯', label: 'AI-Powered Match', desc: 'Our algorithm scores every mattress against your sleep profile.' },
    { icon: '🛡️', label: '6 Quick Questions', desc: 'Less than 60 seconds to complete.' },
    { icon: '🏆', label: 'Personalized Results', desc: 'See match %, why it fits you, and alternatives.' },
  ];
  return (
    <div style={{ textAlign: 'center', paddingTop: '60px' }} className="sq-fade">
      {/* App icon */}
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '88px', height: '88px', borderRadius: '22px', background: 'linear-gradient(135deg, #7C5CFC, #4FACFE)', boxShadow: '0 0 40px rgba(124,92,252,0.5)', marginBottom: '28px', animation: 'pulsePurple 3s ease-in-out infinite' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L14 2Z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
        </svg>
      </div>

      <h1 style={{ ...S.h1, fontSize: '36px', margin: '0 0 12px', letterSpacing: '-0.5px' }}>AI Sleep Advisor</h1>
      <p style={{ color: S.muted, fontSize: '16px', margin: '0 0 40px', lineHeight: 1.6 }}>
        Answer 6 questions. Get a mattress<br />matched to your body.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
        {features.map((f, i) => (
          <div key={i} className={`sq-fade sq-delay-${i + 1}`} style={{ ...S.glass, padding: '16px 20px', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <span style={{ fontSize: '22px', flexShrink: 0 }}>{f.icon}</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', fontFamily: '"Sora", sans-serif' }}>{f.label}</p>
              <p style={{ margin: '4px 0 0', color: S.muted, fontSize: '13px', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        style={{ width: '100%', padding: '17px', borderRadius: '999px', border: 'none', background: '#fff', color: '#3d1fa8', fontFamily: '"Sora", sans-serif', fontWeight: 700, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 24px rgba(124,92,252,0.3)' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,92,252,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(124,92,252,0.3)'; }}
      >
        Start the Quiz <span style={{ fontSize: '18px' }}>→</span>
      </button>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '14px' }}>No sign-up required · Free</p>
    </div>
  );
}

/* ─── QUESTION SCREEN ────────────────────────────────────────────── */
function QuestionScreen({ q, selected, onChoose, onNext }) {
  const cols = q.options.length <= 2 ? 1 : 2;
  return (
    <div style={{ paddingTop: '20px' }} className="sq-fade">
      <h2 style={{ ...S.h2, fontSize: '26px', textAlign: 'center', marginBottom: '32px', lineHeight: 1.3 }}>
        {q.title}
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '12px', marginBottom: '32px' }}>
        {q.options.map((opt, i) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChoose(opt.id)}
              className={`sq-fade sq-delay-${Math.min(i + 1, 4)}`}
              style={{
                ...(isSelected ? S.glassSelected : S.glass),
                padding: '18px 16px',
                cursor: 'pointer',
                textAlign: 'center',
                border: isSelected ? '1.5px solid rgba(124,92,252,0.7)' : '1px solid rgba(255,255,255,0.12)',
                transition: 'all 0.2s ease',
                transform: isSelected ? 'scale(1.03)' : 'scale(1)',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            >
              <div style={{ fontSize: '30px', marginBottom: '8px' }}>{opt.icon}</div>
              <div style={{ fontFamily: '"Sora", sans-serif', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{opt.label}</div>
              <div style={{ color: S.muted, fontSize: '12px' }}>{opt.desc}</div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!selected}
        style={{
          width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
          background: selected ? `linear-gradient(135deg, ${S.accent}, ${S.blue})` : 'rgba(255,255,255,0.1)',
          color: selected ? '#fff' : 'rgba(255,255,255,0.35)',
          fontFamily: '"Sora", sans-serif', fontWeight: 700, fontSize: '15px',
          cursor: selected ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s ease',
          boxShadow: selected ? '0 4px 20px rgba(124,92,252,0.4)' : 'none',
        }}
      >
        Next →
      </button>
    </div>
  );
}

/* ─── PROCESSING SCREEN ──────────────────────────────────────────── */
function Processing({ count }) {
  const steps = ['Analyzing sleep position…', 'Calculating support needs…', `Scoring ${count} mattresses…`, 'Generating your matches…'];
  return (
    <div style={{ textAlign: 'center', paddingTop: '80px' }} className="sq-fade">
      {/* Spinner ring */}
      <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 36px' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,92,252,0.25) 0%, transparent 70%)', animation: 'pulsePurple 2s ease-in-out infinite' }} />
        <svg style={{ animation: 'spin 1.2s linear infinite', position: 'relative', zIndex: 1 }} width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
          <circle cx="48" cy="48" r="40" fill="none" stroke="url(#g)" strokeWidth="5" strokeLinecap="round" strokeDasharray="60 190" />
          <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7C5CFC"/><stop offset="100%" stopColor="#4FACFE"/></linearGradient></defs>
        </svg>
      </div>

      <h2 style={{ ...S.h2, fontSize: '22px', marginBottom: '10px' }}>Analyzing your sleep profile…</h2>
      <p style={{ color: S.muted, fontSize: '14px', marginBottom: '36px' }}>Our algorithm is finding your perfect matches</p>

      <div style={{ ...S.glass, padding: '20px 24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: S.muted, fontSize: '13px' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C5CFC, #4FACFE)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5.5L4 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
            </div>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── RESULTS SCREEN ─────────────────────────────────────────────── */
function ResultsScreen({ results, navigate, addToCart, showSuccess, addedIds, setAddedIds, onRetake }) {
  if (!results.length) return null;
  return (
    <div style={{ paddingTop: '10px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }} className="sq-fade">
        <div style={S.pill}>✨ Your Top Matches</div>
        <h1 style={{ ...S.h1, fontSize: '32px', margin: '16px 0 8px' }}>Your Perfect Sleep Matches</h1>
        <p style={{ color: S.muted, fontSize: '15px' }}>Ranked by compatibility with your sleep profile</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {results.map((p, i) => (
          <ResultCard
            key={p._id}
            product={p}
            rank={i}
            added={addedIds.includes(p._id)}
            onAdd={() => {
              addToCart(p);
              setAddedIds(prev => [...prev, p._id]);
              showSuccess(`${p.name} added to cart! 🎉`);
            }}
            onView={() => navigate(`/product/${p._id}`)}
          />
        ))}
      </div>

      {/* Retake CTA */}
      <div className="sq-fade" style={{ ...S.glass, padding: '32px 24px', textAlign: 'center', borderRadius: '20px' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌙</div>
        <h3 style={{ ...S.h2, fontSize: '18px', margin: '0 0 8px' }}>Not sure about these?</h3>
        <p style={{ color: S.muted, fontSize: '14px', margin: '0 0 20px' }}>Retake the quiz with different answers for new results.</p>
        <button
          onClick={onRetake}
          style={{ padding: '12px 28px', borderRadius: '999px', border: '1.5px solid rgba(124,92,252,0.5)', background: 'rgba(124,92,252,0.15)', color: '#b8a0fc', fontFamily: '"Sora", sans-serif', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,92,252,0.28)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,92,252,0.15)'}
        >
          ↺ Retake Quiz
        </button>
      </div>
    </div>
  );
}

/* ─── RESULT CARD ────────────────────────────────────────────────── */
function ResultCard({ product, rank, added, onAdd, onView }) {
  const score = product.matchScore;
  const medals = ['🥇', '🥈', '🥉'];
  const rankLabels = ['Best Match', 'Runner Up', 'Also Great'];
  const barColor = score >= 90 ? '#22c55e' : score >= 82 ? '#3b82f6' : '#a855f7';

  return (
    <div
      className={`sq-fade sq-delay-${rank + 1}`}
      style={{ ...S.glass, borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.25s, box-shadow 0.25s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(124,92,252,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Top strip */}
      <div style={{ background: rank === 0 ? 'linear-gradient(90deg, #7C5CFC, #4FACFE)' : 'rgba(255,255,255,0.06)', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: '"Sora", sans-serif', color: rank === 0 ? '#fff' : S.muted }}>
          {medals[rank]} {rankLabels[rank]}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: '"Sora", sans-serif', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '999px', color: '#fff' }}>
          {score.toFixed(0)}% Match
        </span>
      </div>

      {/* Product image */}
      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '160px' }}>
        <Image src={constructImageUrl(product.image)} alt={product.name} style={{ maxHeight: '130px', maxWidth: '100%', objectFit: 'contain' }} />
      </div>

      {/* Details */}
      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {product.category && (
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9a7bfc', background: 'rgba(124,92,252,0.15)', padding: '3px 10px', borderRadius: '6px', width: 'fit-content' }}>
            {product.category}
          </span>
        )}

        <h4 style={{ ...S.h2, fontSize: '16px', margin: 0, lineHeight: 1.3 }}>{product.name}</h4>

        {/* Match bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: S.muted }}>Match Score</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: barColor }}>{score.toFixed(0)}%</span>
          </div>
          <div style={{ height: '5px', borderRadius: '999px', background: 'rgba(255,255,255,0.1)' }}>
            <div style={{ height: '100%', borderRadius: '999px', background: `linear-gradient(90deg, ${barColor}, ${barColor}aa)`, width: `${score}%`, transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* Reasons */}
        {product.reasons && product.reasons.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {product.reasons.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: S.muted, lineHeight: 1.5 }}>
                <span style={{ color: '#7C5CFC', flexShrink: 0, marginTop: '1px' }}>✓</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, fontFamily: '"Sora", sans-serif' }}>{formatPrice(product.price)}</p>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#4ade80' }}>✓ In Stock · Free Delivery</p>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          <button
            onClick={onView}
            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.18)', background: 'transparent', color: '#fff', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            View →
          </button>
          <button
            onClick={onAdd}
            style={{ flex: 2, padding: '10px', borderRadius: '10px', background: added ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg, #7C5CFC, #4FACFE)', color: '#fff', fontFamily: '"Sora", sans-serif', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'opacity 0.2s', border: added ? '1px solid rgba(34,197,94,0.5)' : 'none' }}
            onMouseEnter={e => { if (!added) e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {added ? '✓ Added!' : '🛒 Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
