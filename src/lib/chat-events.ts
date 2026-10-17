/**
 * Anything on the page can ask the chat assistant to open (e.g. the FAQ's "Ask our assistant").
 * The chat launcher listens for this event, so the two never need to share state.
 */
export const OPEN_CHAT_EVENT = "quillo:open-chat";

export function requestOpenChat() {
  window.dispatchEvent(new Event(OPEN_CHAT_EVENT));
}
