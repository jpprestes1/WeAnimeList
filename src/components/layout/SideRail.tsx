import { useI18n } from "../../i18n/I18nProvider";

type Screen = "dashboard" | "review" | "guessr";

type SideRailProps = {
  screen: Screen;
  onScreenChange: (screen: Screen) => void;
};

export function SideRail({ screen, onScreenChange }: SideRailProps) {
  const { locale, setLocale, t } = useI18n();

  return (
    <aside className="side-rail">
      <div className="brand-dot">WA</div>

      <nav className="side-rail-nav" aria-label="Primary">
        <button
          className="rail-btn"
          type="button"
          aria-label={t("rail.favorites")}
        >
          FV
        </button>
        <button
          className={`rail-btn ${screen === "dashboard" ? "active" : ""}`}
          type="button"
          onClick={() => onScreenChange("dashboard")}
          aria-label={t("rail.dashboard")}
        >
          DB
        </button>
        <button
          className={`rail-btn ${screen === "review" ? "active" : ""}`}
          type="button"
          onClick={() => onScreenChange("review")}
          aria-label={t("rail.review")}
        >
          RV
        </button>
        <button
          className={`rail-btn ${screen === "guessr" ? "active" : ""}`}
          type="button"
          onClick={() => onScreenChange("guessr")}
          aria-label={t("rail.guessr")}
        >
          GS
        </button>
        <button
          className="rail-btn"
          type="button"
          aria-label={t("rail.groups")}
        >
          GP
        </button>
      </nav>

      <div className="rail-footer">
        <label className="rail-language" htmlFor="rail-language-select">
          <span className="visually-hidden">{t("app.languageLabel")}</span>
          <select
            id="rail-language-select"
            value={locale}
            onChange={(event) => setLocale(event.target.value as "en" | "pt")}
            aria-label={t("app.languageLabel")}
          >
            <option value="pt">PT</option>
            <option value="en">EN</option>
          </select>
        </label>

        <button
          className="rail-btn rail-btn-bottom"
          type="button"
          aria-label={t("rail.settings")}
        >
          ST
        </button>
      </div>
    </aside>
  );
}
