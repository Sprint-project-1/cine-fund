const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export async function fetchMovies(
  { limit = 10, cursor, q, sortBy, order } = {},
  { signal } = {},
) {
  const query = new URLSearchParams({ limit: String(limit) });

  if (cursor) query.set("cursor", cursor);
  if (q) query.set("q", q);
  if (sortBy) query.set("sortBy", sortBy);
  if (order) query.set("order", order);

  const response = await fetch(`${API_BASE_URL}/api/movies?${query}`, {
    headers: { Accept: "application/json" },
    signal,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error?.message || "영화 목록을 불러오지 못했습니다.");
  }

  if (!Array.isArray(body?.items) || typeof body?.page?.hasMore !== "boolean") {
    throw new Error("영화 목록 응답 형식이 올바르지 않습니다.");
  }

  return body;
}

export function toMovieCard(movie) {
  return {
    ...movie,
    id: movie.movieId,
    year: movie.releaseDate?.slice(0, 4) || null,
    raisedAmount: movie.totalFundedAmount || "0",
    targetAmount: movie.productionBudget,
    posterUrl: movie.posterPath
      ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
      : null,
  };
}
