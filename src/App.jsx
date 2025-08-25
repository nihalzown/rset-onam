import { useState } from 'react';
import BulkRegistration from './components/BulkRegistration';
import DataExport from './components/DataExport';
import { FileText, Users, Shield, Calendar } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('register');

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Professional Navigation Header */}
      <nav className="bg-white shadow-xl border-b-4 border-gradient-to-r from-amber-400 to-orange-500">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-800">
                  RSET Onam 2025
                </h1>
                <p className="text-xs md:text-sm text-gray-600 font-medium">
                  Registration Portal
                </p>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1 md:space-x-2 bg-gray-100 rounded-lg md:rounded-xl p-1">
              <button
                onClick={() => setActiveTab('register')}
                className={`flex items-center space-x-1 md:space-x-2 px-3 md:px-6 py-2 md:py-3 rounded-md md:rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${
                  activeTab === 'register'
                    ? 'bg-white text-amber-700 shadow-md border border-amber-200'
                    : 'text-gray-600 hover:text-amber-700 hover:bg-white/50'
                }`}
              >
                <Users className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Team Registration</span>
                <span className="sm:hidden">Register</span>
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`flex items-center space-x-1 md:space-x-2 px-3 md:px-6 py-2 md:py-3 rounded-md md:rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${
                  activeTab === 'export'
                    ? 'bg-white text-amber-700 shadow-md border border-amber-200'
                    : 'text-gray-600 hover:text-amber-700 hover:bg-white/50'
                }`}
              >
                <Shield className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Admin Export</span>
                <span className="sm:hidden">Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub-navigation info bar */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Registration Deadline: August 26, 2025</span>
                </span>
                <span className="hidden md:block">•</span>
                <span className="hidden md:flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>30 participants per house</span>
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>All fields required</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {activeTab === 'register' ? <BulkRegistration /> : <DataExport />}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200/50 px-4 md:px-8 py-4 md:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600 font-medium text-sm md:text-base">
              RSET Onam Procession 2025 - Official Registration Portal
            </p>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              Powered by RSET Student Council
            </p>
          </div>
                </div>
      </footer>
    </div>
  );
}

export default App;

