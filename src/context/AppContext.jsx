import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const [selectedDepartment, setSelectedDepartment] = useState(() => {
    return localStorage.getItem('selectedDepartment') || '';
  });
  
  const [selectedYear, setSelectedYear] = useState(() => {
    return localStorage.getItem('selectedYear') || '';
  });

  useEffect(() => {
    if (selectedDepartment) {
      localStorage.setItem('selectedDepartment', selectedDepartment);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    if (selectedYear) {
      localStorage.setItem('selectedYear', selectedYear);
    }
  }, [selectedYear]);

  const updateDepartment = (dept) => {
    setSelectedDepartment(dept);
  };

  const updateYear = (year) => {
    setSelectedYear(year);
  };

  const clearSelection = () => {
    setSelectedDepartment('');
    setSelectedYear('');
    localStorage.removeItem('selectedDepartment');
    localStorage.removeItem('selectedYear');
  };

  return (
    <AppContext.Provider
      value={{
        selectedDepartment,
        selectedYear,
        updateDepartment,
        updateYear,
        clearSelection
      }}
    >
      {children}
    </AppContext.Provider>
  );
};