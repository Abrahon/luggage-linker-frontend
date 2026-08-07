"use client";

import React, { useState, useEffect } from "react";
import { Star, Loader2, X, Package, User } from "lucide-react";
import { toast } from "sonner";
import {
  createBookingReview,
  updateReview,
  ReviewData,
} from "@/api/reviews.api";

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    traveler: string;
    travelerName?: string;
    packageTitle?: string;
  };
  existingReview?: ReviewData | null;
  onSuccess: (review: ReviewData) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent!",
};

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  isOpen,
  onClose,
  booking,
  existingReview,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize rating and comment with existingReview when modal opens
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setComment(existingReview.comment || "");
    } else {
      setRating(5);
      setComment("");
    }
    setHoverRating(null);
  }, [existingReview, isOpen]);

  if (!isOpen) return null;

  // Active star count (hover state takes precedence over selected rating)
  const activeRating = hoverRating !== null ? hoverRating : rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error("Please enter a review comment.");
      return;
    }

    try {
      setIsSubmitting(true);
      let responseData: ReviewData;

      if (existingReview?.id) {
        // --- UPDATE (PATCH): /api/reviews/<uuid:pk>/ ---
        const res = await updateReview(existingReview.id, {
          rating,
          comment,
        });
        responseData = res?.data || res;
        toast.success("Review updated successfully!");
      } else {
        // --- CREATE (POST): /api/reviews/ ---
        const res = await createBookingReview({
          booking: booking.id,
          traveler: booking.traveler,
          rating,
          comment,
        });
        responseData = res?.data || res;
        toast.success("Review submitted successfully!");
      }

      onSuccess(responseData);
      onClose();
    } catch (err: any) {
      const errResponse = err?.response?.data;

      // Extract error messages cleanly from Django REST Framework
      if (typeof errResponse === "object" && errResponse !== null) {
        const firstKey = Object.keys(errResponse)[0];
        const errorVal = errResponse[firstKey];
        if (Array.isArray(errorVal)) {
          toast.error(`${firstKey}: ${errorVal[0]}`);
        } else if (typeof errorVal === "string") {
          toast.error(errorVal);
        } else {
          toast.error("Failed to save review. Please try again.");
        }
      } else {
        toast.error("Failed to save review. Please check your connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {existingReview ? "Edit Your Review" : "Rate & Review Traveler"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              1 review allowed per completed delivery
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delivery / Traveler Context Card */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 text-xs space-y-1">
          {booking.packageTitle && (
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Package className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate">{booking.packageTitle}</span>
            </div>
          )}
          {booking.travelerName && (
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Traveler: {booking.travelerName}</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 5-Star Interactive Rating System */}
          <div className="flex flex-col items-center justify-center space-y-2 bg-amber-50/50 border border-amber-100/80 rounded-2xl p-4">
            <span className="text-xs font-semibold text-slate-500">
              Select rating (1 to 5 stars):
            </span>
            
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= activeRating
                        ? "text-amber-400 fill-amber-400 drop-shadow-xs"
                        : "text-slate-200 fill-slate-100"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Dynamic Label Feedback */}
            <span className="text-xs font-extrabold text-amber-700 h-4">
              {RATING_LABELS[activeRating] || ""}
            </span>
          </div>

          {/* Comment Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Your Feedback</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about timing, communication, package condition..."
              className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {existingReview ? "Updating..." : "Submitting..."}
              </>
            ) : existingReview ? (
              "Update Review"
            ) : (
              "Submit Review"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};