// Variables + LocalStorage //
let contacts = JSON.parse(localStorage.getItem("contacts")) || [];
let currentIndex = null;
let photoBase64 = "";

const fullName = document.getElementById("fullName");
const phoneNumber = document.getElementById("phoneNumber");
const emailAddress = document.getElementById("emailAddress");
const address = document.getElementById("address");
const group = document.getElementById("group");
const notes = document.getElementById("notes");
const isFavorite = document.getElementById("isFavorite");
const isEmergency = document.getElementById("isEmergency");

const rowData = document.getElementById("rowData");
const favoritesList = document.getElementById("favoritesList");
const emergencyList = document.getElementById("emergencyList");

const photoInput = document.getElementById("photoInput");
const photoPreview = document.querySelector(".contact-photo-preview");

// Init //
displayContacts();
updateCounters();

// Photo Upload //
photoInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    photoBase64 = e.target.result;
    photoPreview.innerHTML = `<img src="${photoBase64}" />`;
  };
  reader.readAsDataURL(file);
});

// LocalStorage //
function saveData() {
  localStorage.setItem("contacts", JSON.stringify(contacts));
}

// Validation //
function validateForm(isUpdate = false) {
  if (fullName.value.trim() === "" || phoneNumber.value.trim() === "") {
    Swal.fire("Error", "Name & Phone are required", "error");
    return false;
  }

  if (!/^01\d{9}$/.test(phoneNumber.value)) {
    Swal.fire("Error", "Invalid phone number", "error");
    return false;
  }

  if (
    contacts.some(
      (c, i) => c.phone === phoneNumber.value && i !== currentIndex
    )
  ) {
    Swal.fire("Error", "Phone already exists", "error");
    return false;
  }

  return true;
}

// Add Contact //
function AddContact() {
  if (!validateForm()) return;

  const contact = {
    id: Date.now(),
    name: fullName.value,
    phone: phoneNumber.value,
    email: emailAddress.value,
    address: address.value,
    group: group.value,
    notes: notes.value,
    favorite: isFavorite.checked,
    emergency: isEmergency.checked,
    photo: photoBase64
  };

  contacts.push(contact);
  saveData();
  displayContacts();
  updateCounters();
  clearForm();

  Swal.fire("Success", "Contact added successfully", "success");

  bootstrap.Modal.getInstance(
    document.getElementById("addContactModal")
  ).hide();
}

// Display Contacts //
function displayContacts(list = contacts) {
  rowData.innerHTML = "";
  favoritesList.innerHTML = "";
  emergencyList.innerHTML = "";

  if (list.length === 0) {
    rowData.innerHTML = `<p class="alert alert-warning text-center">No contacts found</p>`;
    return;
  }

  list.forEach((c, index) => {
    const initials = c.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .slice(0, 2);

    rowData.innerHTML += `
      <div class="col-md-6">
        <div class="contact-card">
          <div class="contact-header">
            <div class="contact-avatar bg-primary ${c.favorite ? "favorite" : ""} ${c.emergency ? "emergency" : ""}">
              ${c.photo ? `<img src="${c.photo}" />` : initials}
            </div>
            <div class="contact-info">
              <h4>${c.name}</h4>
            </div>
          </div>

          <div class="contact-details">
            <div class="contact-detail phone">
              <i class="fas fa-phone"></i>
              <span>${c.phone}</span>
            </div>
            <div class="contact-detail email">
              <i class="fas fa-envelope"></i>
              <span>${c.email || "-"}</span>
            </div>
            <div class="contact-detail address">
              <i class="fas fa-map-marker-alt"></i>
              <span>${c.address || "-"}</span>
            </div>
          </div>

          <div class="contact-tags">
            ${c.group ? `<span class="tag ${c.group}">${c.group}</span>` : ""}
            ${c.emergency ? `<span class="tag emergency"><i class="fas fa-heartbeat"></i> Emergency</span>` : ""}
          </div>

          <div class="contact-actions">
            <a href="tel:${c.phone}" class="contact-action call">
              <i class="fas fa-phone"></i>
            </a>

            ${
              c.email
                ? `<a href="mailto:${c.email}" class="contact-action email">
                     <i class="fas fa-envelope"></i>
                   </a>`
                : ""
            }

            <button onclick="toggleFavorite(${index})" class="contact-action favorite ${c.favorite ? "active" : ""}">
              <i class="fas fa-star"></i>
            </button>

            <button onclick="toggleEmergency(${index})" class="contact-action emergency ${c.emergency ? "active" : ""}">
              <i class="fas fa-heart"></i>
            </button>

            <button onclick="editItem(${index})" class="contact-action">
              <i class="fas fa-edit"></i>
            </button>

            <button onclick="deleteItem(${index})" class="contact-action delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    if (c.favorite) {
      favoritesList.innerHTML += sidebarCard(c, "favorites-call");
    }

    if (c.emergency) {
      emergencyList.innerHTML += sidebarCard(c, "emergency-call");
    }
  });
}

// Sidebar Card //
function sidebarCard(c, className) {
  const initials = c.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2);

  return `
    <div class="sidebar-contact-card">
      <div class="sidebar-contact-avatar bg-primary">
        ${c.photo ? `<img src="${c.photo}" />` : initials}
      </div>
      <div class="sidebar-contact-info">
        <h5>${c.name}</h5>
        <p>${c.phone}</p>
      </div>
      <a href="tel:${c.phone}" class="sidebar-call-btn ${className}">
        <i class="fas fa-phone"></i>
      </a>
    </div>
  `;
}

// Delete //
function deleteItem(index) {
  Swal.fire({
    title: "Are you sure?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete"
  }).then(result => {
    if (result.isConfirmed) {
      contacts.splice(index, 1);
      saveData();
      displayContacts();
      updateCounters();
      Swal.fire("Deleted!", "Contact removed", "success");
    }
  });
}

// Edit / Update //
function editItem(index) {
  currentIndex = index;
  const c = contacts[index];

  fullName.value = c.name;
  phoneNumber.value = c.phone;
  emailAddress.value = c.email;
  address.value = c.address;
  group.value = c.group;
  notes.value = c.notes;
  isFavorite.checked = c.favorite;
  isEmergency.checked = c.emergency;

  photoBase64 = c.photo || "";
  photoPreview.innerHTML = c.photo
    ? `<img src="${c.photo}" />`
    : `<i class="fas fa-user"></i>`;

  document.getElementById("saveContactBtn").classList.add("d-none");
  document.getElementById("updateContactBtn").classList.remove("d-none");

  new bootstrap.Modal(document.getElementById("addContactModal")).show();
}

function updateItem() {
  if (!validateForm(true)) return;

  const c = contacts[currentIndex];

  c.name = fullName.value;
  c.phone = phoneNumber.value;
  c.email = emailAddress.value;
  c.address = address.value;
  c.group = group.value;
  c.notes = notes.value;
  c.favorite = isFavorite.checked;
  c.emergency = isEmergency.checked;
  c.photo = photoBase64;

  saveData();
  displayContacts();
  updateCounters();
  clearForm();
  currentIndex = null;

  Swal.fire("Updated!", "Contact updated successfully", "success");

  bootstrap.Modal.getInstance(
    document.getElementById("addContactModal")
  ).hide();
}

// Toggles //
function toggleFavorite(index) {
  contacts[index].favorite = !contacts[index].favorite;
  saveData();
  displayContacts();
  updateCounters();
}

function toggleEmergency(index) {
  contacts[index].emergency = !contacts[index].emergency;
  saveData();
  displayContacts();
  updateCounters();
}

// Counters //
function updateCounters() {
  document.getElementById("totalContacts").innerText = contacts.length;
  document.getElementById("contactsCount").innerText = contacts.length;
  document.getElementById("favoritesCount").innerText =
    contacts.filter(c => c.favorite).length;
  document.getElementById("emergencyCount").innerText =
    contacts.filter(c => c.emergency).length;
}

// Clear Form //
function clearForm() {
  document.getElementById("contactForm").reset();
  document.getElementById("saveContactBtn").classList.remove("d-none");
  document.getElementById("updateContactBtn").classList.add("d-none");
  photoBase64 = "";
  photoPreview.innerHTML = `<i class="fas fa-user"></i>`;
}

// Search //
function search() {
  const value = document.getElementById("searchInput").value.toLowerCase();

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(value) ||
    c.phone.includes(value) ||
    (c.email && c.email.toLowerCase().includes(value))
  );

  displayContacts(filtered);
}
