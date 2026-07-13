export function createAttendanceService(options = {}) {
  const baseUrl = options.baseUrl ?? "";
  const anonKey = options.anonKey ?? "";
  const eventId = options.eventId ?? "pisland-2026";
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    "Content-Type": "application/json",
  };

  return {
    isConfigured: baseUrl.startsWith("https://") && anonKey.length > 20,
    async getCount() {
      const params = new URLSearchParams({ select: "attendees", event_id: `eq.${eventId}` });
      const response = await fetchImpl(`${baseUrl}/rest/v1/event_attendance?${params}`, { headers });
      if (!response.ok) throw new Error(`No se pudo cargar la asistencia (${response.status}).`);
      const rows = await response.json();
      return Number(rows?.[0]?.attendees || 0);
    },
    async increment() {
      const response = await fetchImpl(`${baseUrl}/rest/v1/rpc/increment_attendees`, {
        method: "POST",
        headers,
        body: JSON.stringify({ p_event_id: eventId }),
      });
      if (!response.ok) throw new Error(`No se pudo sumar la asistencia (${response.status}).`);
      return Number(await response.json());
    },
  };
}
