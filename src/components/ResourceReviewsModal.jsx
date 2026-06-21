import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../hooks/useRole";
import { mapReview } from "../lib/resourceUtils";
import { RESOURCE_STATUS } from "../lib/roles";
import StarRating from "./StarRating";

export default function ResourceReviewsModal({ resource, onClose, onReviewChange }) {
  const { currentUser, userProfile } = useAuth();
  const { isAdmin } = useRole();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canReview = resource.status === RESOURCE_STATUS.APPROVED;
  const myReview = reviews.find((r) => r.userId === currentUser?.uid);

  async function fetchReviews() {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("resource_reviews")
      .select("*")
      .eq("resource_id", resource.id)
      .order("created_at", { ascending: false });

    if (fetchError) setError(fetchError.message);
    else setReviews((data || []).map(mapReview));
    setLoading(false);
  }

  useEffect(() => {
    fetchReviews();
  }, [resource.id]);

  useEffect(() => {
    const mine = reviews.find((r) => r.userId === currentUser?.uid);
    if (mine) {
      setRating(mine.rating);
      setComment(mine.comment);
    }
  }, [reviews, currentUser?.uid]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canReview) return;
    setSubmitting(true);
    setError("");

    const payload = {
      resource_id: resource.id,
      user_id: currentUser.uid,
      reviewer_name: userProfile?.fullName || currentUser.email,
      rating,
      comment: comment.trim(),
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("resource_reviews")
      .upsert(payload, { onConflict: "resource_id,user_id" });

    if (upsertError) {
      setError(upsertError.message);
    } else {
      await fetchReviews();
      onReviewChange?.();
    }
    setSubmitting(false);
  }

  async function handleDelete(reviewId) {
    if (!window.confirm("Remove this review?")) return;
    const { error: deleteError } = await supabase
      .from("resource_reviews")
      .delete()
      .eq("id", reviewId);

    if (deleteError) setError(deleteError.message);
    else {
      await fetchReviews();
      onReviewChange?.();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h3 className="font-bold text-slate-800">Reviews</h3>
            <p className="text-sm text-slate-500 line-clamp-1">{resource.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={resource.averageRating} size="md" />
              <span className="text-sm text-slate-600">
                {resource.averageRating.toFixed(1)} ({resource.reviewCount} reviews)
              </span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">{error}</div>
          )}

          {canReview && (
            <form onSubmit={handleSubmit} className="mb-6 pb-6 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-700 mb-2">
                {myReview ? "Update your review" : "Write a review"}
              </p>
              <StarRating rating={rating} interactive onChange={setRating} size="lg" />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this resource..."
                rows={3}
                className="w-full mt-3 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={submitting}
                className="mt-3 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
              >
                {submitting ? "Saving..." : myReview ? "Update Review" : "Submit Review"}
              </button>
            </form>
          )}

          {!canReview && (
            <p className="text-sm text-slate-500 mb-4">Reviews are available after admin approval.</p>
          )}

          {loading && <p className="text-sm text-slate-500">Loading reviews...</p>}

          {!loading && reviews.length === 0 && (
            <p className="text-sm text-slate-500">No reviews yet. Be the first!</p>
          )}

          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="border-b border-slate-50 pb-4 last:border-0">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{review.reviewerName}</p>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  {(isAdmin || review.userId === currentUser?.uid) && (
                    <button
                      type="button"
                      onClick={() => handleDelete(review.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      {isAdmin && review.userId !== currentUser?.uid ? "Remove" : "Delete"}
                    </button>
                  )}
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-600 mt-2">{review.comment}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
