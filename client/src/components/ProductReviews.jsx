import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Check,
  Loader2,
} from 'lucide-react';

const ProductReviews = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reviews/product/${productId}`);
      setReviews(res.data.data.reviews);
      setAverage(res.data.data.average);
      setCount(res.data.data.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Inicia sesión para dejar una reseña');
    if (!comment.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/reviews', { productId, rating, comment });
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al publicar reseña');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      {/* Encabezado y promedio */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Reseñas ({count})
        </h3>
        {count > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(average)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-foreground">{average}/5</span>
          </div>
        )}
      </div>

      {/* Formulario para dejar reseña */}
      {user && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-5 mb-8"
        >
          <h4 className="font-semibold text-foreground mb-3">Escribir reseña</h4>
          {error && (
            <p className="text-destructive text-sm mb-3 flex items-center gap-1">
              <Check className="h-4 w-4 rotate-45" /> {error}
            </p>
          )}
          {/* Estrellas */}
          <div className="mb-3">
            <label className="text-sm text-muted-foreground mb-1.5 block">
              Califica este producto
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-0.5 transition-colors"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Cuéntanos tu experiencia con este producto..."
            required
            className="mb-4 resize-none"
          />
          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publicando...
              </>
            ) : (
              'Enviar reseña'
            )}
          </Button>
        </form>
      )}

      {/* Lista de reseñas */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-3 bg-muted rounded w-16" />
                </div>
              </div>
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div
              key={review._id}
              className="rounded-2xl border border-border bg-card p-5 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  {/* Avatar con iniciales */}
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                    {review.user?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {review.user?.displayName || 'Usuario'}
                      </p>
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-500/10 text-green-500 rounded-full">
                          <Check className="h-3 w-3" />
                          Compra verificada
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                {/* Estrellas de la reseña */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-4">
                {review.comment}
              </p>

              {/* ¿Te fue útil? */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">¿Te fue útil?</span>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                  <ThumbsUp className="h-4 w-4" />
                  {review.helpful || 0}
                </button>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                  <ThumbsDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          No hay reseñas aún. Sé el primero en opinar.
        </p>
      )}
    </div>
  );
};

export default ProductReviews;