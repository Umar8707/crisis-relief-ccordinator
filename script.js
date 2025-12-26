function showAlert(message) {
    alert(message);
  }
  
  function validateBookingForm() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    if (!name || !email) {
      showAlert('Please fill in all required fields.');
      return false;
    }
    showAlert('Booking submitted successfully!');
    return true;
  }
  
  function toggleSchedule() {
    const schedule = document.getElementById('schedule-table');
    schedule.classList.toggle('hidden');
  }
  
  function highlightSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  }
  
  function updateDateField() {
    const dateField = document.getElementById('travel-date');
    const today = new Date().toISOString().split('T')[0];
    dateField.value = today;
  }
  
  window.onload = updateDateField;
  