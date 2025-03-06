// Updated State Management
const STATE_KEY = 'dashboardState';

// Modified loadState function
function loadState() {
    const savedState = JSON.parse(localStorage.getItem(STATE_KEY));
    const defaultPage = 'home'; // Fallback page

    if (savedState) {
        // Restore cards
        const cardContainer = document.getElementById('cardContainer');
        cardContainer.innerHTML = savedState.cards
            .map(card => `<div class="card" data-id="${card.id}">${card.content}</div>`)
            .join('');

        // Restore active page
        const targetPage = document.getElementById(savedState.activePage);
        if (targetPage) {
            showPage(savedState.activePage, true);
        } else {
            showPage(defaultPage, true);
        }

        // Restore lastCardId
        defaultState.lastCardId = savedState.lastCardId;
    } else {
        showPage(defaultPage, true);
        for (let i = 0; i < 3; i++) {
            addCard(true);
        }
    }
}

// Updated beforeunload handler
window.addEventListener('beforeunload', () => {
    const activePage = document.querySelector('.page.active');
    if (activePage) {
        const state = JSON.parse(localStorage.getItem(STATE_KEY)) || defaultState;
        state.activePage = activePage.id;
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
    }
});

// Add Mobile Sidebar Toggle
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.querySelector('.hamburger').classList.toggle('active');
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function (event) {
    const sidebar = document.querySelector('.sidebar');
    const hamburger = document.querySelector('.hamburger');

    if (window.innerWidth <= 768) {
        if (!sidebar.contains(event.target) && !hamburger.contains(event.target)) {
            sidebar.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }
});

// Modified showPage function
function showPage(pageId, initialLoad = false) {
    // Get all page elements
    const pages = document.querySelectorAll('.page');

    // Hide all pages
    pages.forEach(page => {
        page.classList.remove('active');
    });

    // Show requested page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    // Update navigation active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick') === `showPage('${pageId}')`) {
            link.classList.add('active');
        }
    });
    // Save state unless initial load
    if (!initialLoad) {
        const state = JSON.parse(localStorage.getItem(STATE_KEY)) || defaultState;
        state.activePage = pageId;
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
    }
}

// Initialize with proper page restoration
window.addEventListener('load', () => {
    const savedState = JSON.parse(localStorage.getItem(STATE_KEY));
    const defaultPage = 'home';

    if (savedState && savedState.activePage) {
        const targetPage = document.getElementById(savedState.activePage);
        if (targetPage) {
            targetPage.classList.add('active');
        } else {
            document.getElementById(defaultPage).classList.add('active');
        }
    } else {
        document.getElementById(defaultPage).classList.add('active');
    }

    loadState();
});

// Handle window resize
window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
        document.querySelector('.sidebar').classList.remove('active');
        document.querySelector('.hamburger').classList.remove('active');
    }
});

// Profile Dropdown
function toggleProfileMenu() {
    document.getElementById('profileDropdown').classList.toggle('show');
}

// Close dropdown when clicking outside
window.onclick = function (event) {
    if (!event.target.matches('.profile-btn')) {
        const dropdowns = document.getElementsByClassName("profile-dropdown");
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// Filtering functionality
document.addEventListener('DOMContentLoaded', function () {
    const filterInput = document.getElementById('FilterInput')
    const tableBody = document.getElementById('tableBody')
    const rows = tableBody.getElementsByTagName('tr')

    filterInput.addEventListener('keyup', function () {
        const filterValue = filterInput.value.toLowerCase()

        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td')
            let match = false

            for (let j = 0; j < cells.length; j++) {
                if (cells[j]) {
                    if (cells[j].innerText.toLowerCase().indexOf(filterValue) > -1) {
                        match = true
                        break
                    }
                }
            }

            if (match) {
                rows[i].style.display = ''
            } else {
                rows[i].style.display = 'none'
            }
        }
    })
})

// Generate PDF Files
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF

    const content = document.getElementById('delivery-note-container');

    html2canvas(content, {
        scale: 2, // Increase the scale for better resolution
        useCORS: true // Enable cross-origin resource sharing
    }).then(canvas => {
        const imgData = canvas.toDataURL('static "images/logo.png"');
        const imgWidth = 210 - 40; // A4 width in mm minus 20mm margin on each side
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;

        let position = 10; // Start position with 20mm margin from the top

        // Add the first image
        doc.setFontSize(20); // Set the font size to 20pt
        doc.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight); // Add 20mm margin on the left
        heightLeft -= pageHeight;

        // Add additional pages if needed
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight); // Add 20mm margin on the left
            heightLeft -= pageHeight;
        }

        doc.save('delivery-note.pdf');
    });
}

//Payment Toggle
function togglePaymentOption() {
    const immediatePayment = document.getElementById('immediatePayment');
    const paymentDue = document.getElementById('paymentDue');
    const immediatePaymentOption = document.getElementById('immediatePaymentOption');
    const paymentDueOption = document.getElementById('paymentDueOption');

    if (immediatePayment.checked) {
        immediatePaymentOption.style.display = 'block';
        paymentDueOption.style.display = 'none';
    } else if (paymentDue.checked) {
        immediatePaymentOption.style.display = 'none';
        paymentDueOption.style.display = 'block';
    }
}

// Initialize the display based on the selected option
document.addEventListener('DOMContentLoaded', function () {
    togglePaymentOption();
});

// Fetch product data from the server
async function fetchProductData() {
    const response = await fetch('/get_product_data/');
    const data = await response.json();
    return data;
}

// Render the chart
async function renderChart() {
    const productData = await fetchProductData();
    const ctx = document.getElementById('productChart').getContext('2d');

    const backgroundColors = productData.quantities.map(quantity => quantity < 10 ? 'rgba(255, 99, 132, 0.2)' : 'rgba(75, 192, 192, 0.2)');
    const borderColors = productData.quantities.map(quantity => quantity < 10 ? 'rgba(255, 99, 132, 1)' : 'rgba(75, 192, 192, 1)');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: productData.labels,
            datasets: [{
                label: 'Quantity',
                data: productData.quantities,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                '3d': {
                    enabled: true,
                    effect: '3d',
                    depth: 10
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Call the renderChart function when the page loads
document.addEventListener('DOMContentLoaded', function () {
    renderChart();
});


// Get the modal
var modal = document.getElementById("productPopup");

// Get the button that opens the modal
var btn = document.getElementById("openPopupBtn");

// Get the <span> element that closes the modal
var span = document.getElementById("closePopupBtn");

// When the user clicks the button, open the modal 
btn.onclick = function () {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

//Add Product To Delivery Note
document.addEventListener('DOMContentLoaded', function () {
    const filterInput = document.getElementById('filterInput');
    const productCardsContainer = document.getElementById('productCardsContainer');
    const cards = productCardsContainer.getElementsByClassName('card');

    filterInput.addEventListener('keyup', function () {
        const filterValue = filterInput.value.toLowerCase();

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const cardText = card.innerText.toLowerCase();

            if (cardText.indexOf(filterValue) > -1) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        }
    });

    // Add event listener to each "Add to Delivery Note" link to add the product to the delivery note table
    const addToDeliveryNoteLinks = document.getElementsByClassName('add-to-delivery-note');
    for (let i = 0; i < addToDeliveryNoteLinks.length; i++) {
        addToDeliveryNoteLinks[i].addEventListener('click', function (event) {
            event.preventDefault();
            const card = this.closest('.card');
            const productId = card.getAttribute('data-product-id');

            fetch(`/add_product_to_delivery/${productId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const deliveryNoteTableBody = document.getElementById('deliveryNoteTableBody');
                        const newRow = document.createElement('tr');
                        newRow.innerHTML = `
                        <td>${data.product.product_code}</td>
                        <td>${data.product.description}</td>
                        <td>${data.product.quantity}</td>
                        <td>${data.product.unit_price}</td>
                        <td>${data.product.total_price}</td>
                        <td>
                            <button class="btn btn-danger remove-from-delivery-note" data-product-code="${data.product.product_code}">Remove</button>
                        </td>
                    `;
                        deliveryNoteTableBody.appendChild(newRow);

                        // Add event listener to the new remove button
                        newRow.querySelector('.remove-from-delivery-note').addEventListener('click', function (event) {
                            event.preventDefault();
                            const productCode = this.getAttribute('data-product-code');

                            fetch(`/remove_product_from_delivery/${productCode}/`, {
                                method: 'POST',
                                headers: {
                                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                                }
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        newRow.remove();
                                    } else {
                                        alert('Failed to remove product from delivery note.');
                                    }
                                })
                                .catch(error => {
                                    console.error('Error:', error);
                                    alert('An error occurred. Please try again.');
                                });
                        });

                        // Close the modal
                        document.getElementById('productPopup').style.display = 'none';
                    } else {
                        alert('Failed to add product to delivery note.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred. Please try again.');
                });
        });
    }
});

// Handle Deletion Of Products
function confirmDelete(productCode) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = `/delete_product/${productCode}/`;
        }
    });
}

function handleDeliveryNote(action) {
    const url = action === 'clear' ? '/clear_delivery_note/' : '/reset_delivery_note/';
    const successMessage = action === 'clear' ? 'Delivery note table cleared successfully.' : 'Delivery note has been reset successfully.';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                title: 'Success!',
                text: data.message,
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                // Optionally, refresh the page or update the UI
                location.reload();
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: data.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
}

// Helper function to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Call the handleDeliveryNote function with 'clear' or 'reset' action
function clearDeliveryNote() {
    handleDeliveryNote('clear');
}

function resetDeliveryNote() {
    handleDeliveryNote('reset');
}