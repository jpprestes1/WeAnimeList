type Screen = "dashboard" | "review";

type SideRailProps = {
  screen: Screen;
  onScreenChange: (screen: Screen) => void;
};

export function SideRail({ screen, onScreenChange }: SideRailProps) {
  return (
    <aside className="side-rail">
      <div className="brand-dot">WA</div>

      <nav className="side-rail-nav" aria-label="Primary">
        <button className="rail-btn" type="button" aria-label="Favorites">
          FV
        </button>
        <button
          className={`rail-btn ${screen === "dashboard" ? "active" : ""}`}
          type="button"
          onClick={() => onScreenChange("dashboard")}
          aria-label="Anime social dashboard"
        >
          DB
        </button>
        <button
          className={`rail-btn ${screen === "review" ? "active" : ""}`}
          type="button"
          onClick={() => onScreenChange("review")}
          aria-label="Create new anime review"
        >
          RV
        </button>
        <button className="rail-btn" type="button" aria-label="Groups">
          GP
        </button>
      </nav>

      <button
        className="rail-btn rail-btn-bottom"
        type="button"
        aria-label="Settings"
      >
        ST
      </button>
    </aside>
  );
}
