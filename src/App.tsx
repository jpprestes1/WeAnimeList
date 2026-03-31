import { useState } from "react";
import { SideRail } from "./components/layout/SideRail";
import { AnimeSocialDashboardPage } from "./pages/AnimeSocialDashboardPage";
import { CreateAnimeReviewPage } from "./pages/CreateAnimeReviewPage";
import "./styles/tokens.css";
import "./styles/app-layout.css";

function App() {
  const [screen, setScreen] = useState<"dashboard" | "review">("dashboard");

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
            Anime Social Dashboard
          </button>
          <button
            type="button"
            className={screen === "review" ? "active" : ""}
            onClick={() => setScreen("review")}
          >
            Create New Anime Review
          </button>
        </div>

        {screen === "dashboard" ? (
          <AnimeSocialDashboardPage />
        ) : (
          <CreateAnimeReviewPage />
        )}
      </main>
    </div>
  );
}

export default App;
