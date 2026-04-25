/**
 * Returns the URL path for a Thomasson detail page.
 * Uses serial_id (integer) if available, falls back to UUID.
 */
export function getThomassonUrl(thomasson) {
  const identifier = thomasson.serial_id ?? thomasson.id;
  return `/thomasson/${identifier}`;
}
