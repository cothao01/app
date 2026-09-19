const API_URL = 'https://09e0flm66m.execute-api.us-east-1.amazonaws.com/dev/';

export async function postEvent(event) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Data: JSON.stringify(event) }),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.warn('Failed to sync event to cloud:', error);
    return null;
  }
}

export async function fetchEvents() {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();
    const body = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
    return body.map((item) => {
      const data = typeof item.Data === 'string' ? JSON.parse(item.Data) : item.Data;
      return { ...data, cloudId: item.ID };
    });
  } catch (error) {
    console.warn('Failed to fetch events from cloud:', error);
    return [];
  }
}
