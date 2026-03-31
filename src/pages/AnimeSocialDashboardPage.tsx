import { AnimePosterCard } from "../components/common/AnimePosterCard";
import { RatingStars } from "../components/common/RatingStars";
import { useI18n } from "../i18n/I18nProvider";
import "../styles/dashboard.css";

type FriendAnime = {
  title: string;
  image: string;
  rating: number;
};

type FriendBlock = {
  initials: string;
  name: string;
  lastSeenHours: number;
  accent: string;
  list: FriendAnime[];
};

const friendBlocks: FriendBlock[] = [
  {
    initials: "IU",
    name: "Iuri",
    lastSeenHours: 2,
    accent: "magenta",
    list: [
      {
        title: "Berserk",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB8Xrio8AtlzAIV3wJX-nQ7FHpTEVLw7CwFaz7ez7mv_pZYfRSrw1XKMLxRiTC6RJFtRBq13llzVAiqOnnT69k3h9-loQOAbOWPt3c6-J9rkjnmasaSikpazOjMt9XsHE_LheIPVfmIi3NfunBloh5iMKz7LiztAv5JvNUy95eArYCvypgqCQEjaf7RG_xccQ1g5L0Cgx5HudhZuv8bM3d5lvBAeCBAAULK5qVKhe6UfqLa7dDuetd_uCK0GYFK12wV8hJTqs-7MTCv",
        rating: 4,
      },
      {
        title: "Jujutsu Kaisen",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCIffsFeRwg33y1VSo_5wVa3LFS_8sKMdK6jsMUc6j0zc9At2RyRoKt5KCdr5vSWwlShQa3XMbn1wD_hQIH3Bxr9SyNrKsFPJX6FWAjiHnf6Dd7OH-Ww1yByc7IBt0hTh8MQgYhkby5sRpHXJJoHSDgZie5VkJ7BP7mSevjS7gTVFjWCEWlQgmtilywI6vkqCQGtjP2poOhUYPjPI3slmHjlNg7pn13qD8l6Kqpb2XVDs8cli21va9md_ye2HDRWRKHkfxYbYrjgKLH",
        rating: 4,
      },
      {
        title: "Attack on Titan",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAvnZGk8vKGjjT_okKiegyblYfqWA5Q3HhfVx8lzvEZJesNMAr9wL9ZEYDdJVxFdyYtlgyYAoMrL_3owSQjmG7IfO-c6qpLiNAKvh87JymrcGBTQmqkm4s4RURABTEji-hhtUHq0VY1miSXzJ-6dCDkGQ2JaxmTcx1Sz-GAMZbFN0BY7qHiAfbtmfg-MmhB7yKiDYIWnjgG_QctoS1DmPFOas6rj952PwHpMwTNcZsABU6fgct-na_EVrRzm_nbG8yT_BX-ZCf1D40L",
        rating: 5,
      },
    ],
  },
  {
    initials: "BA",
    name: "Batata",
    lastSeenHours: 5,
    accent: "green",
    list: [
      {
        title: "Demon Slayer",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDQtgmAkTfBey1TRmmH6KLu6FMjsUexLO_a4XBiYwtpUZcHJs-8XVpNX_brvxuRzX1li5sSQ1G0WVSVK3aYR1o0KquS-rj8rmdIke3r3R1Iy3zl3Qtt1Sdf7HNOX0aaYOPgFeCbBu0_1BxNl795pSv087mTFAPatSntkTrMPjjpRXijxC7tZKR0DEdC1TfBmWPS5gHmyEIevE473WZlobelfMbWZ2KvfPvfKtf4osaOBgELgr9O0fUCmPL66lbm5_Uo05UB2NsiVAb_",
        rating: 5,
      },
      {
        title: "Entertainment District",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDQtgmAkTfBey1TRmmH6KLu6FMjsUexLO_a4XBiYwtpUZcHJs-8XVpNX_brvxuRzX1li5sSQ1G0WVSVK3aYR1o0KquS-rj8rmdIke3r3R1Iy3zl3Qtt1Sdf7HNOX0aaYOPgFeCbBu0_1BxNl795pSv087mTFAPatSntkTrMPjjpRXijxC7tZKR0DEdC1TfBmWPS5gHmyEIevE473WZlobelfMbWZ2KvfPvfKtf4osaOBgELgr9O0fUCmPL66lbm5_Uo05UB2NsiVAb_",
        rating: 5,
      },
      {
        title: "One Piece",
        image:
          "https://images.unsplash.com/photo-1626544827763-d516dce335e2?auto=format&fit=crop&w=420&q=80",
        rating: 4,
      },
    ],
  },
];

const sideRatings = [
  { title: "Demon Slayer: Entertainment District", score: 5.0 },
  { title: "One Piece", score: 4.5 },
  { title: "Spy x Family", score: 4.0 },
  { title: "Attack on Titan", score: 5.0 },
  { title: "Jujutsu Kaisen", score: 3.5 },
];

export function AnimeSocialDashboardPage() {
  const { t } = useI18n();

  return (
    <section className="dashboard-page">
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>{t("dashboard.title")}</h1>
            <p>{t("dashboard.subtitle")}</p>
          </div>
          <div className="dashboard-actions">
            <button type="button">{t("dashboard.filter")}</button>
            <button type="button">{t("dashboard.grid")}</button>
          </div>
        </header>

        <div className="friend-columns">
          {friendBlocks.map((friend) => (
            <section key={friend.name} className="friend-block">
              <div className="friend-heading">
                <span className={`friend-dot ${friend.accent}`}>
                  {friend.initials}
                </span>
                <div>
                  <h2>{friend.name}</h2>
                  <p>
                    {t("dashboard.lastActivity")}:{" "}
                    {t("dashboard.hoursAgo", { count: friend.lastSeenHours })}
                  </p>
                </div>
              </div>

              <div className="friend-anime-grid">
                {friend.list.map((anime) => (
                  <AnimePosterCard
                    key={`${friend.name}-${anime.title}`}
                    title={anime.title}
                    image={anime.image}
                    rating={anime.rating}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <aside className="dashboard-side">
        <h3>{t("dashboard.friendsRatings")}</h3>
        <div className="active-friend">
          {t("dashboard.watchingNow", { name: "Batata" })}
        </div>
        <div className="review-list">
          {sideRatings.map((item) => (
            <article key={item.title} className="review-row">
              <div>
                <h4>{item.title}</h4>
                <RatingStars value={item.score} />
              </div>
              <strong>{item.score.toFixed(1)}</strong>
            </article>
          ))}
        </div>
      </aside>
    </section>
  );
}
