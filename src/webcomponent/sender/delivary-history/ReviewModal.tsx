"use client";

import React, { useState, useEffect } from "react";
import { Star, Loader2, X } from "lucide-react";
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

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  isOpen,
  onClose,
  booking,
  existingReview,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
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
  }, [existingReview, isOpen]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            {existingReview ? "Edit Your Review" : "Leave a Review"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Selection */}
          <div className="flex flex-col items-center justify-center space-y-2 py-2">
            <span className="text-xs font-semibold text-slate-500">Tap to rate:</span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 transition transform hover:scale-110 cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? "text-amber-500 fill-amber-500" : "text-slate-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Comment</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
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