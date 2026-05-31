import { API_BASE } from '../config/api';
import { getAccessToken } from '../utils/auth';

export async function sendChatMessage(slug, message, history, currentLessonId) {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/api/courses/${slug}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history, currentLessonId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to get AI response');
  return data;
}
