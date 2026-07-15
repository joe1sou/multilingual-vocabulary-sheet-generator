type UiClickProperties = Record<string, string | boolean>;

type CaptureUiClick = (properties: UiClickProperties) => void;

const interactiveSelector = [
  "a",
  "button",
  '[role="button"]',
  "[data-track-key]",
  "[data-analytics-key]",
  "[data-cta-key]",
].join(",");

const explicitKeyAttributes = ["data-track-key", "data-analytics-key", "data-cta-key"] as const;

function safeKey(value: string) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function elementSegment(element: Element) {
  const tag = element.tagName.toLowerCase();
  const classes = [...element.classList]
    .filter((className) => /^[a-zA-Z0-9_-]{1,60}$/.test(className))
    .slice(0, 2);
  const sameTagSiblings = element.parentElement
    ? [...element.parentElement.children].filter((sibling) => sibling.tagName === element.tagName)
    : [];
  const position = sameTagSiblings.length > 1 ? sameTagSiblings.indexOf(element) + 1 : 0;

  return safeKey([tag, ...classes, position ? `item-${position}` : ""].filter(Boolean).join("-"));
}

function structuralKey(element: Element) {
  const segments = [elementSegment(element)];
  let parent = element.parentElement;

  while (parent && parent !== document.body && segments.length < 3) {
    if (parent.matches("main,nav,header,footer,section,article,form,[class]")) {
      segments.push(elementSegment(parent));
    }
    parent = parent.parentElement;
  }

  return segments.reverse().join("__").slice(0, 120) || "unknown-element";
}

function trackedElementKey(element: HTMLElement) {
  for (const attribute of explicitKeyAttributes) {
    const key = safeKey(element.getAttribute(attribute) || "");
    if (key) return { key, isExplicit: true };
  }

  return { key: structuralKey(element), isExplicit: false };
}

function trackedSectionKey(element: HTMLElement) {
  const explicitSection = element.closest<HTMLElement>("[data-section-key]");
  const explicitKey = safeKey(explicitSection?.dataset.sectionKey || "");
  if (explicitKey) return explicitKey;

  const section = element.closest("section,article,nav,header,footer,main,form");
  return section ? structuralKey(section) : "page";
}

function destinationType(element: HTMLElement) {
  if (!(element instanceof HTMLAnchorElement)) return "non-navigation";
  if (element.hasAttribute("download")) return "download";

  try {
    const destination = new URL(element.href, window.location.origin);
    return destination.origin === window.location.origin ? "internal" : "external";
  } catch {
    return "unknown";
  }
}

function actionType(element: HTMLElement) {
  if (element instanceof HTMLAnchorElement) return "navigate";
  if (element instanceof HTMLButtonElement) return element.type || "button";
  return element.getAttribute("role") === "button" ? "activate" : "click";
}

function elementType(element: HTMLElement) {
  if (element instanceof HTMLAnchorElement) return "link";
  if (element instanceof HTMLButtonElement) return "button";
  return element.getAttribute("role") === "button" ? "role-button" : element.tagName.toLowerCase();
}

function currentPageKey() {
  return safeKey(window.location.pathname) || "home";
}

export function installUiClickTracking(capture: CaptureUiClick) {
  const onClick = (event: MouseEvent) => {
    try {
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest<HTMLElement>(interactiveSelector);
      if (!element || element.closest(".ph-no-capture")) return;
      if (element instanceof HTMLButtonElement && element.disabled) return;

      const { key, isExplicit } = trackedElementKey(element);
      const sectionKey = trackedSectionKey(element);

      capture({
        page_key: currentPageKey(),
        section_key: sectionKey,
        source_section: sectionKey,
        element_key: key,
        element_type: elementType(element),
        action_type: actionType(element),
        destination_type: destinationType(element),
        has_explicit_key: isExplicit,
      });
    } catch {
      // Analytics must never interfere with the interface.
    }
  };

  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}
