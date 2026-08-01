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
        <div className="flex h-64 flex-col items-center justify-center text-gray-400">
          <svg className="-ml-1 mr-3 h-10 w-10 animate-spin text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-lg">Fetching latest gem data from poe.ninja...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="relative rounded-lg border border-red-600 bg-red-900 px-4 py-3 text-red-200" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="ml-2">{error}</span>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <ColorAnalysisCard
          title="Analysis A (1/0): Random Uncorrupted Transfigured (by Color)"
          description="Analyzes the profit from using Transform a Skill Gem to be a random Transfigured Gem of the same colour. Input cost is treated as 0 c because the ordinary gem can be bought from Lilly."
          data={analyses.randomUncorruptedByColor}
        />

        <IndividualGemCard data={analyses.specificTransfigure} />

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Analysis C: Random Corrupted Transfigured (by Color)</h2>
            <p className="mt-2 text-sm text-gray-400">
              These variants analyze corrupted transfigured outcomes. The input cost is the cheapest eligible corrupted transfigured gem in each colour pool.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {CORRUPTED_VARIANTS.map((variant) => (
              <ColorAnalysisCard
                key={variant}
                title={`Analysis C (${variant})`}
                description={`Random corrupted Transfigured Gem of the same colour for ${variant} gems.`}
                data={analyses.randomCorruptedTransfiguredByColor[variant]}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Analysis D: Random Corrupted Base Gem (by Color)</h2>
            <p className="mt-2 text-sm text-gray-400">
              These variants analyze corrupted ordinary-gem outcomes. Vaal gems and support gems are excluded from all analysis pools.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {CORRUPTED_VARIANTS.map((variant) => (
              <ColorAnalysisCard
                key={variant}
                title={`Analysis D (${variant})`}
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
    <div className="min-h-screen bg-gray-900 p-4 font-sans text-gray-200 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">PoE Labyrinth Crafting Analyzer</h1>
          <p className="mt-2 text-lg text-gray-400">Compare the profitability of Labyrinth gem-crafting options.</p>
          <p className="mt-1 text-xs text-gray-500">Data from {league ? `${league} League` : 'the current league'}</p>
        </header>
        <main>{renderContent()}</main>
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>This tool is not affiliated with or endorsed by Grinding Gear Games.</p>
          <p>Support gems and Vaal gems are excluded from the analysis pools.</p>
          <p>All data is sourced from the public poe.ninja API.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
