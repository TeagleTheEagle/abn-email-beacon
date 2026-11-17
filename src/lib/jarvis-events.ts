// Single managed event contract for controls that need to open the globally mounted assistant.
export const JARVIS_OPEN_EVENT = "jarvis:open";

export function requestJarvisOpen() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(JARVIS_OPEN_EVENT));
}
