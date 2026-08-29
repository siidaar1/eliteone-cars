// Configuration
const CONFIG = {
    // GitHub Raw Content URL - Replace with your repository
    JSON_URL: 'https://raw.githubusercontent.com/yourusername/eliteone-cars/main/data.json'
    // For local testing, use:
    // JSON_URL: 'data.json'
};

let allCars = [];
let currentFilter = 'all';
let contactData = {};

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    populateCarSelect();
});

// Fetch data from JSON file
async function loadData() {
    try {
        // Show loading spinner
        document.getElementById('loadingSpinner').style.display = 'flex';

        const response = await fetch(CONFIG.JSON_URL);
        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();
        allCars = data.cars;
        contactData = data.contact;

        // Populate contact info
        populateContactInfo();

        // Display cars
        displayCars(allCars);

        // Hide loading spinner
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('carsContainer').classList.remove('hidden');

    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('loadingSpinner').innerHTML = `
            <div class="text-center">
                <p class="text-red-500 font-semibold">Failed to load cars data</p>
                <p class="text-gray-500 text-sm mt-2">Check if your GitHub JSON URL is correct in app.js</p>
                <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
            </div>
        `;
    }
}

// Display cars with filter
function displayCars(cars) {
    const container = document.getElementById('carsContainer');
    const noMessage = document.getElementById('noCarsMessage');

    let filteredCars = cars;
    if (currentFilter !== 'all') {
        filteredCars = cars.filter(car => car.brand === currentFilter);
    }

    if (filteredCars.length === 0) {
        container.classList.add('hidden');
        noMessage.classList.remove('hidden');
        return;
    }

    container.classList.remove('hidden');
    noMessage.classList.add('hidden');

    container.innerHTML = filteredCars.map(car => `
        <div class="car-card bg-white rounded-xl overflow-hidden shadow-lg relative">
            ${car.discount ? `
                <div class="discount-badge">
                    <div class="discount-value">${car.discount}%</div>
                    <div class="discount-text">Limited</div>
                </div>
            ` : ''}
            
            <div class="relative h-64 bg-gray-200 overflow-hidden group">
                <img src="${car.image}" alt="${car.brand} ${car.model}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
            </div>

            <div class="p-6">
                <div class="mb-2">
                    <p class="text-sm text-gray-500">${car.category}</p>
                    <h3 class="text-2xl font-bold" style="color: var(--primary-blue);">${car.brand}</h3>
                    <p class="text-lg" style="color: var(--accent-gold);">${car.model}</p>
                </div>

                <p class="text-gray-600 text-sm mb-4">${car.description}</p>

                <div class="space-y-2 mb-6">
                    ${car.specs.map(spec => `
                        <div class="car-spec">
                            <div class="car-spec-icon">
                                <i class="${spec.icon}"></i>
                            </div>
                            <span class="text-sm text-gray-700">${spec.label}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="border-t pt-4 mb-4">
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-gray-600">Starting From</span>
                        <div class="text-right">
                            <span class="text-2xl font-bold" style="color: var(--accent-gold);">AED ${car.pricePerDay}</span>
                            <span class="text-gray-500 text-sm">/day</span>
                        </div>
                    </div>
                    ${car.discount ? `
                        <p class="text-xs text-gray-500">Limited time offer</p>
                    ` : ''}
                </div>

                <button onclick="viewCarDetails('${car.id}')" class="btn-primary w-full mb-3">View Details</button>
                <button onclick="selectCarForBooking('${car.id}')" class="btn-secondary w-full">Book Now</button>
            </div>
        </div>
    `).join('');
}

// Filter cars by brand
function filterCars(brand) {
    currentFilter = brand;

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Display filtered cars
    displayCars(allCars);

    // Scroll to cars section
    document.getElementById('cars').scrollIntoView({ behavior: 'smooth' });
}

// View car details in modal
function viewCarDetails(carId) {
    const car = allCars.find(c => c.id === carId);
    if (!car) return;

    const modalContent = document.getElementById('carModalContent');
    modalContent.innerHTML = `
        <div>
            <h2 class="text-3xl font-bold mb-6" style="color: var(--primary-blue);">
                ${car.brand} ${car.model}
            </h2>

            <img src="${car.image}" alt="${car.brand}" class="w-full h-96 object-cover rounded-lg mb-6">

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                ${car.specs.map(spec => `
                    <div class="bg-gray-50 p-4 rounded-lg text-center">
                        <i class="${spec.icon} text-2xl mb-2" style="color: var(--accent-gold);"></i>
                        <p class="text-sm font-semibold text-gray-700">${spec.label}</p>
                    </div>
                `).join('')}
            </div>

            <div class="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 class="font-bold mb-2" style="color: var(--primary-blue);">Description</h3>
                <p class="text-gray-700">${car.description}</p>
                ${car.fullDescription ? `<p class="text-gray-600 mt-3">${car.fullDescription}</p>` : ''}
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <p class="text-gray-600 text-sm">Daily Rate</p>
                    <p class="text-3xl font-bold" style="color: var(--primary-blue);">AED ${car.pricePerDay}</p>
                </div>
                <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
                    <p class="text-gray-600 text-sm">Category</p>
                    <p class="text-2xl font-bold" style="color: var(--accent-gold);">${car.category}</p>
                </div>
            </div>

            ${car.discount ? `
                <div class="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg mb-6 border-l-4 border-green-500">
                    <p class="font-bold text-green-800">Special Offer: ${car.discount}% Discount Available</p>
                </div>
            ` : ''}

            <div class="flex gap-4">
                <button onclick="selectCarForBooking('${car.id}')" class="btn-primary flex-1">Book This Car</button>
                <button onclick="document.getElementById('carModal').classList.remove('active')" class="btn-secondary flex-1">Close</button>
            </div>
        </div>
    `;

    document.getElementById('carModal').classList.add('active');
}

// Select car for booking
function selectCarForBooking(carId) {
    const car = allCars.find(c => c.id === carId);
    if (!car) return;

    // Set the car in the select dropdown
    const carSelect = document.getElementById('carSelect');
    const carLabel = `${car.brand} ${car.model} - AED ${car.pricePerDay}/day`;

    // Add option if it doesn't exist
    let option = Array.from(carSelect.options).find(opt => opt.value === carId);
    if (!option) {
        option = document.createElement('option');
        option.value = carId;
        option.textContent = carLabel;
        carSelect.appendChild(option);
    }

    carSelect.value = carId;

    // Close any open modal
    document.getElementById('carModal').classList.remove('active');

    // Scroll to and open booking modal
    document.getElementById('bookingModal').classList.add('active');
    document.querySelector('#bookingModal .modal-content').scrollTop = 0;
}

// Populate car select in booking form
function populateCarSelect() {
    const carSelect = document.getElementById('carSelect');
    carSelect.innerHTML = '<option value="">Select a car...</option>';

    allCars.forEach(car => {
        const option = document.createElement('option');
        option.value = car.id;
        option.textContent = `${car.brand} ${car.model} - AED ${car.pricePerDay}/day`;
        carSelect.appendChild(option);
    });
}

// Handle booking form submission
function handleBooking(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const bookingData = {
        name: event.target.querySelector('input[type="text"]').value,
        email: event.target.querySelector('input[type="email"]').value,
        phone: event.target.querySelector('input[type="tel"]').value,
        pickupDate: event.target.querySelectorAll('input[type="date"]')[0].value,
        returnDate: event.target.querySelectorAll('input[type="date"]')[1].value,
        carId: document.getElementById('carSelect').value,
        bookingTime: new Date().toISOString()
    };

    // Validate dates
    if (new Date(bookingData.pickupDate) >= new Date(bookingData.returnDate)) {
        alert('Return date must be after pick-up date');
        return;
    }

    // Get selected car details
    const selectedCar = allCars.find(c => c.id === bookingData.carId);
    if (!selectedCar) {
        alert('Please select a car');
        return;
    }

    // Calculate days and total price
    const pickupDate = new Date(bookingData.pickupDate);
    const returnDate = new Date(bookingData.returnDate);
    const days = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24));
    let totalPrice = days * selectedCar.pricePerDay;

    // Apply discount if available
    if (selectedCar.discount) {
        const discountAmount = (totalPrice * selectedCar.discount) / 100;
        totalPrice -= discountAmount;
    }

    // Show confirmation and WhatsApp message
    const confirmBooking = confirm(
        `Booking Confirmation:\n\n` +
        `Car: ${selectedCar.brand} ${selectedCar.model}\n` +
        `Rental Period: ${days} day(s)\n` +
        `Total Price: AED ${totalPrice.toFixed(2)}\n\n` +
        `We'll send you details on WhatsApp at ${bookingData.phone}\n\n` +
        `Proceed with booking?`
    );

    if (confirmBooking) {
        // Send WhatsApp message
        const whatsappMessage = encodeURIComponent(
            `Hello! I want to book a ${selectedCar.brand} ${selectedCar.model}\n\n` +
            `Name: ${bookingData.name}\n` +
            `Email: ${bookingData.email}\n` +
            `Pick-up: ${bookingData.pickupDate}\n` +
            `Return: ${bookingData.returnDate}\n` +
            `Days: ${days}\n` +
            `Total: AED ${totalPrice.toFixed(2)}`
        );

        // Replace with your WhatsApp number
        const whatsappNumber = contactData.whatsapp || '+971555555555';
        window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`, '_blank');

        // Close modal and reset form
        document.getElementById('bookingModal').classList.remove('active');
        event.target.reset();

        // Show success message
        alert('Booking details sent via WhatsApp! Our team will confirm shortly.');
    }
}

// Populate contact info
function populateContactInfo() {
    const contactContainer = document.getElementById('contactInfo');

    if (!contactData || !contactData.phone) {
        contactContainer.innerHTML = '<p class="text-center text-gray-300">Contact information unavailable</p>';
        return;
    }

    contactContainer.innerHTML = `
        <div class="text-center">
            <div class="inline-block bg-rgba(255,255,255,0.1) p-4 rounded-full mb-4">
                <i class="fas fa-phone text-4xl"></i>
            </div>
            <h3 class="text-xl font-bold mb-2">Phone</h3>
            <p class="text-gray-300">${contactData.phone}</p>
            <a href="tel:${contactData.phone.replace(/[^0-9\+]/g, '')}" class="inline-block mt-2 text-yellow-400 hover:text-white">Call Now</a>
        </div>

        <div class="text-center">
            <div class="inline-block bg-rgba(255,255,255,0.1) p-4 rounded-full mb-4">
                <i class="fab fa-whatsapp text-4xl"></i>
            </div>
            <h3 class="text-xl font-bold mb-2">WhatsApp</h3>
            <p class="text-gray-300">${contactData.whatsapp || contactData.phone}</p>
            <a href="https://wa.me/${(contactData.whatsapp || contactData.phone).replace(/[^0-9]/g, '')}" target="_blank" class="inline-block mt-2 text-yellow-400 hover:text-white">Message Us</a>
        </div>

        <div class="text-center">
            <div class="inline-block bg-rgba(255,255,255,0.1) p-4 rounded-full mb-4">
                <i class="fas fa-envelope text-4xl"></i>
            </div>
            <h3 class="text-xl font-bold mb-2">Email</h3>
            <p class="text-gray-300">${contactData.email || 'contact@eliteone.ae'}</p>
            <a href="mailto:${contactData.email || 'contact@eliteone.ae'}" class="inline-block mt-2 text-yellow-400 hover:text-white">Send Email</a>
        </div>
    `;
}

// Payment option selection
function selectPayment(element, method) {
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    console.log('Payment method selected:', method);
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Close modals when clicking outside
window.onclick = function(event) {
    const bookingModal = document.getElementById('bookingModal');
    const carModal = document.getElementById('carModal');

    if (event.target == bookingModal) {
        bookingModal.classList.remove('active');
    }
    if (event.target == carModal) {
        carModal.classList.remove('active');
    }
}
