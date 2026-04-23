import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, ThumbsUp, ThumbsDown, Send, 
  User, Star, Image as ImageIcon, X, Loader2, Camera
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { firebaseOps } from '../lib/firebaseOps';
import { cn } from '../lib/utils';
import { Review } from '../types';

import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const allComments = useStore(state => state.comments);
  const comments = useMemo(() => 
    allComments.filter(c => c.productId === productId),
    [allComments, productId]
  );
  
  const addComment = useStore(state => state.addComment);
  const likeComment = useStore(state => state.likeComment);
  const dislikeComment = useStore(state => state.dislikeComment);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 4) {
      alert("Maximum 4 images allowed per review.");
      return;
    }

    const newFiles = [...images, ...files];
    setImages(newFiles);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !commentText) return;

    setIsUploading(true);
    const reviewId = Math.random().toString(36).substr(2, 9);
    
    try {
      let uploadedUrls: string[] = [];
      if (images.length > 0) {
        uploadedUrls = await firebaseOps.uploadReviewImages(reviewId, images);
      }

      const newReview: Review = {
        id: reviewId,
        productId,
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        text: commentText,
        rating,
        likes: 0,
        dislikes: 0,
        images: uploadedUrls,
        createdAt: new Date().toISOString()
      };

      await firebaseOps.addComment(newReview);
      addComment(newReview);
      
      // Reset form
      setCommentText('');
      setRating(5);
      setImages([]);
      setPreviews([]);
    } catch (error) {
      console.error("Review failure", error);
    } finally {
      setIsUploading(true); // Should be false
      setIsUploading(false);
    }
  };

  const handleLike = async (comment: Review) => {
    try {
      await firebaseOps.updateComment(comment.id, { likes: comment.likes + 1 });
      likeComment(comment.id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDislike = async (comment: Review) => {
    try {
      await firebaseOps.updateComment(comment.id, { dislikes: comment.dislikes + 1 });
      dislikeComment(comment.id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red">
          <Star size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-white">Product Reviews</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Share your thoughts and photos with other customers</p>
        </div>
      </div>

      {/* New Review Form */}
      <form onSubmit={handleSubmit} className="bg-brand-card/40 border border-white/5 rounded-[32px] p-8 space-y-6 relative overflow-hidden">
        {isUploading && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <Loader2 size={40} className="text-brand-red animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Uploading Digital Evidence...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-2">Rating</label>
              <div className="flex gap-2 bg-black/40 border border-white/10 p-4 rounded-2xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-125"
                  >
                    <Star 
                      size={20} 
                      className={cn(
                        "transition-colors",
                        star <= rating ? "text-brand-red fill-brand-red" : "text-white/10"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-2">Visual Documentation (Max 4)</label>
            <div className="grid grid-cols-2 gap-3 h-full">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {previews.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-brand-red/50 hover:bg-brand-red/5 transition-all text-brand-muted hover:text-brand-red"
                >
                  <Camera size={24} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Attach File</span>
                </button>
              )}
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-2">Your Review</label>
          <textarea 
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="How is the fit? Is the fabric good?"
            rows={4}
            className="w-full bg-black/40 border border-white/10 rounded-[24px] p-6 text-sm font-medium focus:border-brand-red outline-none transition-all placeholder:text-brand-muted/30 resize-none"
          />
        </div>
        
        <button 
          type="submit"
          disabled={!currentUser || !commentText || isUploading}
          className="w-full bg-white text-black py-5 rounded-[24px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-brand-red hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-2xl"
        >
          {currentUser ? <><Send size={18} /> Submit Review</> : "Sign in to leave a review"}
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Customer Reviews ({comments.length})</h3>
          <div className="flex items-center gap-2">
            <div className="text-[10px] font-bold text-brand-muted uppercase">Avg Grade:</div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  size={10} 
                  className={cn(
                    comments.length > 0 && s <= Math.round(comments.reduce((acc, c) => acc + c.rating, 0) / comments.length) 
                      ? "text-brand-red fill-brand-red" 
                      : "text-white/10"
                  )} 
                />
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {comments.length > 0 ? (
            comments.map((comment, idx) => (
              <motion.div 
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-brand-card/20 border border-white/5 rounded-[32px] p-8 hover:border-white/10 transition-all group"
              >
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-muted group-hover:bg-brand-red/10 group-hover:text-brand-red transition-colors">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-sm font-black uppercase tracking-tighter text-white">{comment.userName}</h4>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              size={10} 
                              className={cn(s <= comment.rating ? "text-brand-red fill-brand-red" : "text-white/10")} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[9px] font-bold text-brand-muted/40 uppercase tracking-widest">
                        {new Date(comment.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-brand-muted text-sm leading-relaxed mb-6 italic">"{comment.text}"</p>

                {comment.images && comment.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {comment.images.map((img, i) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/5 group-hover:border-white/10 transition-all">
                        <img 
                          src={img} 
                          alt={`Evidence ${i}`} 
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleLike(comment)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-brand-muted hover:bg-green-500/10 hover:text-green-500 transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    <ThumbsUp size={14} /> {comment.likes}
                  </button>
                  <button 
                    onClick={() => handleDislike(comment)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-brand-muted hover:bg-red-500/10 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    <ThumbsDown size={14} /> {comment.dislikes}
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-24 border border-dashed border-white/5 rounded-[48px] bg-white/[0.01]">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <MessageSquare size={32} className="text-brand-muted/20" />
              </div>
              <p className="text-brand-muted text-[10px] uppercase tracking-[0.4em] font-black">No evidence submitted yet.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
