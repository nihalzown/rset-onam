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
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🌺</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  RSET Onam Procession 2025
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  Official Registration Portal
                </p>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('register')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'register'
                    ? 'bg-white text-amber-700 shadow-md border border-amber-200'
                    : 'text-gray-600 hover:text-amber-700 hover:bg-white/50'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Team Registration</span>
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'export'
                    ? 'bg-white text-amber-700 shadow-md border border-amber-200'
                    : 'text-gray-600 hover:text-amber-700 hover:bg-white/50'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>Admin Export</span>
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
                  <span>Registration Deadline: December 31, 2025</span>
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
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              © 2025 Rajagiri School of Engineering & Technology. All rights reserved.
            </p>
            <p className="text-xs mt-1">
              Onam Procession Registration Portal - Secure & Reliable
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
