import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { batchWriteToFirestore } from '../config/firebase';
import { HOUSES, CLASS_NAMES, HOUSE_COLORS } from '../constants';
import { Users, CheckCircle, AlertCircle, Save, Clock, Shield, Target } from 'lucide-react';

const BulkRegistration = () => {
  const [selectedHouse, setSelectedHouse] = useState('');
  const [team, setTeam] = useState(
    Array.from({ length: 30 }, () => ({ 
      name: '', 
      college_id: '', 
      class: CLASS_NAMES[0] 
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [housesStatus, setHousesStatus] = useState({});
  const [errors, setErrors] = useState([]);
  const [progress, setProgress] = useState({ filled: 0, total: 30 });

  // Calculate progress whenever team changes
  useEffect(() => {
    const filled = team.filter(p => p.name.trim() && p.college_id.trim()).length;
    setProgress({ filled, total: 30 });
  }, [team]);

  // Fetch house registration status on component mount
  useEffect(() => {
    fetchHouseStatus();
    
    // Set up real-time subscription for house status updates
    const channel = supabase
      .channel('house_status_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'house_registration_status' },
        () => {
          fetchHouseStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchHouseStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('house_registration_status')
        .select('*');

      if (error) throw error;
      
      // Convert array to object for easier access
      const statusObj = {};
      data.forEach(house => {
        statusObj[house.house] = house;
      });
      
      setHousesStatus(statusObj);
    } catch (error) {
      console.error('Error fetching house status:', error);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedTeam = [...team];
    updatedTeam[index][field] = value;
    setTeam(updatedTeam);
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    const newErrors = [];

    // Check if house is selected
    if (!selectedHouse) {
      newErrors.push('Please select a house before proceeding');
    }

    // Check if house already completed
    if (housesStatus[selectedHouse]?.is_completed) {
      newErrors.push(`${selectedHouse} has already completed their registration (30/30 participants)`);
    }

    // Check if all fields are filled
    team.forEach((participant, index) => {
      if (!participant.name.trim()) {
        newErrors.push(`Row ${index + 1}: Participant name is required`);
      }
      if (!participant.college_id.trim()) {
        newErrors.push(`Row ${index + 1}: College ID is required`);
      }
      if (participant.name.trim().length < 2) {
        newErrors.push(`Row ${index + 1}: Name must be at least 2 characters long`);
      }
    });

    // Check for duplicate college IDs within the form
    const collegeIds = team.map(p => p.college_id.trim().toUpperCase()).filter(id => id);
    const duplicates = collegeIds.filter((id, index) => collegeIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      newErrors.push(`Duplicate College IDs found: ${[...new Set(duplicates)].join(', ')}`);
    }

    // Validate College ID format (basic validation)
    const invalidIds = team.filter(p => p.college_id.trim() && !/^[A-Z0-9]+$/i.test(p.college_id.trim()));
    if (invalidIds.length > 0) {
      newErrors.push('College IDs should contain only letters and numbers');
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      // Generate registration batch ID
      const registrationBatch = crypto.randomUUID();
      
      // Prepare data with house information and batch ID
      const teamWithHouse = team.map(participant => ({
        ...participant,
        house: selectedHouse,
        name: participant.name.trim(),
        college_id: participant.college_id.trim().toUpperCase(),
        registration_batch: registrationBatch
      }));

      // Primary write to Supabase
      const { error: supabaseError } = await supabase
        .from('registrations')
        .insert(teamWithHouse);

      if (supabaseError) {
        if (supabaseError.message.includes('duplicate key')) {
          throw new Error('One or more College IDs are already registered. Please check and try again.');
        }
        throw new Error(`Registration failed: ${supabaseError.message}`);
      }

      // Secondary write to Firebase (backup)
      try {
        await batchWriteToFirestore(teamWithHouse);
      } catch (firebaseError) {
        console.warn('Firebase backup failed (non-critical):', firebaseError);
      }

      // Success - reset form
      setTeam(Array.from({ length: 30 }, () => ({ 
        name: '', 
        college_id: '', 
        class: CLASS_NAMES[0] 
      })));
      setSelectedHouse('');
      
      // Show success message
      alert(`Success! Registered ${teamWithHouse.length} participants for ${selectedHouse} house.`);
      
    } catch (error) {
      console.error('Submission error:', error);
      setErrors([error.message]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHouseComplete = (house) => housesStatus[house]?.is_completed || false;
  const getHouseCount = (house) => housesStatus[house]?.participants_count || 0;

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 min-h-screen">
      {/* Header Section */}
      <div className="text-center py-6 md:py-12 px-4">
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl md:rounded-3xl shadow-lg mb-4 md:mb-6">
          <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-4">
          Team Registration
        </h1>
        <div className="flex items-center justify-center space-x-2 mb-3 md:mb-4">
          <Shield className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
          <span className="text-sm md:text-base font-medium text-amber-700">
            Bulk Registration Portal
          </span>
        </div>
        <p className="text-sm md:text-lg text-gray-700 max-w-2xl mx-auto px-4">
          Register your complete team of 30 participants in one submission. 
          Select your house and fill in all participant details below.
        </p>
      </div>

        {/* House Status Dashboard */}
        <div className="bg-white rounded-2xl shadow-xl border border-amber-200 p-4 md:p-6 mb-6 md:mb-8 mx-4 md:mx-0">
          <div className="flex items-center space-x-2 mb-4 md:mb-6">
            <Target className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
            <h2 className="text-lg md:text-xl font-bold text-gray-800">House Registration Status</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            {HOUSES.map(house => {
              const count = getHouseCount(house);
              const isComplete = isHouseComplete(house);
              
              return (
                <div 
                  key={house}
                  className={`relative p-3 md:p-4 rounded-xl border-2 transition-all duration-200 ${
                    isComplete 
                      ? 'bg-green-50 border-green-300 shadow-green-100' 
                      : 'bg-white border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <Shield className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm md:text-base">{house}</h3>
                    
                    <div className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                      isComplete 
                        ? 'bg-green-100 text-green-800' 
                        : count > 0 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isComplete ? (
                        <>
                          <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          Complete
                        </>
                      ) : (
                        <>
                          <Users className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          {count}/30
                        </>
                      )}
                    </div>
                  </div>
                  
                  {isComplete && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Registration Form Container */}
        <div className="px-4 md:px-0">
          {/* Registration Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-amber-200 overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Form Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 md:px-6 py-3 md:py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-white space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 md:w-6 md:h-6" />
                  <h3 className="text-lg md:text-xl font-bold">Team Registration Form</h3>
                </div>
                <div className="flex items-center space-x-2 md:space-x-4 text-xs md:text-sm">
                  <span className="flex items-center space-x-1">
                    <Users className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{progress.filled}/30 filled</span>
                  </span>
                  <div className="w-20 md:w-32 bg-amber-600 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.filled / progress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6">
              {/* House Selection */}
              <div className="mb-4 md:mb-6">
                <label className="block text-base md:text-lg font-semibold text-gray-800 mb-2 md:mb-3">
                  <span className="flex items-center space-x-2">
                    <Target className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                    <span>Select Your House</span>
                  </span>
                </label>
                <select
                  value={selectedHouse}
                  onChange={(e) => setSelectedHouse(e.target.value)}
                  className="w-full p-3 md:p-4 border-2 border-gray-300 rounded-xl focus:border-amber-500 focus:outline-none bg-white text-base md:text-lg"
                  disabled={isSubmitting}
                >
                  <option value="">Choose your house...</option>
                  {HOUSES.map(house => {
                    const isComplete = isHouseComplete(house);
                    
                    return (
                      <option 
                        key={house} 
                        value={house} 
                        disabled={isComplete}
                      >
                        {house} {isComplete ? '(Registration Complete)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Error Display */}
              {errors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <h4 className="font-semibold text-red-800">Please fix the following issues:</h4>
                  </div>
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Participants Table */}
              <div className="mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center space-x-2">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                  <span>Participant Details (30 Required)</span>
                </h3>
                
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto max-h-80 md:max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700 border-b border-gray-200">
                            #
                          </th>
                          <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700 border-b border-gray-200">
                            Name *
                          </th>
                          <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700 border-b border-gray-200">
                            College ID *
                          </th>
                          <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700 border-b border-gray-200">
                            Class
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.map((participant, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-amber-25 transition-colors">
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-500">
                              {index + 1}
                            </td>
                            <td className="px-2 md:px-4 py-2 md:py-3">
                              <input
                                type="text"
                                value={participant.name}
                                onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                placeholder="Enter full name"
                                className="w-full p-1.5 md:p-2 border border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none text-xs md:text-sm"
                                disabled={isSubmitting}
                              />
                            </td>
                            <td className="px-2 md:px-4 py-2 md:py-3">
                              <input
                                type="text"
                                value={participant.college_id}
                                onChange={(e) => handleInputChange(index, 'college_id', e.target.value)}
                                placeholder="College ID"
                                className="w-full p-1.5 md:p-2 border border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none text-xs md:text-sm uppercase"
                                disabled={isSubmitting}
                              />
                            </td>
                            <td className="px-2 md:px-4 py-2 md:py-3">
                              <select
                                value={participant.class}
                                onChange={(e) => handleInputChange(index, 'class', e.target.value)}
                                className="w-full p-1.5 md:p-2 border border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none text-xs md:text-sm"
                                disabled={isSubmitting}
                              >
                                {CLASS_NAMES.map(className => (
                                  <option key={className} value={className}>
                                    {className}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center pt-3 md:pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedHouse || isHouseComplete(selectedHouse) || progress.filled < 30}
                  className={`inline-flex items-center space-x-2 md:space-x-3 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-200 ${
                    isSubmitting || !selectedHouse || isHouseComplete(selectedHouse) || progress.filled < 30
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                      <span>Registering Team...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Submit Team Registration</span>
                    </>
                  )}
                </button>
                
                <p className="text-xs md:text-sm text-gray-500 mt-2 md:mt-3 px-4">
                  {progress.filled < 30 && `Please fill in ${30 - progress.filled} more participant(s) to submit.`}
                  {selectedHouse && isHouseComplete(selectedHouse) && 'This house has already completed registration.'}
                  {!selectedHouse && 'Please select a house to proceed.'}
                </p>
              </div>
            </div>
          </form>
        </div>
        </div>
    </div>
  );
};

export default BulkRegistration;
