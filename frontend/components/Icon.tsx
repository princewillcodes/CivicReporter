type IconName =
  | "home" | "map" | "file" | "bell" | "user" | "plus" | "pin" | "chat" | "arrow"
  | "road" | "bin" | "water" | "light" | "drop" | "more" | "camera"
  | "chevron" | "check" | "clock" | "info" | "search" | "close" | "thumb";

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" /></>,
    map: <><path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" /><path d="M9 3v15M15 6v15" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    user: <><circle cx="12" cy="8" r="3" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>, pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>, chat: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.7 8.7 0 0 1-3.5-.8L4 20l1.8-3A7.2 7.2 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>, road: <><path d="M5 20 9 4M19 20 15 4M10 16h4M9 12h6M8 8h8" /></>,
    bin: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" /></>,
    water: <><path d="M12 3S6 10 6 14a6 6 0 0 0 12 0c0-4-6-11-6-11Z" /></>, light: <><path d="M9 18h6M10 22h4M8 14a6 6 0 1 1 8 0c-.8.7-1 1.6-1 3H9c0-1.4-.2-2.3-1-3Z" /></>,
    drop: <><path d="M12 2S6 9 6 14a6 6 0 0 0 12 0c0-5-6-12-6-12Z" /><path d="M9 15a3 3 0 0 0 3 3" /></>, more: <><circle cx="6" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="18" cy="12" r="1" /></>,
    camera: <><path d="M4 7h3l2-2h6l2 2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" /><circle cx="12" cy="13" r="3" /></>,
    chevron: <path d="m6 9 6 6 6-6" />, check: <path d="m5 12 4 4L19 6" />, clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>, search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>, close: <><path d="m6 6 12 12M18 6 6 18" /></>, thumb: <><path d="M7 10v10M4 10h3v10H4zM7 10l3-7c1.5 0 2 1 2 2v3h5.5a2 2 0 0 1 2 2l-1 6a2 2 0 0 1-2 2H7" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}
