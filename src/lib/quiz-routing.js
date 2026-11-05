export const quizHref = (id) => `#quiz/${encodeURIComponent(id)}`

export function readQuizRoute(hash) {
  if (!hash || hash === '#' || hash === '#quizy') return { kind: 'catalog' }
  if (!hash.startsWith('#quiz/')) return { kind: 'missing' }
  try {
    const id = decodeURIComponent(hash.slice('#quiz/'.length))
    return id ? { kind: 'quiz', id } : { kind: 'missing' }
  } catch {
    return { kind: 'missing' }
  }
}
