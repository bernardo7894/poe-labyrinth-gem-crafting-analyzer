
import React from 'react';
import { useGemData } from './hooks/useGemData';
import { ColorAnalysisCard } from './components/ColorAnalysisCard';
import { IndividualGemCard } from './components/IndividualGemCard';

const App: React.FC = () => {
  const { colorAnalysis, individualGemAnalysis, loading, error } = useGemData();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg">Fetching latest gem data from poe.ninja...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ColorAnalysisCard data={colorAnalysis} />
        </div>
        <div className="lg:col-span-2">
          <IndividualGemCard data={individualGemAnalysis} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            PoE Labyrinth Gem Analyzer
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Find the most profitable gems for Labyrinth Transfiguration crafts.
          </p>
          <p className="text-xs text-gray-500 mt-1">Data from Keepers League</p>
        </header>
        <main>
          {renderContent()}
        </main>
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>This tool is not affiliated with or endorsed by Grinding Gear Games.</p>
          <p>All data is sourced from the public poe.ninja API.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
