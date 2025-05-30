// frontend/services/appointment-service.js

// AppointmentService handles creation, retrieval, and cancellation of appointments
const AppointmentService = {
    // Fetch all appointments for the current user
    list: function(success, error) {
      return RestClient.get("/appointments", success, error);
    },
  
    // Create a new appointment
    create: function(bookingData, success, error) {
      return RestClient.post("/appointments", bookingData, success, error);
    },
  
    // Cancel an existing appointment by ID
    cancel: function(appointmentId, success, error) {
      return RestClient.delete(`/appointments/${appointmentId}`, success, error);
    },
  
    // Alias so legacy code using AppointmentService.delete still works
    delete: function(appointmentId, success, error) {
      return RestClient.delete(`/appointments/${appointmentId}`, success, error);
    },
  
    // Confirm an appointment (if your API supports it)
    confirm: function(appointmentId, success, error) {
      return RestClient.put(`/appointments/${appointmentId}`, { status: 'confirmed' }, success, error);
    }
  };
  
  // Expose the service under both names for compatibility
  window.AppointmentService = AppointmentService;
  window.BookingService = AppointmentService;