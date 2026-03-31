import { useState } from "react";
import { SideRail } from "./components/layout/SideRail";
import { AnimeSocialDashboardPage } from "./pages/AnimeSocialDashboardPage";
import { CreateAnimeReviewPage } from "./pages/CreateAnimeReviewPage";
import { AnimeGuessrPage } from "./pages/AnimeGuessrPage";
import { useI18n } from "./i18n/I18nProvider";
import "./styles/tokens.css";
import "./styles/app-layout.css";

function App() {
  const { t } = useI18n();

  const [screen, setScreen] = useState<"dashboard" | "review" | "guessr">(
    "dashboard",
  );

  return (
    <div className="app-shell">
      <SideRail screen={screen} onScreenChange={setScreen} />

      <main className="page-wrap">
        <div className="screen-switch">
          <button
            type="button"
            className={screen === "dashboard" ? "active" : ""}
            onClick={() => setScreen("dashboard")}
          >
            {t("app.dashboard")}
          </button>
          <button
            type="button"
            className={screen === "review" ? "active" : ""}
            onClick={() => setScreen("review")}
          >
            {t("app.review")}
          </button>
          <button
            type="button"
            className={screen === "guessr" ? "active" : ""}
            onClick={() => setScreen("guessr")}
          >
            {t("app.guessr")}
          </button>
        </div>

        {screen === "dashboard" && <AnimeSocialDashboardPage />}
        {screen === "review" && <CreateAnimeReviewPage />}
        {screen === "guessr" && <AnimeGuessrPage />}
      </main>
    </div>
  );
}

export default App;
