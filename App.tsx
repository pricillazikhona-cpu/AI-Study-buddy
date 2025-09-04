import React, { useState } from 'react';
import { StudyBuddyChat } from './components/StudyBuddyChat';
import { DocumentSummarizer } from './components/DocumentSummarizer';
import { ImageAnalyzer } from './components/ImageAnalyzer';

type Tab = 'chat' | 'document' | 'image';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <StudyBuddyChat />;
      case 'document':
        return <DocumentSummarizer />;
      case 'image':
        return <ImageAnalyzer />;
      default:
        return <StudyBuddyChat />;
    }
  };

  const TabButton: React.FC<{ tabName: Tab; label: string }> = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-lg font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-400 ${
        activeTab === tabName ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      aria-pressed={activeTab === tabName}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-transparent text-white font-sans">
      <header className="bg-black/40 border-b border-gray-700/80 py-4 shadow-lg backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold text-teal-300 tracking-wider">Alex</h1>
            <p className="text-lg text-gray-300">Your AI Study Buddy</p>
          </div>
          <nav className="flex justify-center items-center gap-4">
            <TabButton tabName="chat" label="Study Buddy" />
            <TabButton tabName="document" label="Document Summary" />
            <TabButton tabName="image" label="Picture Analyzer" />
          </nav>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default App;