// Add this at the very top of your script.js file
const API_BASE_URL = 'https://metro-auto-parts-api.onrender.com';

// --- 1. Shopping Cart State (Persisted with localStorage) ---
// Initialize shoppingCart by trying to load it from localStorage
let shoppingCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

// Function to save the shopping cart to localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));
}

// --- Global Variables for Management Form ---
let isEditMode = false; // To track if the form is for adding or editing
let currentPartId = null; // To store the ID of the part being edited

// --- 2. Functions to Manage UI Display ---

// Function to fetch parts from the backend and display them for the catalog
async function displayParts(searchTerm = '') {
    const partsListDiv = document.querySelector('.parts-list');
    partsListDiv.innerHTML = 'Loading parts...';

    try {
        let url = `${API_BASE_URL}/api/parts`; // Correctly use the API_BASE_URL
        if (searchTerm) {
            url += `?search=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(url); // Use the constructed URL
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const autoParts = await response.json();

        partsListDiv.innerHTML = '';

        if (autoParts.length === 0) {
            partsListDiv.innerHTML = '<p>No parts found matching your search.</p>';
            return;
        }

        autoParts.forEach(part => {
            const partItemDiv = document.createElement('div');
            partItemDiv.classList.add('part-item');

            partItemDiv.innerHTML = `
                <img src="<span class="math-inline">\{part\.imageUrl \|\| 'https\://via\.placeholder\.com/150/CCCCCC/000000?text\=No\+Image'\}" alt\="</span>{part.name}" style="width:100px; height:100px; object-fit:cover;">
                <h3><span class="math-inline">\{part\.name\}</h3\>
<p\></span>{part.description.substring(0, 70)}...</p>
                <p class="price">$<span class="math-inline">\{part\.price\.toFixed\(2\)\}</p\>
<div\>
<button class\="primary" onclick\="viewPartDetails\('</span>{part.id}')">View Details</button>
                    <button class="primary" onclick="addToCart('${part.id}')">Add to Cart</button>
                </div>
            `;
            partsListDiv.appendChild(partItemDiv);
        });
    } catch (error) {
        console.error('Error fetching parts:', error);
        partsListDiv.innerHTML = '<p>Error loading parts. Please try again later.</p>';
    }
}

// Function to trigger the search from the input field
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim();
    displayParts(searchTerm);
}

// Function to view part details - now fetches only the specific part
async function viewPartDetails(partId) {
    const partsCatalog = document.getElementById('parts-catalog');
    const partDetails = document.getElementById('part-details');
    const detailsContent = document.getElementById('details-content');
    const productManagement = document.getElementById('product-management'); // Hide management

    partsCatalog.style.display = 'none';
    productManagement.style.display = 'none'; // Ensure management section is hidden
    partDetails.style.display = 'block';

    detailsContent.innerHTML = 'Loading part details...';

    try {
        const response = await fetch(`<span class="math-inline">\{API\_BASE\_URL\}/api/parts/</span>{partId}`); // Use API_BASE_URL and backticks
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Part not found.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const part = await response.json();

        if (part) {
            detailsContent.innerHTML = `
                <h3><span class="math-inline">\{part\.name\}</h3\>
<img src\="</span>{part.imageUrl || 'https://via.placeholder.com/200/CCCCCC/000000?text=No+Image'}" alt="${part.name}" style="max-width:200px; max-height:200px; object-fit:cover; display:block; margin: 0 auto 15px;">
                <p><strong>Description:</strong> ${part.description}</p>
                <p><strong>Price:</strong> $<span class="math-inline">\{part\.price\.toFixed\(2\)\}</p\>
<button class\="primary" onclick\="addToCart\('</span>{part.id}')">Add to Cart</button>
            `;
        } else {
            detailsContent.innerHTML = '<p>Part not found.</p>';
        }
    } catch (error) {
        console.error('Error fetching part details:', error);
        detailsContent.innerHTML = `<p>Error loading part details: ${error.message}. Please try again later.</p>`;
    }
}

function goBackToCatalog() {
    document.getElementById('part-details').style.display = 'none';
    document.getElementById('parts-catalog').style.display = 'block';
}

function addToCart(partId) {
    // This still fetches all parts for simplicity to ensure 'partToAdd' has all necessary properties
    fetch(`${API_BASE_URL}/api/parts`) // Use API_BASE_URL
        .then(res => res.json())
        .then(autoParts => {
            const partToAdd = autoParts.find(part => part.id === partId);
            if (partToAdd) {
                const existingItem = shoppingCart.find(item => item.id === partId);
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    shoppingCart.push({ ...partToAdd, quantity: 1 });
                }
                saveCartToLocalStorage(); // Save cart after modification
                alert(`${partToAdd.name} added to cart!`); // Provide feedback
                // updateCartDisplay(); // This will be removed from main script
            }
        })
        .catch(error => console.error('Error adding to cart:', error));
}


// --- NEW: Product Management Functions ---

// Function to navigate to the product management interface
function showManagementInterface() {
    document.getElementById('parts-catalog').style.display = 'none';
    document.getElementById('part-details').style.display = 'none'; // Hide details too
    document.getElementById('product-management').style.display = 'block';
    loadManagePartsList(); // Load parts into the management list
    clearPartForm(); // Clear the form when entering management mode
}

// Function to go back to the catalog (from management)
function showCatalog() {
    document.getElementById('product-management').style.display = 'none';
    document.getElementById('parts-catalog').style.display = 'block';
    displayParts(); // Refresh parts list in catalog
}

// Function to load all parts into the management list
async function loadManagePartsList() {
    const managePartsList = document.getElementById('managePartsList');
    managePartsList.innerHTML = 'Loading parts for management...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/parts`); // Use API_BASE_URL and /api/parts
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const autoParts = await response.json();

        managePartsList.innerHTML = '';
        if (autoParts.length === 0) {
            managePartsList.innerHTML = '<li>No parts in the database.</li>';
            return;
        }

        autoParts.forEach(part => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="math-inline">\{part\.name\} \(</span><span class="math-inline">\{part\.price\.toFixed\(2\)\}\)
<button class\="primary" onclick\="loadPartIntoForm\('</span>{part.id}')">Edit</button>
            `;
            managePartsList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error loading parts for management:', error);
        managePartsList.innerHTML = '<p>Error loading parts for management. Please try again later.</p>';
    }
}

// Function to load a specific part's data into the form for editing
async function loadPartIntoForm(partId) {
    clearPartForm(); // Start with a fresh form
    const savePartBtn = document.getElementById('savePartBtn');
    const deletePartBtn = document.getElementById('deletePartBtn');
    const partIdInput = document.getElementById('partId');

    try {
        const response = await fetch(`<span class="math-inline">\{API\_BASE\_URL\}/api/parts/</span>{partId}`); // Use API_BASE_URL and backticks
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const part = await response.json();

        if (part) {
            partIdInput.value = part.id;
            partIdInput.readOnly = true; // Make ID read-only when editing
            document.getElementById('partName').value = part.name;
            document.getElementById('partDescription').value = part.description;
            document.getElementById('partPrice').value = part.price.toFixed(2);
            document.getElementById('partImageUrl').value = part.imageUrl || '';

            savePartBtn.textContent = 'Save Changes';
            deletePartBtn.style.display = 'inline-block'; // Show delete button
            isEditMode = true;
            currentPartId = partId; // Store the ID of the part being edited
        } else {
            alert('Part not found for editing.');
        }
    } catch (error) {
        console.error('Error loading part into form:', error);
        alert(`Error loading part: ${error.message}`);
    }
}

// Function to clear the part form and reset to "Add Part" mode
function clearPartForm() {
    document.getElementById('partForm').reset(); // Clears all form fields
    document.getElementById('partId').readOnly = false; // Make ID editable for new part
    document.getElementById('savePartBtn').textContent = 'Add Part';
    document.getElementById('deletePartBtn').style.display = 'none'; // Hide delete button
    isEditMode = false;
    currentPartId = null;
}

// Function to handle form submission (Add or Update)
async function handlePartFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission and page reload

    const part = {
        id: document.getElementById('partId').value.trim(),
        name: document.getElementById('partName').value.trim(),
        description: document.getElementById('partDescription').value.trim(),
        price: parseFloat(document.getElementById('partPrice').value),
        imageUrl: document.getElementById('partImageUrl').value.trim()
    };

    if (!part.id || !part.name || isNaN(part.price) || part.price <= 0) {
        alert('Please fill in valid Part ID, Name, and Price.');
        return;
    }

    let url = `${API_BASE_URL}/api/parts`; // Use API_BASE_URL for adding
    let method = 'POST'; // Default for adding

    if (isEditMode) {
        url = `<span class="math-inline">\{API\_BASE\_URL\}/api/parts/</span>{currentPartId}`; // Use API_BASE_URL and backticks for updating
        method = 'PUT'; // For updating
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(part)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Operation failed.');
        }

        const successData = await response.json();
        alert(successData.message);

        clearPartForm(); // Clear and reset form after successful operation
        loadManagePartsList(); // Refresh the list of parts in management section
        displayParts(); // Also refresh the main catalog
    } catch (error) {
        console.error('Error in part management:', error);
        alert(`Error: ${error.message}`);
    }
}

// Function to handle deleting a part
async function deletePart() {
    if (!currentPartId) {
        alert('No part selected for deletion.');
        return;
    }

    if (!confirm(`Are you sure you want to delete part ${currentPartId}? This cannot be undone.`)) {
        return; // User cancelled
    }

    try {
        const response = await fetch(`<span class="math-inline">\{API\_BASE\_URL\}/api/parts/</span>{currentPartId}`, { // Use API_BASE_URL and backticks
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete part.');
        }

        const successData = await response.json();
        alert(successData.message);

        clearPartForm(); // Clear and reset form
        loadManagePartsList(); // Refresh the list
        displayParts(); // Refresh main catalog
    } catch (error) {
        console.error('Error deleting part:', error);
        alert(`Error: ${error.message}`);
    }
}


// --- 3. Initialize the App ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial display of parts in the catalog
    displayParts();
    // updateCartDisplay(); // REMOVED: Cart display is now on cart.html

    // Attach event listeners for the part management form
    const partForm = document.getElementById('partForm');
    if (partForm) {
        partForm.addEventListener('submit', handlePartFormSubmit);
    }