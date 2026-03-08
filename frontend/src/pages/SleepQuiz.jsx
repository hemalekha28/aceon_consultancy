import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiArrowLeft,
    FiArrowRight,
    FiCheck,
    FiRefreshCw,
    FiShoppingCart,
    FiInfo,
    FiZap,
    FiAward,
    FiThermometer,
    FiDollarSign,
    FiMapPin,
    FiStar,
    FiTarget,
    FiActivity,
    FiChevronRight
} from 'react-icons/fi';
import { api } from '../utils/api';
import Image from '../components/Image';
import { formatPrice } from '../utils/helpers';
import { constructImageUrl } from '../utils/imageUtils';
import { useCart } from '../context/cartContext';
import { useNotification } from '../context/notificationContext';

const SleepQuiz = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { showSuccess } = useNotification();

    const [step, setStep] = useState(0); // 0 is landing, 1-6 are questions, 7 is processing, 8 is results
    const [answers, setAnswers] = useState({
        weight: '',
        height: '',
        position: '',
        backPain: '',
        painAreas: [],
        temperature: '',
        budget: ''
    });
    const [products, setProducts] = useState([]);
    const [recommendation, setRecommendation] = useState(null);
    const [alternatives, setAlternatives] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Pre-fetch products to have them ready for matching
        const fetchProducts = async () => {
            try {
                const data = await api.getProducts();
                setProducts(data);
            } catch (err) {
                console.error('Error fetching products for quiz:', err);
            }
        };
        fetchProducts();
    }, []);

    const nextStep = () => {
        if (step < 6) {
            setStep(step + 1);
        } else {
            processResults();
        }
    };

    const prevStep = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const handleAnswer = (key, value) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
        if (key !== 'painAreas') {
            nextStep();
        }
    };

    const handlePainAreaToggle = (area) => {
        setAnswers(prev => {
            const areas = prev.painAreas.includes(area)
                ? prev.painAreas.filter(a => a !== area)
                : [...prev.painAreas, area];
            return { ...prev, painAreas: areas };
        });
    };

    const processResults = () => {
        setStep(7);
        setIsLoading(true);

        // Simulate ML processing
        setTimeout(() => {
            findMatches();
            setIsLoading(false);
            setStep(8);
        }, 2500);
    };

    const findMatches = () => {
        if (products.length === 0) return;

        // SCORING LOGIC
        // This is a simplified matching engine
        const scoredProducts = products.map(product => {
            let score = 0;
            let reasons = [];

            const price = product.price;
            const category = product.category;
            const name = product.name.toLowerCase();

            // Budget Match
            if (answers.budget === 'budget' && price < 500) score += 30;
            else if (answers.budget === 'mid' && price >= 500 && price <= 1000) score += 30;
            else if (answers.budget === 'premium' && price > 1000 && price <= 2000) score += 30;
            else if (answers.budget === 'luxury' && price > 2000) score += 30;
            else if (answers.budget === 'all') score += 20;

            // Position & Firmness Match
            if (answers.position === 'side') {
                if (name.includes('soft') || name.includes('foam')) {
                    score += 20;
                    reasons.push('Ideal pressure relief for side sleepers');
                }
            } else if (answers.position === 'back' || answers.position === 'stomach') {
                if (name.includes('firm') || name.includes('hybrid')) {
                    score += 20;
                    reasons.push('Proper spinal alignment for your position');
                }
            }

            // Weight Match
            if (answers.weight === 'heavy' && (name.includes('firm') || name.includes('hybrid'))) {
                score += 15;
                reasons.push('Reinforced support for your weight range');
            } else if (answers.weight === 'light' && (name.includes('soft') || name.includes('foam'))) {
                score += 15;
                reasons.push('Better contouring for lightweight sleepers');
            }

            // Pain Match
            if ((answers.backPain === 'frequently' || answers.backPain === 'occasionally') && name.includes('ortho')) {
                score += 25;
                reasons.push('Advanced orthopedic support for pain relief');
            }

            // Temperature Match
            if (answers.temperature === 'hot' && (name.includes('cool') || name.includes('gel') || name.includes('hybrid'))) {
                score += 20;
                reasons.push('Active cooling layers to prevent overheating');
            }

            // Normalize match score to 70-98% range for psychological effect
            const matchScore = Math.min(98, Math.max(75, 70 + (score / 120) * 28));

            return { ...product, matchScore, reasons: reasons.slice(0, 4) };
        });

        // Sort by score
        const sorted = scoredProducts.sort((a, b) => b.matchScore - a.matchScore);

        setRecommendation(sorted[0]);
        setAlternatives(sorted.slice(1, 4));
    };

    const restartQuiz = () => {
        setStep(0);
        setAnswers({
            weight: '',
            height: '',
            position: '',
            backPain: '',
            painAreas: [],
            temperature: '',
            budget: ''
        });
    };

    // UI RENDERERS

    const renderQuestion1 = () => (
        <div className="animate-slide-in">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">What's your weight?</h2>
            <p className="text-slate-500 mb-12 text-lg font-medium">This helps us suggest the right support level</p>

            <div className="grid grid-cols-1 gap-5">
                {[
                    { id: 'light', icon: '🪶', label: 'Light', range: 'Under 60 kg' },
                    { id: 'avg-light', icon: '⚖️', label: 'Average', range: '60 - 80 kg' },
                    { id: 'avg-heavy', icon: '💪', label: 'Heavy', range: '80 - 105 kg' },
                    { id: 'heavy', icon: '🏋️', label: 'Very Heavy', range: 'Over 105 kg' }
                ].map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleAnswer('weight', opt.id)}
                        className="quiz-option-btn group"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">{opt.icon}</span>
                            <div>
                                <span className="block text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{opt.label}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{opt.range}</span>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-slate-200 group-hover:border-indigo-600 flex items-center justify-center transition-all bg-slate-50">
                            <div className="w-4 h-4 rounded-full bg-indigo-600 scale-0 group-hover:scale-100 transition-transform" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderQuestion2 = () => (
        <div className="animate-slide-in">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">How tall are you?</h2>
            <p className="text-slate-500 mb-12 text-lg font-medium">Height helps match the right mattress size</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                    { id: 'short', icon: '📏', label: 'Short', range: 'Under 163 cm (5\'4\")' },
                    { id: 'avg-short', icon: '📏', label: 'Medium', range: '163-173 cm (5\'4"-5\'8\")' },
                    { id: 'avg-tall', icon: '📏', label: 'Tall', range: '173-185 cm (5\'8"-6\'1\")' },
                    { id: 'tall', icon: '📏', label: 'Very Tall', range: 'Over 185 cm (6\'1\"+)' },
                ].map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleAnswer('height', opt.id)}
                        className="quiz-option-btn group py-8 flex items-center gap-4"
                    >
                        <span className="text-4xl">{opt.icon}</span>
                        <div className="text-left">
                            <span className="block font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{opt.label}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{opt.range}</span>
                        </div>
                        <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-indigo-600 transition-colors ml-auto" />
                    </button>
                ))}
            </div>
        </div>
    );

    const renderQuestion3 = () => (
        <div className="animate-slide-in">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">How do you sleep?</h2>
            <p className="text-slate-500 mb-12 text-lg font-medium">Choose your most common sleeping position</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { id: 'side', icon: '😴', label: 'Side', subtext: 'Hip & shoulder support' },
                    { id: 'back', icon: '😌', label: 'Back', subtext: 'Lower back support' },
                    { id: 'stomach', icon: '😪', label: 'Stomach', subtext: 'Firm support' },
                    { id: 'combo', icon: '🔄', label: 'Mix of All', subtext: 'Change positions' },
                ].map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleAnswer('position', opt.id)}
                        className="quiz-option-btn group flex-col items-center gap-4 p-10 text-center"
                    >
                        <span className="text-6xl group-hover:scale-125 transition-transform">{opt.icon}</span>
                        <div>
                            <span className="block font-black text-slate-900 text-xl group-hover:text-indigo-600 transition-colors">{opt.label}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{opt.subtext}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderQuestion4 = () => (
        <div className="animate-slide-in">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Do you have back pain?</h2>
            <p className="text-slate-500 mb-12 text-lg font-medium">This helps us find a mattress with the right support</p>

            <div className="flex flex-col gap-5 mb-8">
                {[
                    { id: 'frequently', icon: '😰', label: 'Yes, often', sub: 'Pain most days of the week' },
                    { id: 'occasionally', icon: '😐', label: 'Sometimes', sub: 'Pain comes and goes' },
                    { id: 'rarely', icon: '😊', label: 'No, rarely', sub: 'I sleep comfortably' },
                ].map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleAnswer('backPain', opt.id)}
                        className={`quiz-option-btn p-8 flex items-center gap-4 ${answers.backPain === opt.id ? 'border-indigo-600 bg-indigo-50/30 shadow-lg' : ''}`}
                    >
                        <span className="text-4xl">{opt.icon}</span>
                        <div className="text-left flex-1">
                            <span className={`block text-xl font-black mb-1 ${answers.backPain === opt.id ? 'text-indigo-600' : 'text-slate-900'}`}>{opt.label}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{opt.sub}</span>
                        </div>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${answers.backPain === opt.id ? 'border-indigo-600 bg-white' : 'border-slate-100'}`}>
                            {answers.backPain === opt.id && <div className="w-4 h-4 rounded-full bg-indigo-600" />}
                        </div>
                    </button>
                ))}
            </div>

            {(answers.backPain === 'frequently' || answers.backPain === 'occasionally') && (
                <div className="mt-8 p-10 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 animate-fade-in-up">
                    <p className="font-black text-[11px] text-slate-400 uppercase tracking-widest mb-6">Where do you feel pain?</p>
                    <div className="grid grid-cols-2 gap-6">
                        {['Lower back', 'Upper back', 'Hips', 'Shoulders'].map(area => (
                            <label key={area} className="flex items-center gap-4 cursor-pointer group">
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${answers.painAreas.includes(area) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}>
                                    {answers.painAreas.includes(area) && <FiCheck className="text-white" size={14} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={answers.painAreas.includes(area)}
                                    onChange={() => handlePainAreaToggle(area)}
                                />
                                <span className={`font-bold transition-colors ${answers.painAreas.includes(area) ? 'text-indigo-600' : 'text-slate-600 group-hover:text-slate-900'}`}>{area}</span>
                            </label>
                        ))}
                    </div>
                    <button
                        onClick={nextStep}
                        className="mt-10 w-full py-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-[2rem] font-black hover:shadow-lg transition-all shadow-xl shadow-slate-200"
                    >
                        Continue →
                    </button>
                </div>
            )}
        </div>
    );
                        </div>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${answers.backPain === opt.id ? 'border-indigo-600 bg-white' : 'border-slate-100'}`}>
                            {answers.backPain === opt.id && <div className="w-4 h-4 rounded-full bg-indigo-600" />}
                        </div>
                    </button>
                ))}
            </div>

            {(answers.backPain === 'frequently' || answers.backPain === 'occasionally') && (
                <div className="mt-8 p-10 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 animate-fade-in-up">
                    <p className="font-black text-[11px] text-slate-400 uppercase tracking-widest mb-6">Where do you feel pain?</p>
                    <div className="grid grid-cols-2 gap-6">
                        {['Lower back', 'Upper back', 'Hips', 'Shoulders'].map(area => (
                            <label key={area} className="flex items-center gap-4 cursor-pointer group">
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${answers.painAreas.includes(area) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}>
                                    {answers.painAreas.includes(area) && <FiCheck className="text-white" size={14} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={answers.painAreas.includes(area)}
                                    onChange={() => handlePainAreaToggle(area)}
                                />
                                <span className={`font-bold transition-colors ${answers.painAreas.includes(area) ? 'text-indigo-600' : 'text-slate-600 group-hover:text-slate-900'}`}>{area}</span>
                            </label>
                        ))}
                    </div>
                    <button
                        onClick={nextStep}
                        className="mt-10 w-full py-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-[2rem] font-black hover:shadow-lg transition-all shadow-xl shadow-slate-200"
                    >
                        Continue
                        className="mt-10 w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
                    >
                        Secure Calibration →
                    </button>
                </div>
            )}
        </div>
    );

    const renderQuestion5 = () => (
        <div className="animate-slide-in">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Do you sleep hot or cold?</h2>
            <p className="text-slate-500 mb-12 text-lg font-medium">This affects the mattress cooling technology we recommend</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                    { id: 'hot', icon: '🔥', label: 'Sleep Hot', sub: 'Always too warm' },
                    { id: 'warm', icon: '🌡️', label: 'Warm Sometimes', sub: 'Occasionally warm' },
                    { id: 'cool', icon: '❄️', label: 'Sleep Cool', sub: 'Comfortable temp' },
                    { id: 'cold', icon: '🧊', label: 'Sleep Cold', sub: 'Always too cold' },
                ].map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleAnswer('temperature', opt.id)}
                        className="quiz-option-btn group p-10 flex-col items-center gap-4 text-center"
                    >
                        <span className="text-6xl mb-2 group-hover:scale-125 transition-transform">{opt.icon}</span>
                        <div>
                            <span className="block font-black text-xl text-slate-800 group-hover:text-indigo-600 transition-colors">{opt.label}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{opt.sub}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderQuestion6 = () => (
        <div className="animate-slide-in">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">What's your budget?</h2>
            <p className="text-slate-500 mb-12 text-lg font-medium">Choose a price range that works for you</p>

            <div className="flex flex-col gap-5">
                {[
                    { id: 'budget', icon: '💵', label: 'Budget-Friendly', price: '< ₹25,000' },
                    { id: 'mid', icon: '💰', label: 'Mid-Range', price: '₹25,000 - ₹50,000' },
                    { id: 'premium', icon: '💎', label: 'Premium', price: '₹50,000 - ₹1,00,000' },
                    { id: 'luxury', icon: '👑', label: 'Luxury', price: '> ₹1,00,000' },
                    { id: 'all', icon: '📋', label: 'Show All', price: 'All prices' },
                ].map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleAnswer('budget', opt.id)}
                        className="quiz-option-btn group p-8 flex items-center gap-4"
                    >
                        <span className="text-4xl">{opt.icon}</span>
                        <div className="flex flex-col text-left flex-1">
                            <span className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{opt.label}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{opt.price}</span>
                        </div>
                        <FiArrowRight size={24} className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all" />
                    </button>
                ))}
            </div>
        </div>
    );

    const renderResults = () => {
        if (!recommendation) return null;

        return (
            <div className="animate-fade-in results-premium">
                <div className="text-center mb-16">
                    <div className="badge-exclusive mx-auto mb-6">Your Best Match</div>
                    <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">We found the perfect mattress for you</h1>
                    <p className="text-slate-500 font-medium text-lg">Based on your sleep profile and comfort needs.</p>
                </div>

                {/* Primary Recommendation */}
                <div className="max-w-4xl mx-auto bg-white rounded-[2rem] overflow-hidden shadow-[0_50px_100px_rgba(74,144,226,0.08)] border border-slate-100 mb-24 hover:translate-y-[-10px] transition-all duration-700 group">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-3 px-8 flex justify-between items-center text-white">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">🏆 Your Best Pick</span>
                        <div className="flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-xs font-black backdrop-blur-md">
                            <FiTarget size={14} />
                            {recommendation.matchScore.toFixed(0)}% Match
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-10 md:p-14 bg-slate-50/50 flex items-center justify-center border-r border-slate-50">
                            <div className="relative w-full aspect-[4/3] transform group-hover:scale-110 transition-transform duration-1000">
                                <Image
                                    src={constructImageUrl(recommendation.image)}
                                    alt={recommendation.name}
                                    className="w-full h-full object-contain filter drop-shadow-2xl"
                                />
                            </div>
                        </div>

                        <div className="p-10 md:p-14 flex flex-col justify-center">
                            <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight tracking-tighter">{recommendation.name}</h2>

                            <div className="mb-8">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-black text-blue-500 uppercase tracking-widest">{recommendation.matchScore.toFixed(0)}% Match</span>
                                    <span className="text-[10px] font-bold text-slate-400">Great Fit</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{ width: `${recommendation.matchScore}%` }} />
                                </div>
                            </div>

                            <div className="space-y-4 mb-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    Why it's perfect for you:
                                </p>
                                {recommendation.reasons.map((reason, i) => (
                                    <div key={i} className="flex gap-3 text-slate-700 items-start">
                                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <FiCheck className="text-emerald-500" size={12} />
                                        </div>
                                        <span className="font-bold text-sm leading-relaxed">{reason}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                                <div className="flex flex-col">
                                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{formatPrice(recommendation.price)}</span>
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">In Stock & Ready</span>
                                </div>
                                <button
                                    onClick={() => {
                                        addToCart(recommendation);
                                        showSuccess('Perfect match added to your cart');
                                    }}
                                    className="px-8 py-4 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 flex items-center gap-3"
                                >
                                    <FiShoppingCart /> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alternatives */}
                <div className="max-w-6xl mx-auto mb-24">
                    <h3 className="text-2xl font-black text-slate-900 mb-10 text-center tracking-tight">Other Good Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {alternatives.map(alt => (
                            <div key={alt._id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl hover:shadow-2xl transition-all group flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{alt.matchScore.toFixed(0)}% MATCH</span>
                                        <div className="h-1 w-16 bg-slate-100 rounded-full mt-1">
                                            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${alt.matchScore}%` }} />
                                        </div>
                                    </div>
                                    <FiTarget className="text-blue-200" size={20} />
                                </div>
                                <div className="w-full aspect-square mb-8 transform-gpu group-hover:scale-110 transition-transform duration-700">
                                    <Image src={constructImageUrl(alt.image)} alt={alt.name} className="w-full h-full object-contain filter drop-shadow-lg" />
                                </div>
                                <h4 className="font-black text-lg text-slate-900 mb-1 truncate">{alt.name}</h4>
                                <span className="font-black text-slate-400 mb-6 text-sm">{formatPrice(alt.price)}</span>
                                <button
                                    onClick={() => navigate(`/product/${alt._id}`)}
                                    className="mt-auto w-full py-4 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                                >
                                    View Specs <FiArrowRight />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center">
                    <button
                        onClick={restartQuiz}
                        className="inline-flex items-center gap-3 px-10 py-4 text-slate-400 font-bold hover:text-blue-600 transition-all"
                    >
                        <FiRefreshCw /> Take the Quiz Again
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="sleep-quiz-premium-root min-h-screen pt-24 pb-20">
            {/* Load Font specifically for Quiz */}
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

            <div className="container mx-auto px-4 max-w-5xl relative z-10">
                {step > 0 && step < 7 && (
                    <div className="mb-10 flex justify-center">
                        <button
                            onClick={prevStep}
                            className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-[0.2em] hover:text-indigo-600 transition group"
                        >
                            <FiArrowLeft className="group-hover:-translate-x-1.5 transition-transform" />
                            Back
                        </button>
                    </div>
                )}

                <div className="quiz-card-wrapper max-w-5xl mx-auto">
                    {step === 0 && (
                        <div className="landing-premium text-center py-20 px-8 glass-card rounded-[2rem]">
                            <div className="flex justify-center mb-10">
                                <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-[2rem] flex items-center justify-center shadow-inner">
                                    <FiZap size={48} />
                                </div>
                            </div>
                            <h1 className="quiz-title mb-6">
                                Find Your <br />
                                <span className="text-gradient">Perfect Mattress</span>
                            </h1>
                            <p className="quiz-subtitle mb-12 max-w-xl mx-auto">
                                Just 6 quick questions. We'll match you with the best mattress based on your sleep style and comfort needs.
                            </p>
                            <button onClick={() => setStep(1)} className="btn-quiz-primary group">
                                Start Quiz
                                <FiChevronRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="mt-16 flex items-center justify-center gap-8 text-slate-400">
                                <div className="flex items-center gap-2">
                                    <FiCheck className="text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Free & Easy</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiTarget className="text-blue-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Expert Matching</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiMapPin className="text-purple-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Your Privacy Safe</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {(step >= 1 && step <= 6) && (
                        <div className="glass-card p-10 md:p-16 rounded-[3.5rem] relative overflow-hidden">
                            <div className="progress-bar-luxury mb-12">
                                <div className="flex justify-between items-end mb-4 font-black uppercase tracking-widest text-[11px]">
                                    <span className="text-slate-400">Question {step} of 6</span>
                                    <span className="text-blue-500">{Math.round((step / 6) * 100)}% Complete</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700 ease-out" style={{ width: `${(step / 6) * 100}%` }} />
                                </div>
                            </div>

                            <div className="quiz-content">
                                {step === 1 && renderQuestion1()}
                                {step === 2 && renderQuestion2()}
                                {step === 3 && renderQuestion3()}
                                {step === 4 && renderQuestion4()}
                                {step === 5 && renderQuestion5()}
                                {step === 6 && renderQuestion6()}
                            </div>
                        </div>
                    )}

                    {step === 7 && (
                        <div className="processing-luxury text-center py-24">
                            <div className="processing-ring mb-12 mx-auto">
                                <div className="ring-inner"></div>
                                <FiActivity className="center-icon animate-pulse" size={60} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-4">Finding Your Match...</h2>
                            <p className="text-slate-400 font-bold tracking-widest text-[11px] uppercase grayscale opacity-60">Your perfect mattress is loading</p>
                        </div>
                    )}

                    {step === 8 && renderResults()}
                </div>
            </div>

            <style>{`
                .sleep-quiz-premium-root {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                    background: radial-gradient(circle at top right, #f8faff 0%, #ffffff 50%, #f4f7ff 100%);
                }
                
                .glass-card {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 1);
                    box-shadow: 0 40px 100px rgba(74, 144, 226, 0.05);
                }

                .badge-exclusive {
                    display: inline-flex;
                    padding: 8px 20px;
                    background: #4A90E215;
                    color: #4A90E2;
                    border-radius: 100px;
                    font-weight: 800;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.25em;
                }

                .quiz-title {
                    font-size: clamp(2.5rem, 5vw, 4rem);
                    font-weight: 900;
                    line-height: 1.1;
                    letter-spacing: -0.04em;
                    color: #2C3E50;
                }

                .text-gradient {
                    background: linear-gradient(135deg, #4A90E2 0%, #9B7EBD 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .quiz-subtitle {
                    font-size: clamp(1rem, 2vw, 1.25rem);
                    color: #7F8C8D;
                    font-weight: 500;
                    line-height: 1.6;
                }

                .btn-quiz-primary {
                    background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
                    color: white;
                    padding: 24px 48px;
                    border-radius: 3rem;
                    font-weight: 800;
                    font-size: 1.125rem;
                    display: inline-flex;
                    align-items: center;
                    transition: all 0.4s cubic-bezier(0.2, 0, 0, 1);
                    box-shadow: 0 20px 40px rgba(74, 144, 226, 0.2);
                }

                .btn-quiz-primary:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 30px 60px rgba(74, 144, 226, 0.3);
                    filter: brightness(1.1);
                }

                .feature-item {
                    font-weight: 800;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                }

                .processing-ring {
                    width: 180px;
                    height: 180px;
                    position: relative;
                }

                .ring-inner {
                    width: 100%;
                    height: 100%;
                    border: 12px solid #f1f5f9;
                    border-top-color: #4A90E2;
                    border-radius: 50%;
                    animation: spin 2s linear infinite;
                }

                .center-icon {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: #4A90E2;
                }

                .quiz-option-btn {
                    width: 100%;
                    padding: 24px 32px;
                    background: white;
                    border: 2px solid #E1E8ED;
                    border-radius: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    transition: all 0.3s ease;
                    text-align: left;
                }

                .quiz-option-btn:hover {
                    border-color: #4A90E2;
                    background: #F5F7FA;
                    transform: scale(1.02);
                    box-shadow: 0 10px 25px rgba(74, 144, 226, 0.1);
                }

                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                
                .animate-fade-in { animation: fadeIn 0.6s ease-out; }
                .animate-slide-in { animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; }
                .animate-bounce-slow { animation: bounceSlow 3s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default SleepQuiz;
