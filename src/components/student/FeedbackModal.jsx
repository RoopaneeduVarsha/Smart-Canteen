import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { Star, X, Sparkles, ThumbsUp, Send } from 'lucide-react';

export function FeedbackModal({ isOpen, order, onClose }) {
  const { addFeedback, t } = useCanteen();

  const [rating, setRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTag, setSelectedTag] = useState('Super Fast Pickup');

  if (!isOpen) return null;

  const quickTags = [
    'Super Fast Pickup',
    'Food was piping hot',
    'Accurate AI slot',
    'Great taste & hygiene',
    'Courteous staff',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalComment = comment ? `${comment} (${selectedTag})` : selectedTag;
    addFeedback({
      rating,
      food_rating: foodRating,
      service_rating: serviceRating,
      comment: finalComment,
      token: order?.token_number || 'A125',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-amber-500/10 via-slate-900 to-orange-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-100">
                {t('rate_experience_title')}
              </h3>
              <p className="text-xs text-slate-400">
                Token #{order?.token_number || 'A125'} • Campus Feedback
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Main Star Rating */}
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              {t('overall_exp')}
            </span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                        : 'text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-amber-400">
              {rating === 5 ? '⭐⭐⭐⭐⭐ Fantastic!' : rating === 4 ? '⭐⭐⭐⭐ Good' : rating === 3 ? '⭐⭐⭐ Average' : 'Needs Improvement'}
            </p>
          </div>

          {/* Detailed Aspect Ratings */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-1">{t('food_taste_fresh')}</span>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} type="button" onClick={() => setFoodRating(s)}>
                    <Star className={`w-3.5 h-3.5 ${s <= foodRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-1">{t('speed_accuracy')}</span>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} type="button" onClick={() => setServiceRating(s)}>
                    <Star className={`w-3.5 h-3.5 ${s <= serviceRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Tags */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              Quick Highlights
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all border ${
                    selectedTag === tag
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Text comment */}
          <div>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you liked or how we can improve..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>{t('submit_feedback')}</span>
          </button>

        </form>

      </div>
    </div>
  );
}
