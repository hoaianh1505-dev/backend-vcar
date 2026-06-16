// STATE MANAGEMENT
let state = {
  token: localStorage.getItem('token') || '',
  user: null,
  activeTab: 'overview',
  cars: [],
  bookings: [],
  currentBookingFilter: 'all'
};

const BASE_URL = ''; // Direct path relative to current domain

// DOM ELEMENTS
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginForm = document.getElementById('login-form');
const navItems = document.querySelectorAll('.nav-item');
const tabPanes = document.querySelectorAll('.tab-pane');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');
const btnLogout = document.getElementById('btn-logout');
const toastContainer = document.getElementById('toast-container');
const currentDateSpan = document.getElementById('current-date');

// USER PROFILE ELEMENTS
const userFullname = document.getElementById('user-fullname');
const userRole = document.getElementById('user-role');

// STATS ELEMENTS
const statTotalCars = document.getElementById('stat-total-cars');
const statAvailableCars = document.getElementById('stat-available-cars');
const statTotalBookings = document.getElementById('stat-total-bookings');
const statPendingBookings = document.getElementById('stat-pending-bookings');

// FLEETS / CARS ELEMENTS
const carsGridContainer = document.getElementById('cars-grid-container');
const searchCarsInput = document.getElementById('search-cars');
const btnAddCar = document.getElementById('btn-add-car');
const modalAddCar = document.getElementById('modal-add-car');
const formAddCar = document.getElementById('form-add-car');
const addFileInfo = document.getElementById('add-file-info');

// EDIT CAR ELEMENTS
const modalEditCar = document.getElementById('modal-edit-car');
const formEditCar = document.getElementById('form-edit-car');
const editFileInfo = document.getElementById('edit-file-info');

// BOOKINGS ELEMENTS
const bookingsTableBody = document.getElementById('bookings-table-body');
const bookingFilterButtons = document.querySelectorAll('.filter-btn');

// TOAST NOTIFICATIONS
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-circle';
  
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <div class="toast-content">${message}</div>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// DATE DISPLAY
function updateCurrentDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDateSpan.textContent = new Date().toLocaleDateString('en-US', options);
}

// ROUTING TABS
function switchTab(tabId) {
  state.activeTab = tabId;
  
  // Update nav item active states
  navItems.forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update tab pane active states
  tabPanes.forEach(pane => {
    if (pane.id === `tab-${tabId}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  // Update header text based on active tab
  if (tabId === 'overview') {
    pageTitle.textContent = 'Console Overview';
    pageSubtitle.textContent = 'Real-time statistics and activity logs.';
    fetchStats();
  } else if (tabId === 'cars') {
    pageTitle.textContent = 'Fleet Inventory';
    pageSubtitle.textContent = 'Add, modify, and delete fleet cars.';
    fetchCars();
  } else if (tabId === 'bookings') {
    pageTitle.textContent = 'Rental Bookings';
    pageSubtitle.textContent = 'Review, approve, and cancel booking requests.';
    fetchBookings();
  }
}

// Make switchTab global so button onclick handlers can use it
window.switchTab = switchTab;

// HTTP UTILITIES WITH AUTO AUTH HEADERS
async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  // Set headers
  const headers = { ...options.headers };
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }
  
  // If request is not FormData, default Content-Type to JSON
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const fetchOptions = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    
    if (!response.ok) {
      // If token expired or invalid, log out
      if (response.status === 401 && state.token) {
        logout();
        showToast('Session expired. Please log in again.', 'error');
        throw new Error('Unauthorized');
      }
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    if (error.message !== 'Unauthorized') {
      showToast(error.message, 'error');
    }
    throw error;
  }
}

// CHECK AUTHENTICATION ON PAGE LOAD
async function checkAuth() {
  if (state.token) {
    try {
      const response = await apiFetch('/auth/profile');
      if (response.success && response.data.role === 'admin') {
        state.user = response.data;
        userFullname.textContent = state.user.fullName;
        userRole.textContent = state.user.role.toUpperCase();
        
        // Show dashboard UI
        loginContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        
        // Load initial overview stats
        switchTab('overview');
      } else {
        // Normal users are not authorized to view the admin console
        logout();
        showToast('Access denied. Admin role required.', 'error');
      }
    } catch (error) {
      logout();
    }
  } else {
    // Show login screen
    loginContainer.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
  }
}

// LOGIN SUBMIT
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.success) {
      if (response.data.user.role !== 'admin') {
        showToast('Access denied. Admin role required.', 'error');
        return;
      }
      
      state.token = response.data.token;
      state.user = response.data.user;
      
      localStorage.setItem('token', state.token);
      
      userFullname.textContent = state.user.fullName;
      userRole.textContent = state.user.role.toUpperCase();
      
      loginContainer.classList.add('hidden');
      dashboardContainer.classList.remove('hidden');
      
      showToast('Login successful!', 'success');
      switchTab('overview');
    }
  } catch (error) {
    // Error is already alerted in apiFetch toast
  }
});

// LOGOUT
function logout() {
  state.token = '';
  state.user = null;
  localStorage.removeItem('token');
  loginContainer.classList.remove('hidden');
  dashboardContainer.classList.add('hidden');
  loginForm.reset();
}

btnLogout.addEventListener('click', () => {
  logout();
  showToast('Logged out successfully', 'info');
});

// FETCH METRICS FOR OVERVIEW
async function fetchStats() {
  try {
    const carsResponse = await apiFetch('/cars');
    const bookingsResponse = await apiFetch('/admin/bookings');

    if (carsResponse.success && bookingsResponse.success) {
      state.cars = carsResponse.data;
      state.bookings = bookingsResponse.data;

      const totalCars = state.cars.length;
      const availableCars = state.cars.filter(car => car.available).length;
      const totalBookings = state.bookings.length;
      const pendingBookings = state.bookings.filter(b => b.status === 'pending').length;

      statTotalCars.textContent = totalCars;
      statAvailableCars.textContent = availableCars;
      statTotalBookings.textContent = totalBookings;
      statPendingBookings.textContent = pendingBookings;
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

// FETCH CAR LIST
async function fetchCars() {
  carsGridContainer.innerHTML = `
    <div class="loading-state">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <p>Retrieving car listings...</p>
    </div>
  `;
  
  try {
    const response = await apiFetch('/cars');
    if (response.success) {
      state.cars = response.data;
      renderCars(state.cars);
    }
  } catch (error) {
    carsGridContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Failed to load fleet fleet cars.</p>
      </div>
    `;
  }
}

// RENDER CAR GRID
function renderCars(cars) {
  if (cars.length === 0) {
    carsGridContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-car-tunnel"></i>
        <p>No fleet cars found. Click "Add Fleet Car" to get started.</p>
      </div>
    `;
    return;
  }

  carsGridContainer.innerHTML = cars.map(car => {
    // Handle S3 fallback images
    const imageSrc = car.images && car.images.length > 0 
      ? car.images[0] 
      : 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=600&auto=format&fit=crop';
    
    const statusText = car.available ? 'Available' : 'Rented';
    const statusClass = car.available ? 'available' : 'rented';

    return `
      <div class="car-card glass">
        <div class="car-card-img">
          <img src="${imageSrc}" alt="${car.name}">
          <span class="badge-status ${statusClass}">${statusText}</span>
        </div>
        <div class="car-card-content">
          <div class="car-card-header">
            <div class="car-card-title">
              <h3>${car.name}</h3>
              <span>${car.brand}</span>
            </div>
            <div class="car-card-price">
              <span class="price-value">$${car.pricePerDay}</span>
              <span class="price-unit">per day</span>
            </div>
          </div>
          <p class="car-card-desc">${car.description}</p>
          <div class="car-card-meta">
            <span><i class="fa-solid fa-calendar"></i> Year: ${car.year}</span>
            <span><i class="fa-solid fa-location-dot"></i> ${car.location}</span>
          </div>
          <div class="car-card-actions">
            <button class="btn btn-secondary" onclick="openEditCarModal('${car._id}')">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <button class="btn btn-danger" onclick="deleteCar('${car._id}')">
              <i class="fa-solid fa-trash-can"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// CLIENT-SIDE CAR FILTER
searchCarsInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filteredCars = state.cars.filter(car => 
    car.name.toLowerCase().includes(query) || 
    car.brand.toLowerCase().includes(query)
  );
  renderCars(filteredCars);
});

// FETCH ALL BOOKINGS LIST
async function fetchBookings() {
  bookingsTableBody.innerHTML = `
    <tr>
      <td colspan="5" class="table-loading">
        <i class="fa-solid fa-spinner fa-spin"></i> Loading bookings requests...
      </td>
    </tr>
  `;

  try {
    const response = await apiFetch('/admin/bookings');
    if (response.success) {
      state.bookings = response.data;
      renderBookings(state.bookings);
    }
  } catch (error) {
    bookingsTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="table-loading" style="color: var(--color-danger)">
          <i class="fa-solid fa-circle-exclamation"></i> Failed to retrieve bookings details.
        </td>
      </tr>
    `;
  }
}

// RENDER BOOKINGS TABLE ROW
function renderBookings(bookings) {
  let filtered = bookings;
  if (state.currentBookingFilter !== 'all') {
    filtered = bookings.filter(b => b.status === state.currentBookingFilter);
  }

  if (filtered.length === 0) {
    bookingsTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="table-loading">
          <i class="fa-solid fa-folder-open"></i> No booking requests found under this status.
        </td>
      </tr>
    `;
    return;
  }

  bookingsTableBody.innerHTML = filtered.map(booking => {
    const user = booking.userId || { fullName: 'Unknown', email: 'N/A', phone: 'N/A' };
    const car = booking.carId || { name: 'Deleted Car', brand: 'N/A', pricePerDay: 0 };
    const rentalDate = new Date(booking.rentalDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const statusBadgeClass = `status-badge ${booking.status}`;
    
    // Action buttons display logic
    let actionsHTML = '';
    if (booking.status === 'pending') {
      actionsHTML = `
        <div class="table-actions">
          <button class="btn btn-primary" onclick="approveBooking('${booking._id}')">
            <i class="fa-solid fa-check"></i> Approve
          </button>
          <button class="btn btn-danger" onclick="cancelBooking('${booking._id}')">
            <i class="fa-solid fa-xmark"></i> Reject
          </button>
        </div>
      `;
    } else {
      actionsHTML = `<span style="font-size: 0.8rem; color: var(--text-muted)">Processed</span>`;
    }

    return `
      <tr>
        <td>
          <div class="customer-cell">
            <span class="cell-primary">${user.fullName}</span>
            <span class="cell-secondary"><i class="fa-regular fa-envelope"></i> ${user.email}</span>
            <span class="cell-secondary"><i class="fa-solid fa-phone"></i> ${user.phone}</span>
          </div>
        </td>
        <td>
          <div class="car-cell">
            <span class="cell-primary">${car.name}</span>
            <span class="cell-secondary">${car.brand} • $${car.pricePerDay}/day</span>
          </div>
        </td>
        <td>
          <span class="cell-primary">${rentalDate}</span>
        </td>
        <td>
          <span class="${statusBadgeClass}">${booking.status.toUpperCase()}</span>
        </td>
        <td class="actions-col">
          ${actionsHTML}
        </td>
      </tr>
    `;
  }).join('');
}

// BOOKING TABS FILTER
bookingFilterButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    bookingFilterButtons.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    
    state.currentBookingFilter = e.target.getAttribute('data-filter');
    renderBookings(state.bookings);
  });
});

// MODAL LISTENERS CONTROL
const modalOverlays = document.querySelectorAll('.modal-overlay');
const closeModalButtons = document.querySelectorAll('.close-modal');

// Open add car
btnAddCar.addEventListener('click', () => {
  modalAddCar.classList.add('active');
});

// Close all modal utility
function closeModals() {
  modalOverlays.forEach(overlay => overlay.classList.remove('active'));
  formAddCar.reset();
  formEditCar.reset();
  addFileInfo.textContent = 'No files chosen';
  editFileInfo.textContent = 'No files chosen';
}

closeModalButtons.forEach(btn => {
  btn.addEventListener('click', closeModals);
});

// Close when click backdrop
modalOverlays.forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModals();
  });
});

// FILE ATTACHMENT LABELS ON FORMS
document.getElementById('car-images').addEventListener('change', (e) => {
  const files = e.target.files;
  addFileInfo.textContent = files.length > 0 
    ? `${files.length} file(s) selected` 
    : 'No files chosen';
});

document.getElementById('edit-car-images').addEventListener('change', (e) => {
  const files = e.target.files;
  editFileInfo.textContent = files.length > 0 
    ? `${files.length} file(s) selected` 
    : 'No files chosen';
});

// ADD CAR FORM SUBMIT
formAddCar.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(formAddCar);
  
  try {
    const response = await apiFetch('/cars', {
      method: 'POST',
      body: formData
    });

    if (response.success) {
      showToast('Car listing created successfully!', 'success');
      closeModals();
      fetchCars();
    }
  } catch (error) {
    // Toast error is automatically rendered
  }
});

// OPEN EDIT CAR MODAL
async function openEditCarModal(carId) {
  try {
    const response = await apiFetch(`/cars/${carId}`);
    if (response.success) {
      const car = response.data;
      
      document.getElementById('edit-car-id').value = car._id;
      document.getElementById('edit-car-name').value = car.name;
      document.getElementById('edit-car-brand').value = car.brand;
      document.getElementById('edit-car-year').value = car.year;
      document.getElementById('edit-car-price').value = car.pricePerDay;
      document.getElementById('edit-car-location').value = car.location;
      document.getElementById('edit-car-description').value = car.description;
      document.getElementById('edit-car-available').value = car.available ? 'true' : 'false';

      modalEditCar.classList.add('active');
    }
  } catch (error) {
    // Handled in apiFetch toast
  }
}
window.openEditCarModal = openEditCarModal;

// EDIT CAR FORM SUBMIT
formEditCar.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const carId = document.getElementById('edit-car-id').value;
  const formData = new FormData(formEditCar);
  
  try {
    const response = await apiFetch(`/cars/${carId}`, {
      method: 'PUT',
      body: formData
    });

    if (response.success) {
      showToast('Car listing updated successfully!', 'success');
      closeModals();
      fetchCars();
    }
  } catch (error) {
    // Handled in apiFetch toast
  }
});

// DELETE CAR LISTING
async function deleteCar(carId) {
  if (confirm('Are you absolutely sure you want to delete this car listing?')) {
    try {
      const response = await apiFetch(`/cars/${carId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        showToast('Car deleted successfully', 'success');
        fetchCars();
      }
    } catch (error) {
      // Handled in apiFetch toast
    }
  }
}
window.deleteCar = deleteCar;

// APPROVE BOOKING REQUEST
async function approveBooking(bookingId) {
  try {
    const response = await apiFetch(`/admin/bookings/${bookingId}/approve`, {
      method: 'PATCH'
    });

    if (response.success) {
      showToast('Booking request approved!', 'success');
      fetchBookings();
    }
  } catch (error) {
    // Handled in apiFetch toast
  }
}
window.approveBooking = approveBooking;

// CANCEL BOOKING REQUEST
async function cancelBooking(bookingId) {
  if (confirm('Are you sure you want to cancel / reject this booking request?')) {
    try {
      const response = await apiFetch(`/admin/bookings/${bookingId}/cancel`, {
        method: 'PATCH'
      });

      if (response.success) {
        showToast('Booking request rejected/cancelled', 'info');
        fetchBookings();
      }
    } catch (error) {
      // Handled in apiFetch toast
    }
  }
}
window.cancelBooking = cancelBooking;

// BOOTSTRAP INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  updateCurrentDate();
  
  // Attach sidebar link switchers
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  checkAuth();
});
