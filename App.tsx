import React from 'react';
import { useGemData } from './hooks/useGemData';
import { ColorAnalysisCard } from './components/ColorAnalysisCard';
import { IndividualGemCard } from './components/IndividualGemCard';
import { CORRUPTED_VARIANTS } from './types';

const App: React.FC = () => {
  const { analyses, loading, error, league } = useGemData();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <svg className="loading-state__spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p>Reading the latest gem prices from the market...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-state" role="alert">
          <strong>Market data unavailable</strong>
          <span>{error}</span>
        </div>
      );
    }

    return (
      <div className="analysis-stack">
        <ColorAnalysisCard
          eyebrow="A · RANDOM BY COLOUR"
          title="Random uncorrupted transfigured gem"
          description="Transform a Skill Gem into a random Transfigured Gem of the same colour. Ordinary input gems are treated as free because Lilly sells them."
          data={analyses.randomUncorruptedByColor}
        />

        <IndividualGemCard data={analyses.specificTransfigure} />

        <section className="analysis-block">
          <div className="analysis-block__heading">
            <div className="section-token">C</div>
            <div>
              <p className="section-kicker">CORRUPTED TRANSMUTATION</p>
              <h2>Random corrupted transfigured gem</h2>
              <p>Compare the expected return after buying the cheapest eligible corrupted transfigured input.</p>
            </div>
            <span className="formula-chip">EV − INPUT</span>
          </div>
          <div className="variant-grid">
            {CORRUPTED_VARIANTS.map((variant) => (
              <ColorAnalysisCard
                key={variant}
                eyebrow={`C · ${variant}`}
                title={`Corrupted ${variant} pools`}
                description={`Random corrupted Transfigured Gem of the same colour for ${variant} gems.`}
                data={analyses.randomCorruptedTransfiguredByColor[variant]}
              />
            ))}
          </div>
        </section>

        <section className="analysis-block">
          <div className="analysis-block__heading">
            <div className="section-token">D</div>
            <div>
              <p className="section-kicker">CORRUPTED BASE GEMS</p>
              <h2>Random corrupted ordinary gem</h2>
              <p>Compare corrupted ordinary-gem outcomes while excluding Vaal and support gems.</p>
            </div>
            <span className="formula-chip">EV − INPUT</span>
          </div>
          <div className="variant-grid">
            {CORRUPTED_VARIANTS.map((variant) => (
              <ColorAnalysisCard
                key={variant}
                eyebrow={`D · ${variant}`}
                title={`Corrupted ${variant} pools`}
                description={`Random corrupted base Skill Gem of the same colour for ${variant} gems.`}
                data={analyses.randomCorruptedBaseByColor[variant]}
              />
            ))}
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="app-shell">
      <div className="app-shell__glow" aria-hidden="true" />
      <div className="app-container">
        <header className="site-header">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true"><span>✦</span></div>
            <div>
              <p className="brand-eyebrow">THE FORBIDDEN VAULT · ECONOMY TOOL</p>
              <h1>PoE <span>Labyrinth</span> Crafting Analyzer</h1>
              <p className="site-tagline">Find the crafts worth running before you step into the Aspirant's Trial.</p>
            </div>
          </div>
          <div className="league-pill">
            <span className="league-pill__status" aria-hidden="true" />
            <span className="league-pill__label">LIVE MARKET</span>
            <strong>{league ? `${league} League` : 'Current League'}</strong>
          </div>
        </header>

        <div className="header-divider" aria-hidden="true"><span /></div>

        <main>
          <div className="dashboard-intro">
            <div>
              <p className="section-kicker">LABYRINTH ECONOMY</p>
              <h2>Read the market before you craft.</h2>
              <p>Expected values are calculated from live gem prices and grouped by the outcomes each Labyrinth craft can produce.</p>
            </div>
            <div className="intro-legend" aria-label="Analyzer legend">
              <span><i className="legend-dot legend-dot--gold" /> PROFITABLE RETURN</span>
              <span><i className="legend-dot legend-dot--red" /> INPUT COST</span>
            </div>
          </div>
          {renderContent()}
        </main>

        <footer className="site-footer">
          <span>Not affiliated with Grinding Gear Games.</span>
          <span>Support and Vaal gems are excluded.</span>
          <span>Prices sourced from the public poe.ninja API.</span>
        </footer>
      </div>
    </div>
  );
};

export default App;
