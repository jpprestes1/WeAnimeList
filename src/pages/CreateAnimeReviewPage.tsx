import "../styles/review.css";

const recentReviews = [
  {
    user: "Iuri",
    when: "2 hours ago",
    score: 9.5,
    text: "Attack on Titan: The Final Season is a complete rollercoaster.",
  },
  {
    user: "Batata",
    when: "5 hours ago",
    score: 7.0,
    text: "One Piece has peaks and valleys, but Wano still looks amazing.",
  },
  {
    user: "Jao",
    when: "1 day ago",
    score: 8.2,
    text: "Vinland Saga S2 is subtle, mature and emotionally sharp.",
  },
  {
    user: "Caio",
    when: "2 days ago",
    score: 6.5,
    text: "Tokyo Revengers keeps me curious, even when logic stretches.",
  },
];

export function CreateAnimeReviewPage() {
  return (
    <section className="review-page">
      <header className="review-header">
        <div>
          <h1>Create New Review</h1>
          <p>Share your thoughts on what you watched recently.</p>
        </div>
        <div className="review-header-actions">
          <button type="button" className="ghost">
            Cancel
          </button>
          <button type="button" className="primary">
            Publish Review
          </button>
        </div>
      </header>

      <div className="review-layout">
        <div className="review-main">
          <section className="panel">
            <h2>Select Anime</h2>
            <input type="text" placeholder="Search for anime title..." />
            <div className="selected-anime">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDn6o3MSSAa54Xx9fY0IBiSMgYUJaRUA5q15QpTY4pb_k37wSrxOk1Njb79VxCuDyZ6ZjLWUBTmWS5nGC93BcIedUI8DbFKj7A6Gdx7AZBqTOjgiL25xEOibUyRk2FXdk7-Yz-t9ZWFgiWnOkF7Kj9Pfry5D4wy8Jo4hyufFeQf_lP9GetwyGlETYPrnVKajGjJ7qgfg0uYtLjSWHSfsoMzAggExhzNXhl17mmkSqwt7uDtWRaWvRJDtqk9_Sd12_DkSo0tyL-bqWkS"
                alt="Kimetsu no Yaiba"
              />
              <div>
                <h3>Kimetsu no Yaiba: Katanakaji no Sato-hen</h3>
                <p>Season 3 - 2023 - 11 Episodes</p>
                <div className="chip-row">
                  <span>Action</span>
                  <span>Fantasy</span>
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <h2>Rating and Review</h2>
            <label htmlFor="review-title">Review Title (Optional)</label>
            <input
              id="review-title"
              type="text"
              placeholder="A visual masterpiece with pacing issues"
            />
            <label htmlFor="review-content">Your Thoughts</label>
            <textarea
              id="review-content"
              rows={7}
              placeholder="Write your in-depth review here. No spoilers please!"
            />
            <p className="small-muted">
              Markdown supported - 0 / 5000 characters
            </p>
          </section>

          <section className="recent-panel">
            <h2>Recent Reviews from Your Groups</h2>
            <div className="recent-grid">
              {recentReviews.map((item) => (
                <article key={item.user} className="recent-card">
                  <div className="recent-head">
                    <strong>{item.user}</strong>
                    <span>{item.when}</span>
                    <b>{item.score.toFixed(1)}</b>
                  </div>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="review-side">
          <section className="panel sticky">
            <h2>Share With</h2>
            <label htmlFor="group">Select Group</label>
            <select id="group" defaultValue="All Friends">
              <option>All Friends</option>
              <option>Shonen Enthusiasts</option>
              <option>Slice of Life Club</option>
              <option>Weekend Watchers</option>
            </select>
            <div className="toggle-row">
              <span>Contains Spoilers</span>
              <input type="checkbox" />
            </div>
            <div className="toggle-row">
              <span>Allow Comments</span>
              <input type="checkbox" defaultChecked />
            </div>
          </section>

          <section className="tips-card">
            <h3>Review Tips</h3>
            <ul>
              <li>Mention specific episodes that stood out.</li>
              <li>Discuss animation quality and sound design.</li>
              <li>Keep spoilers hidden or marked.</li>
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}
