const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ""
).replace(/\/$/, "");

async function request(path, { signal, ...options } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json", ...options.headers },
      signal,
      ...options,
    });
  } catch (cause) {
    if (cause.name === "AbortError") throw cause;
    throw new Error(
      "백엔드 API에 연결할 수 없습니다. 백엔드 서버 실행과 API 주소를 확인해 주세요.",
      { cause },
    );
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error?.message || (
      response.status === 404
        ? "백엔드에서 이 API 경로를 찾을 수 없습니다. endpoint 구현 여부를 확인해 주세요."
        : `요청을 완료하지 못했습니다. (${response.status})`
    );
    const error = new Error(message);
    error.status = response.status;
    error.code = body?.error?.code;
    error.apiMessage = body?.error?.message;
    throw error;
  }
  return body;
}

export async function fetchMovies(
  { limit = 10, cursor, q, sortBy, order } = {},
  { signal } = {},
) {
  const query = new URLSearchParams({ limit: String(limit) });

  if (cursor) query.set("cursor", cursor);
  if (q) query.set("q", q);
  if (sortBy) query.set("sortBy", sortBy);
  if (order) query.set("order", order);

  const body = await request(`/api/movies?${query}`, { signal });

  if (!Array.isArray(body?.items) || typeof body?.page?.hasMore !== "boolean") {
    throw new Error("영화 목록 응답 형식이 올바르지 않습니다.");
  }

  return body;
}

export async function fetchMovie(movieId, { signal } = {}) {
  const body = await request(`/api/movies/${encodeURIComponent(movieId)}`, { signal });
  if (!body?.movie || body.movie.movieId === undefined) {
    throw new Error("영화 상세 응답 형식이 올바르지 않습니다.");
  }
  return body.movie;
}

export async function fetchComments(movieId, { cursor, limit = 10, signal } = {}) {
  const query = new URLSearchParams({ limit: String(limit) });
  if (cursor) query.set("cursor", cursor);
  const body = await request(`/api/movies/${encodeURIComponent(movieId)}/comments?${query}`, { signal });
  if (!Array.isArray(body?.items) || typeof body?.page?.hasMore !== "boolean") {
    throw new Error("코멘트 응답 형식이 올바르지 않습니다.");
  }
  return body;
}

export async function createFunding(movieId, values) {
  return request(`/api/movies/${encodeURIComponent(movieId)}/fundings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}

export async function cancelFunding(fundingId, password) {
  return request(`/api/fundings/${encodeURIComponent(fundingId)}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
}

export async function updateFundingComment(fundingId, password, comment) {
  return request(`/api/fundings/${encodeURIComponent(fundingId)}/comment`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, comment }),
  });
}

export async function fetchComparison(movieIds, { signal } = {}) {
  let body;
  try {
    body = await request("/api/comparisons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieIds }),
      signal,
    });
  } catch (error) {
    if (error.status === 400) {
      throw new Error(error.apiMessage || "비교 요청이 올바르지 않습니다. 영화를 다시 선택해 주세요.", { cause: error });
    }
    if (error.status === 404 && error.code === "MOVIE_NOT_FOUND") {
      throw new Error(error.apiMessage || "선택한 영화 중 일부를 찾을 수 없습니다. 영화를 다시 선택해 주세요.", { cause: error });
    }
    throw error;
  }
  if (!Array.isArray(body?.items) || (body.items.length > 0 && body.items.length !== movieIds.length)) {
    throw new Error("영화 비교 응답 형식이 올바르지 않습니다.");
  }
  return body.items;
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
