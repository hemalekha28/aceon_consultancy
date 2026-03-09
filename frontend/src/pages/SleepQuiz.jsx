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
    FiChevronRight,
    FiUser,
    FiTrendingUp,
    FiShield
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

    const processResults = async () => {
        setStep(7);
        setIsLoading(true);

        try {
            // Call ML API for recommendation
            const mlResponse = await api.post('/ml/recommend', {
                weight: answers.weight,
                position: answers.position,
                firmness: answers.temperature, // Map temperature to firmness preference
                backPain: answers.backPain
            });

            if (mlResponse.data && mlResponse.data.primary) {
                // Find products that match the ML recommendation
                findMattressProducts(mlResponse.data.primary.mattress);
            }
        } catch (error) {
            console.error('ML Recommendation Error:', error);
            // Fall back to local matching
            findMatches();
        } finally {
            setIsLoading(false);
            setStep(8);
        }
    };

    const findMattressProducts = (recommendedMattressType) => {
        if (products.length === 0) {
            findMatches();
            return;
        }

        // Score products based on ML recommendation
        const scoredProducts = products.map(product => {
            let score = 80; // Base score from ML
            let reasons = [];
            const name = product.name.toLowerCase();

            // Match mattress type keywords
            if (recommendedMattressType.toLowerCase().includes('orthopedic') && name.includes('ortho')) {
                score = 95;
                reasons.push('ML matched: Orthopedic support recommended');
            } else if (recommendedMattressType.toLowerCase().includes('firm') && name.includes('firm')) {
                score = 92;
                reasons.push('ML matched: Firm support recommended');
            } else if (recommendedMattressType.toLowerCase().includes('soft') && (name.includes('soft') || name.includes('foam'))) {
                score = 90;
                reasons.push('ML matched: Soft foam recommended');
            } else if (recommendedMattressType.toLowerCase().includes('gel') && (name.includes('gel') || name.includes('cool'))) {
                score = 88;
                reasons.push('ML matched: Cooling mattress recommended');
            } else if (recommendedMattressType.toLowerCase().includes('latex') && name.includes('latex')) {
                score = 87;
                reasons.push('ML matched: Natural latex recommended');
            }

            // Apply position-based scoring
            if (answers.position === 'side' && (name.includes('soft') || name.includes('foam'))) {
                score += 5;
                reasons.push('Ideal pressure relief for side sleepers');
            } else if ((answers.position === 'back' || answers.position === 'stomach') && (name.includes('firm') || name.includes('hybrid'))) {
                score += 5;
                reasons.push('Proper spinal alignment for your position');
            }

            // Apply weight-based scoring
            if (answers.weight === 'heavy' && (name.includes('firm') || name.includes('hybrid'))) {
                score += 3;
                reasons.push('Enhanced support for your weight');
            }

            // Apply pain-based scoring
            if ((answers.backPain === 'frequently' || answers.backPain === 'occasionally') && name.includes('ortho')) {
                score += 5;
                reasons.push('Advanced orthopedic support for pain relief');
            }

            // Apply budget filtering
            if (answers.budget === 'budget' && product.price > 1000) score -= 20;
            else if (answers.budget === 'mid' && (product.price < 400 || product.price > 1200)) score -= 10;
            else if (answers.budget === 'premium' && (product.price < 800 || product.price > 2500)) score -= 10;
            else if (answers.budget === 'luxury' && product.price < 2000) score -= 15;

            return {
                ...product,
                matchScore: Math.min(98, Math.max(70, score)),
                reasons: reasons.slice(0, 4)
            };
        });

        const sorted = scoredProducts.sort((a, b) => b.matchScore - a.matchScore);
        setRecommendation(sorted[0]);
        setAlternatives(sorted.slice(1, 4));
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

    const renderLanding = () => (
        <div className="text-center space-y-8">
            <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-2xl">
                    <FiZap size={32} className="text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white leading-tight">
                    Sleep Quiz
                </h1>
                <p className="text-xl text-white/80 font-light">
                    Find your perfect mattress
                </p>
            </div>

            <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                        <FiTarget className="text-blue-400" size={20} />
                        <span className="text-white font-medium">AI-Powered Matching</span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                        Our advanced algorithm analyzes your sleep profile to recommend the perfect mattress for your needs.
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                        <FiShield className="text-green-400" size={20} />
                        <span className="text-white font-medium">6 Quick Questions</span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                        Answer a few simple questions about your sleep habits, body type, and preferences.
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                        <FiAward className="text-yellow-400" size={20} />
                        <span className="text-white font-medium">Personalized Results</span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                        Get detailed recommendations with match percentages and alternative options.
                    </p>
                </div>
            </div>

            <button
                onClick={() => setStep(1)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
            >
                Start Quiz
                <FiChevronRight size={20} />
            </button>
        </div>
    );

    const renderQuestion = () => {
        const questions = [
            {
                title: "What's your body weight?",
                subtitle: "This helps determine optimal support",
                options: [
                    { id: 'light', label: 'Lightweight', desc: 'Under 130 lbs', icon: '🌸' },
                    { id: 'avg-light', label: 'Average Light', desc: '130 - 180 lbs', icon: '🍃' },
                    { id: 'avg-heavy', label: 'Average Heavy', desc: '180 - 230 lbs', icon: '💪' },
                    { id: 'heavy', label: 'Heavy Duty', desc: 'Over 230 lbs', icon: '🏋️' }
                ]
            },
            {
                title: "How tall are you?",
                subtitle: "Height affects posture alignment",
                options: [
                    { id: 'short', label: 'Under 5\'4"', desc: 'Petite frame', icon: '📏' },
                    { id: 'avg-short', label: '5\'4" - 5\'8"', desc: 'Average height', icon: '📐' },
                    { id: 'avg-tall', label: '5\'9" - 6\'1"', desc: 'Tall stature', icon: '📏' },
                    { id: 'tall', label: 'Over 6\'1"', desc: 'Very tall', icon: '📏' },
                    { id: 'skip', label: 'Prefer not to say', desc: 'Skip this question', icon: '🙈' }
                ]
            },
            {
                title: "What's your sleep position?",
                subtitle: "Position determines pressure relief needs",
                options: [
                    { id: 'side', label: 'Side Sleeper', desc: 'Hip & shoulder relief', icon: '😴' },
                    { id: 'back', label: 'Back Sleeper', desc: 'Spinal alignment', icon: '😌' },
                    { id: 'stomach', label: 'Stomach Sleeper', desc: 'Core support', icon: '😪' },
                    { id: 'combo', label: 'Toss & Turn', desc: 'Dynamic response', icon: '🔄' }
                ]
            },
            {
                title: "Back pain frequency?",
                subtitle: "Chronic pain indicates specialized support",
                options: [
                    { id: 'frequently', label: 'Frequently', desc: '4+ times per week', icon: '😣' },
                    { id: 'occasionally', label: 'Occasionally', desc: 'Sometimes occurs', icon: '😐' },
                    { id: 'rarely', label: 'Rarely', desc: 'Minimal discomfort', icon: '😊' }
                ]
            },
            {
                title: "How do you sleep temperature-wise?",
                subtitle: "Temperature affects sleep quality",
                options: [
                    { id: 'hot', label: 'Sleep Hot', desc: 'Need cooling mattress', icon: '🔥' },
                    { id: 'warm', label: 'Warm Sleeper', desc: 'Moderate cooling', icon: '🌡️' },
                    { id: 'cool', label: 'Cool Sleeper', desc: 'Temperature neutral', icon: '❄️' },
                    { id: 'cold', label: 'Cold Sleeper', desc: 'May need warmer', icon: '🧊' }
                ]
            },
            {
                title: "What's your budget range?",
                subtitle: "Quality sleep is an investment",
                options: [
                    { id: 'budget', label: 'Budget Friendly', desc: 'Under $500', icon: '💰' },
                    { id: 'mid', label: 'Mid Range', desc: '$500 - $1,000', icon: '💳' },
                    { id: 'premium', label: 'Premium', desc: '$1,000 - $2,000', icon: '💎' },
                    { id: 'luxury', label: 'Luxury', desc: '$2,000+', icon: '👑' },
                    { id: 'all', label: 'Show All', desc: 'No budget limit', icon: '🔍' }
                ]
            }
        ];

        const currentQuestion = questions[step - 1];

        return (
            <div className="space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold text-white leading-tight">
                        {currentQuestion.title}
                    </h1>
                    <p className="text-white/70 text-lg">
                        {currentQuestion.subtitle}
                    </p>
                </div>

                <div className="space-y-6">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={option.id}
                            onClick={() => handleAnswer(
                                step === 1 ? 'weight' :
                                step === 2 ? 'height' :
                                step === 3 ? 'position' :
                                step === 4 ? 'backPain' :
                                step === 5 ? 'temperature' : 'budget',
                                option.id
                            )}
                            className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">{option.icon}</div>
                                <div className="flex-1 text-left">
                                    <div className="text-white font-semibold text-lg group-hover:text-blue-300 transition-colors">
                                        {option.label}
                                    </div>
                                    <div className="text-white/60 text-sm">
                                        {option.desc}
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full border-2 border-white/40 group-hover:border-white group-hover:bg-white/20 flex items-center justify-center transition-all">
                                    <div className="w-4 h-4 rounded-full bg-blue-500 scale-0 group-hover:scale-100 transition-transform"></div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Pain Areas Selection for Question 4 */}
                {step === 4 && (answers.backPain === 'frequently' || answers.backPain === 'occasionally') && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 space-y-4">
                        <h3 className="text-white font-semibold text-lg">Target Pain Areas:</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {['Lower back', 'Upper back', 'Hips', 'Shoulders'].map(area => (
                                <button
                                    key={area}
                                    onClick={() => handlePainAreaToggle(area)}
                                    className={`p-3 rounded-xl border transition-all duration-200 ${
                                        answers.painAreas.includes(area)
                                            ? 'bg-blue-500 border-blue-400 text-white'
                                            : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
                                    }`}
                                >
                                    {area}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={nextStep}
                            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                        >
                            Continue →
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderQuestion4 = () => (
        <div className="animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">Do you experience back pain?</h2>
            <p className="text-slate-600 mb-8 text-lg">Chronic tension or localized discomfort indicates the need for specialized support.</p>

            <div className="flex flex-col gap-6 mb-6">
                {[
                    { id: 'frequently', label: 'Frequently', sub: 'Pain occurs 4+ times per week' },
                    { id: 'occasionally', label: 'Occasionally', sub: 'Varies with lifestyle/stress' },
                    { id: 'rarely', label: 'Rarely', sub: 'Minimal discomfort' },
                ].map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleAnswer('backPain', opt.id)}
                        className={`w-full p-6 bg-white border-2 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                            answers.backPain === opt.id 
                                ? 'border-indigo-500 bg-indigo-50' 
                                : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                    >
                        <div className="text-left">
                            <span className={`block text-lg font-semibold mb-1 transition-colors ${
                                answers.backPain === opt.id ? 'text-indigo-700' : 'text-slate-900 group-hover:text-indigo-700'
                            }`}>{opt.label}</span>
                            <span className="text-sm text-slate-500">{opt.sub}</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            answers.backPain === opt.id ? 'border-indigo-500 bg-white' : 'border-slate-300'
                        }`}>
                            {answers.backPain === opt.id && <div className="w-3 h-3 rounded-full bg-indigo-500"></div>}
                        </div>
                    </button>
                ))}
            </div>

            {(answers.backPain === 'frequently' || answers.backPain === 'occasionally') && (
                <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wide">Target Pain Areas:</p>
                    <div className="grid grid-cols-2 gap-4">
                        {['Lower back', 'Upper back', 'Hips', 'Shoulders'].map(area => (
                            <label key={area} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                                    answers.painAreas.includes(area) ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-slate-300'
                                }`}>
                                    {answers.painAreas.includes(area) && <FiCheck className="text-white" size={12} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={answers.painAreas.includes(area)}
                                    onChange={() => handlePainAreaToggle(area)}
                                />
                                <span className={`font-medium transition-colors ${
                                    answers.painAreas.includes(area) ? 'text-indigo-700' : 'text-slate-600 group-hover:text-slate-900'
                                }`}>{area}</span>
                            </label>
                        ))}
                    </div>
                    <button
                        onClick={nextStep}
                        className="mt-6 w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        Continue →
                    </button>
                </div>
            )}
        </div>
    );

    const renderQuestion5 = () => (
        <div className="animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">How do you sleep temperature-wise?</h2>
            <p className="text-slate-600 mb-8 text-lg">Body temperature regulation affects sleep quality and mattress choice.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { id: 'hot', icon: '🔥', label: 'Sleep Hot', sub: 'Need cooling mattress' },
                    { id: 'warm', icon: '🌡️', label: 'Warm Sleeper', sub: 'Moderate cooling' },
                    { id: 'cool', icon: '❄️', label: 'Cool Sleeper', sub: 'Temperature neutral' },
                    { id: 'cold', icon: '🧊', label: 'Cold Sleeper', sub: 'May need warmer mattress' },
                ].map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleAnswer('temperature', opt.id)}
                        className="w-full p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 flex flex-col items-center gap-3 text-center group"
                    >
                        <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{opt.icon}</span>
                        <div>
                            <span className="block font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors text-lg">{opt.label}</span>
                            <span className="text-sm text-slate-500">{opt.sub}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderQuestion6 = () => (
        <div className="animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">What's your budget range?</h2>
            <p className="text-slate-600 mb-8 text-lg">Quality sleep is an investment in your long-term health and well-being.</p>

            <div className="flex flex-col gap-6">
                {[
                    { id: 'budget', label: 'Budget Friendly', price: 'Under $500' },
                    { id: 'mid', label: 'Mid Range', price: '$500 - $1,000' },
                    { id: 'premium', label: 'Premium', price: '$1,000 - $2,000' },
                    { id: 'luxury', label: 'Luxury', price: '$2,000+' },
                    { id: 'all', label: 'Show All Options', price: 'All price points' },
                ].map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleAnswer('budget', opt.id)}
                        className="w-full p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 flex items-center justify-between group"
                    >
                        <div>
                            <span className="block text-lg font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{opt.label}</span>
                            <span className="text-sm text-slate-500">{opt.price}</span>
                        </div>
                        <FiArrowRight size={20} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                    </button>
                ))}
            </div>
        </div>
    );


    const renderResults = () => {
        if (!recommendation) return null;

        return (
            <div className="animate-fade-in">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-6">
                        <FiTarget size={16} />
                        AI Recommendation
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Your perfect sleep match is ready!</h1>
                    <p className="text-slate-600 text-lg">Based on your unique sleep profile and preferences.</p>
                </div>

                {/* Primary Recommendation */}
                <div className="max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200 mb-16 hover:shadow-2xl transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 py-4 px-6 flex justify-between items-center text-white">
                        <span className="text-sm font-bold uppercase tracking-wide">🏆 Perfect Match</span>
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                            <FiTarget size={12} />
                            {recommendation.matchScore.toFixed(0)}% Match
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-8 md:p-12 bg-slate-50 flex items-center justify-center">
                            <div className="relative w-full max-w-sm aspect-square">
                                <Image
                                    src={constructImageUrl(recommendation.image)}
                                    alt={recommendation.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>

                        <div className="p-8 md:p-12 flex flex-col justify-center">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 leading-tight">{recommendation.name}</h2>

                            <div className="mb-6">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-semibold text-indigo-600">{recommendation.matchScore.toFixed(0)}% Match</span>
                                    <span className="text-xs text-slate-400 uppercase tracking-wide">Optimized Fit</span>
                                </div>
                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full" style={{ width: `${recommendation.matchScore}%` }}></div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Why this mattress:</p>
                                {recommendation.reasons.map((reason, i) => (
                                    <div key={i} className="flex gap-3 text-slate-700 items-start">
                                        <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <FiCheck className="text-green-600" size={10} />
                                        </div>
                                        <span className="text-sm leading-relaxed">{reason}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-slate-900">{formatPrice(recommendation.price)}</span>
                                    <span className="text-xs font-medium text-green-600 uppercase tracking-wide">In Stock</span>
                                </div>
                                <button
                                    onClick={() => {
                                        addToCart(recommendation);
                                        showSuccess('Perfect match added to your cart!');
                                    }}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
                                >
                                    <FiShoppingCart size={16} /> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alternatives */}
                {alternatives.length > 0 && (
                    <div className="max-w-6xl mx-auto mb-12">
                        <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Other Great Options</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {alternatives.map(alt => (
                                <div key={alt._id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{alt.matchScore.toFixed(0)}% Match</span>
                                            <div className="h-1 w-12 bg-slate-200 rounded-full mt-1">
                                                <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${alt.matchScore}%` }}></div>
                                            </div>
                                        </div>
                                        <FiTarget className="text-indigo-300" size={16} />
                                    </div>
                                    <div className="w-full aspect-square mb-6">
                                        <Image src={constructImageUrl(alt.image)} alt={alt.name} className="w-full h-full object-contain" />
                                    </div>
                                    <h4 className="font-bold text-lg text-slate-900 mb-2 truncate">{alt.name}</h4>
                                    <span className="font-semibold text-slate-600 mb-4">{formatPrice(alt.price)}</span>
                                    <button
                                        onClick={() => navigate(`/product/${alt._id}`)}
                                        className="mt-auto w-full py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center gap-2"
                                    >
                                        View Details <FiArrowRight size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="text-center">
                    <button
                        onClick={restartQuiz}
                        className="inline-flex items-center gap-2 px-6 py-3 text-slate-500 hover:text-indigo-600 transition-colors duration-200 font-medium"
                    >
                        <FiRefreshCw size={16} /> Take the Quiz Again
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
            </div>

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="flex justify-between items-center p-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        <FiArrowLeft size={24} />
                    </button>
                    {step > 0 && step < 7 && (
                        <div className="flex items-center gap-2 text-white/70">
                            <span className="text-sm">{step}/6</span>
                        </div>
                    )}
                    <div className="w-6"></div> {/* Spacer */}
                </header>

                {/* Main Content */}
                <main className="flex-1 flex items-center justify-center px-6 py-8">
                    <div className="w-full max-w-md">
                        {step === 0 && renderLanding()}
                        {(step >= 1 && step <= 6) && renderQuestion()}
                        {step === 7 && renderProcessing()}
                        {step === 8 && renderResults()}
                    </div>
                </main>

                {/* Navigation */}
                {step > 0 && step < 7 && (
                    <footer className="p-6">
                        <div className="flex justify-between items-center">
                            {step > 1 && (
                                <button
                                    onClick={prevStep}
                                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                                >
                                    <FiArrowLeft size={20} />
                                    Back
                                </button>
                            )}
                            <div className="flex-1"></div>
                            <div className="text-white/50 text-sm">
                                Step {step} of 6
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default SleepQuiz;
