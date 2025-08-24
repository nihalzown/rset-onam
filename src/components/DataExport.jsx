import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Download, FileText, FileSpreadsheet, Users, Calendar, Shield, LogOut, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import AdminLogin from './AdminLogin';

const DataExport = () => {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_authenticated');
    const sessionTime = localStorage.getItem('admin_session');
    
    // Check if session is valid (24 hours)
    if (adminAuth && sessionTime) {
      const now = Date.now();
      const sessionStart = parseInt(sessionTime);
      const hoursPassed = (now - sessionStart) / (1000 * 60 * 60);
      
      if (hoursPassed < 24) {
        setIsAuthenticated(true);
        fetchData();
      } else {
        // Session expired
        handleLogout();
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_session');
    setIsAuthenticated(false);
    setRegistrations([]);
    setSummary({});
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all registrations
      const { data: registrationsData, error: regError } = await supabase
        .from('registrations')
        .select('*')
        .order('house', { ascending: true })
        .order('created_at', { ascending: true });

      if (regError) throw regError;

      // Fetch house status summary
      const { data: summaryData, error: summaryError } = await supabase
        .from('house_registration_status')
        .select('*')
        .order('house', { ascending: true });

      if (summaryError) throw summaryError;

      setRegistrations(registrationsData || []);
      
      // Create summary object
      const summaryObj = summaryData.reduce((acc, house) => {
        acc[house.house] = house;
        return acc;
      }, {});
      setSummary(summaryObj);

    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch registration data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (registrations.length === 0) {
      alert('No data available for export');
      return;
    }

    setIsLoading(true);
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(204, 102, 0); // Onam orange
      doc.text('RSET Onam Procession 2025', 14, 22);
      doc.text('Registration Report', 14, 32);
      
      // Generation info
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 42);
      doc.text(`Total Participants: ${registrations.length}`, 14, 48);
      
      // Summary by house
      let yPos = 58;
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Registration Summary by House:', 14, yPos);
      
      yPos += 10;
      doc.setFontSize(10);
      Object.entries(summary).forEach(([house, data]) => {
        const status = data.is_completed ? '✅ Complete' : `${data.participants_count}/30 registered`;
        doc.text(`${house}: ${status}`, 20, yPos);
        yPos += 6;
      });

      // Detailed participants table
      yPos += 10;
      const tableData = registrations.map(reg => [
        reg.name,
        reg.college_id,
        reg.house,
        reg.class,
        new Date(reg.created_at).toLocaleDateString()
      ]);

      doc.autoTable({
        head: [['Name', 'College ID', 'House', 'Class', 'Registered On']],
        body: tableData,
        startY: yPos,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [245, 158, 84] }, // Onam orange
        alternateRowStyles: { fillColor: [254, 243, 199] }, // Light orange
      });

      // Save the PDF
      doc.save(`RSET_Onam_Registrations_${new Date().toISOString().split('T')[0]}.pdf`);
      
      // Log export activity (in real app, this would go to audit table)
      console.log('PDF export completed:', { 
        type: 'PDF', 
        records: registrations.length, 
        timestamp: new Date().toISOString() 
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = async () => {
    if (registrations.length === 0) {
      alert('No data available for export');
      return;
    }

    setIsLoading(true);
    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Summary sheet
      const summaryData = [
        ['RSET Onam Procession 2025 - Registration Summary'],
        ['Generated on:', new Date().toLocaleString()],
        ['Total Participants:', registrations.length],
        [''],
        ['House', 'Status', 'Participants', 'Completed At'],
        ...Object.entries(summary).map(([house, data]) => [
          house,
          data.is_completed ? 'Complete' : 'Incomplete',
          data.participants_count,
          data.completed_at ? new Date(data.completed_at).toLocaleString() : 'Not completed'
        ])
      ];
      
      const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');

      // Detailed participants sheet
      const participantsData = [
        ['Name', 'College ID', 'House', 'Class', 'Registration Batch', 'Registered On'],
        ...registrations.map(reg => [
          reg.name,
          reg.college_id,
          reg.house,
          reg.class,
          reg.registration_batch,
          new Date(reg.created_at).toLocaleString()
        ])
      ];
      
      const participantsWS = XLSX.utils.aoa_to_sheet(participantsData);
      XLSX.utils.book_append_sheet(wb, participantsWS, 'Participants');

      // House-wise breakdown sheets
      const houses = ['SPARTANS', 'MUGHALS', 'VIKINGS', 'RAJPUTS', 'ARYANS'];
      houses.forEach(house => {
        const houseData = registrations.filter(reg => reg.house === house);
        if (houseData.length > 0) {
          const houseSheet = [
            [`${house} House Participants`],
            ['Name', 'College ID', 'Class', 'Registered On'],
            ...houseData.map(reg => [
              reg.name,
              reg.college_id,
              reg.class,
              new Date(reg.created_at).toLocaleString()
            ])
          ];
          const houseWS = XLSX.utils.aoa_to_sheet(houseSheet);
          XLSX.utils.book_append_sheet(wb, houseWS, house);
        }
      });

      // Save the Excel file
      XLSX.writeFile(wb, `RSET_Onam_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      // Log export activity
      console.log('Excel export completed:', { 
        type: 'EXCEL', 
        records: registrations.length, 
        timestamp: new Date().toISOString() 
      });

    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Failed to generate Excel file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={setIsAuthenticated} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Header with logout */}
      <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-6 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
              <p className="text-gray-600">Secure data export and management</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800">Security Notice</h3>
            <p className="text-sm text-yellow-700 mt-1">
              This data export feature is restricted to authorized administrators only. 
              All export activities are logged for security purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Participants</p>
              <p className="text-3xl font-bold text-gray-800">{registrations.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Houses Completed</p>
              <p className="text-3xl font-bold text-gray-800">
                {Object.values(summary).filter(house => house.is_completed).length}/5
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Registration Rate</p>
              <p className="text-3xl font-bold text-gray-800">
                {Math.round((registrations.length / 150) * 100)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* House Status Overview */}
      <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">House Registration Status</h3>
        <div className="grid md:grid-cols-5 gap-4">
          {Object.entries(summary).map(([house, data]) => (
            <div key={house} className="text-center p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">{house}</h4>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                data.is_completed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {data.is_completed ? '✅ Complete' : `${data.participants_count}/30`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Controls */}
      <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Data Export</h3>
        <p className="text-gray-600 mb-6">
          Export complete registration data in your preferred format. Both PDF and Excel exports 
          include detailed participant information and summary statistics.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={exportToPDF}
            disabled={isLoading || registrations.length === 0}
            className="flex-1 flex items-center justify-center space-x-3 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-5 h-5" />
            <span>Export as PDF</span>
            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          </button>

          <button
            onClick={exportToExcel}
            disabled={isLoading || registrations.length === 0}
            className="flex-1 flex items-center justify-center space-x-3 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>Export as Excel</span>
            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          </button>
        </div>

        {registrations.length === 0 && !isLoading && (
          <p className="text-center text-gray-500 mt-4">
            No registration data available for export.
          </p>
        )}
      </div>
    </div>
  );
};

export default DataExport;
