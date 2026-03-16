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
import { formatPrice } from '../utils.helpers';
import { constructImageUrl } from '../utils/imageUtils';
import { useCart } from '../context/cartContext';
import { useNotification } from '../context/notificationContext';

const SleepQuiz = () => {
    const navigate = useNavigate();
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
=======
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Image from '../components/Image';
import { formatPrice } from '../utils/helpers';
import { constructImageUrl } from '../utils/imageUtils';
import { useCart } from '../context/cartContext';
import { useNotification } from '../context/notificationContext';
import { useAuth } from '../context/authContext';

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

  const barColor = score >= 90 ? '#22c55e' : score >= 82 ? S.accent : S.blue;

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
>>>>>>> origin/emi-feature
