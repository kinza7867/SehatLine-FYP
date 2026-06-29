// context/AppointmentContext.js
import React, { createContext, useState, useContext } from 'react';

const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState(null);

  const addAppointment = (appointment) => {
    setAppointments(prev => [...prev, appointment]);
    setNewAppointment(appointment);
    
    // Clear new appointment highlight after 4 seconds
    setTimeout(() => {
      setNewAppointment(null);
    }, 4000);
  };

  const clearAppointments = () => {
    setAppointments([]);
  };

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        setAppointments,
        newAppointment,
        setNewAppointment,
        addAppointment,
        clearAppointments,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within AppointmentProvider');
  }
  return context;
};