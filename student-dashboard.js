import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDZgiWEtHrOKQosV2WfPLR82s_iAp8ze5Y",
    authDomain: "campuspulse-73544.firebaseapp.com",
    projectId: "campuspulse-73544",
    storageBucket: "campuspulse-73544.firebasestorage.app",
    messagingSenderId: "963558588008",
    appId: "1:963558588008:web:4ca67e4cd83326e18ac5dd",
    measurementId: "G-2PR9CP64Q9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let currentUser = null;
let firebaseReady = false;

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userAvatar = document.getElementById("userAvatar");
const greeting = document.getElementById("greeting");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileLargeAvatar = document.getElementById("profileLargeAvatar");
const profileComplaintCount = document.getElementById("profileComplaintCount");
const userCard = document.getElementById("userCard");
const profileMenu = document.getElementById("profileMenu");

const sections = {
    overview: document.getElementById("overviewSection"),
    report: document.getElementById("reportSection"),
    active: document.getElementById("activeSection"),
    history: document.getElementById("historySection"),
    profile: document.getElementById("profileSection")
};

const navItems = document.querySelectorAll(".nav-item");

function showSection(sectionName) {
    Object.values(sections).forEach(section => {
        section.classList.remove("active-section");
    });
    if (sections[sectionName]) {
        sections[sectionName].classList.add("active-section");
    }
    navItems.forEach(nav => {
        nav.classList.toggle("active", nav.dataset.section === sectionName);
    });
    profileMenu.classList.remove("show");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

navItems.forEach(nav => {
    nav.addEventListener("click", () => {
        showSection(nav.dataset.section);
    });
});

userCard.addEventListener("click", event => {
    event.stopPropagation();
    profileMenu.classList.toggle("show");
});

document.addEventListener("click", () => {
    profileMenu.classList.remove("show");
});

profileMenu.addEventListener("click", event => {
    event.stopPropagation();
});

document.getElementById("openProfileMenu").addEventListener("click", () => {
    showSection("profile");
});

document.getElementById("heroReportButton").addEventListener("click", () => {
    showSection("report");
});

document.getElementById("emptyReportButton").addEventListener("click", () => {
    showSection("report");
});

document.getElementById("viewAllComplaints").addEventListener("click", () => {
    showSection("history");
});

function setCurrentUser(user) {
    currentUser = user;
    const name = user.name || "Student";
    const email = user.email || "";
    const photo = user.photo || createAvatar(name);

    userName.textContent = name;
    userEmail.textContent = email;
    userAvatar.src = photo;
    profileName.textContent = name;
    profileEmail.textContent = email;
    profileLargeAvatar.src = photo;

    setGreeting(name);
    refreshDashboard();
}

function createAvatar(name) {
    const firstLetter = name.trim().charAt(0).toUpperCase();
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
            <rect width="100" height="100" rx="20" fill="#142d4a" />
            <text x="50%" y="57%" text-anchor="middle" font-family="Arial" font-size="42" fill="#78a8ff">${firstLetter}</text>
        </svg>
    `;
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function setGreeting(name) {
    const hour = new Date().getHours();
    let greetingText = "Good evening";
    if (hour < 12) {
        greetingText = "Good morning";
    } else if (hour < 17) {
        greetingText = "Good afternoon";
    }
    const firstName = name.trim().split(" ")[0];
    greeting.textContent = `${greetingText}, ${firstName} 👋`;
}

// FETCH FROM BACKEND (Replaced LocalStorage)
async function getComplaints() {
    try {
        const response = await fetch('[https://tesseract-rwkf.onrender.com/api/complaints](https://tesseract-rwkf.onrender.com/api/complaints)');
        return await response.json();
    } catch (error) {
        console.error("Failed to load complaints:", error);
        return [];
    }
}

const complaintForm = document.getElementById("complaintForm");
const categoryInput = document.getElementById("complaintCategory");
const locationInput = document.getElementById("complaintLocation");
const descriptionInput = document.getElementById("complaintDescription");
const descriptionCount = document.getElementById("descriptionCount");
const complaintImage = document.getElementById("complaintImage");
const filePreview = document.getElementById("filePreview");

descriptionInput.addEventListener("input", () => {
    descriptionCount.textContent = `${descriptionInput.value.length} / 600`;
});

complaintImage.addEventListener("change", () => {
    if (complaintImage.files.length > 0) {
        const file = complaintImage.files[0];
        filePreview.textContent = `✓ ${file.name}`;
    } else {
        filePreview.textContent = "";
    }
});

// UPDATED SUBMIT TO BACKEND
complaintForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!currentUser) {
        showToast("Please sign in again.");
        return;
    }

    const category = categoryInput.value.trim();
    const location = locationInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!category || !location || !description) {
        showToast("Please complete all required fields.");
        return;
    }

    const newComplaint = {
        title: `${category} issue at ${location}`,
        category: category,
        location: location,
        description: description,
        reportedBy: currentUser.email || "Student"
    };

    try {
        const response = await fetch('[https://tesseract-rwkf.onrender.com/api/complaints](https://tesseract-rwkf.onrender.com/api/complaints)http://localhost:5000/api/complaints', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newComplaint)
        });
        
        if (response.ok) {
            complaintForm.reset();
            descriptionCount.textContent = "0 / 600";
            filePreview.textContent = "";
            
            await refreshDashboard();
            
            showToast("Complaint submitted successfully.");
            showSection("active");
        }
    } catch (error) {
        showToast("Error connecting to server.");
    }
});

document.getElementById("clearFormButton").addEventListener("click", () => {
    descriptionCount.textContent = "0 / 600";
    filePreview.textContent = "";
});

function createComplaintCard(complaint) {
    const card = document.createElement("article");
    card.className = "complaint-card";

    card.innerHTML = `
        <div class="complaint-card-top">
            <div>
                <span class="category-tag">${escapeHTML(complaint.category)}</span>
                <h4>${escapeHTML(complaint.title)}</h4>
            </div>
            <span class="status-badge ${getStatusClass(complaint.status)}">${escapeHTML(complaint.status)}</span>
        </div>
        <p>${escapeHTML(complaint.description)}</p>
        <div class="complaint-meta">
            <span>${escapeHTML(complaint.id)}</span>
            <span>📍 ${escapeHTML(complaint.location)}</span>
            <span>◷ ${formatDate(complaint.createdAt)}</span>
        </div>
    `;
    card.addEventListener("click", () => {
        openComplaintModal(complaint);
    });
    return card;
}

function getStatusClass(status) {
    switch (status) {
        case "Under Review": return "status-review";
        case "In Progress": return "status-progress";
        case "Resolved": return "status-resolved";
        default: return "status-submitted";
    }
}

function renderRecentComplaints(complaints) {
    const list = document.getElementById("recentComplaintList");
    const empty = document.getElementById("overviewEmptyState");
    list.innerHTML = "";

    if (complaints.length === 0) {
        empty.classList.remove("hidden");
        return;
    }
    empty.classList.add("hidden");
    complaints.slice(0, 4).forEach(complaint => {
        list.appendChild(createComplaintCard(complaint));
    });
}

function renderActiveComplaints(complaints) {
    const container = document.getElementById("activeComplaintList");
    const empty = document.getElementById("activeEmptyState");
    const activeComplaints = complaints.filter(c => c.status !== "Resolved");
    
    document.getElementById("activeNavCount").textContent = activeComplaints.length;
    container.innerHTML = "";

    if (activeComplaints.length === 0) {
        empty.classList.remove("hidden");
        return;
    }
    empty.classList.add("hidden");
    activeComplaints.forEach(complaint => {
        container.appendChild(createComplaintCard(complaint));
    });
}

let currentHistoryFilter = "all";
const historyFilterButtons = document.querySelectorAll(".history-filter");

historyFilterButtons.forEach(button => {
    button.addEventListener("click", async () => {
        historyFilterButtons.forEach(item => {
            item.classList.remove("active");
        });
        button.classList.add("active");
        currentHistoryFilter = button.dataset.filter;
        renderHistory(await getComplaints());
    });
});

function renderHistory(complaints) {
    const container = document.getElementById("historyComplaintList");
    const empty = document.getElementById("historyEmptyState");
    let filteredComplaints = complaints;

    if (currentHistoryFilter === "active") {
        filteredComplaints = complaints.filter(c => c.status !== "Resolved");
    }
    if (currentHistoryFilter === "resolved") {
        filteredComplaints = complaints.filter(c => c.status === "Resolved");
    }

    container.innerHTML = "";

    if (filteredComplaints.length === 0) {
        empty.classList.remove("hidden");
        return;
    }
    empty.classList.add("hidden");
    filteredComplaints.forEach(complaint => {
        container.appendChild(createComplaintCard(complaint));
    });
}

// UPDATED DASHBOARD REFRESH
async function refreshDashboard() {
    if (!currentUser) return;
    const complaints = await getComplaints();
    
    renderRecentComplaints(complaints);
    renderActiveComplaints(complaints);
    renderHistory(complaints);
    profileComplaintCount.textContent = complaints.length;
}

const complaintModal = document.getElementById("complaintModal");
const closeComplaintModal = document.getElementById("closeComplaintModal");

function openComplaintModal(complaint) {
    document.getElementById("modalComplaintTitle").textContent = complaint.title;
    document.getElementById("modalComplaintId").textContent = complaint.id;
    
    const modalStatus = document.getElementById("modalStatus");
    modalStatus.textContent = complaint.status;
    modalStatus.className = `status-badge ${getStatusClass(complaint.status)}`;
    
    document.getElementById("modalStatusText").textContent = complaint.status;
    document.getElementById("modalCategory").textContent = complaint.category;
    document.getElementById("modalLocation").textContent = complaint.location;
    document.getElementById("modalDate").textContent = formatDate(complaint.createdAt);
    document.getElementById("modalDescription").textContent = complaint.description;

    renderTimeline([{
        title: "Complaint submitted",
        description: complaint.description,
        date: complaint.createdAt,
        state: "complete"
    }]);

    complaintModal.classList.add("show");
}

function renderTimeline(timeline) {
    const container = document.getElementById("statusTimeline");
    container.innerHTML = "";
    timeline.forEach(timelineItem => {
        const item = document.createElement("div");
        item.className = `timeline-item ${timelineItem.state}`;
        const information = timelineItem.date ? formatDate(timelineItem.date) : timelineItem.description;
        
        item.innerHTML = `
            <span class="timeline-point"></span>
            <strong>${escapeHTML(timelineItem.title)}</strong>
            <span>${escapeHTML(information)}</span>
        `;
        container.appendChild(item);
    });
}

closeComplaintModal.addEventListener("click", () => {
    complaintModal.classList.remove("show");
});

complaintModal.addEventListener("click", event => {
    if (event.target === complaintModal) {
        complaintModal.classList.remove("show");
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        complaintModal.classList.remove("show");
    }
});

function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

function escapeHTML(text) {
    const element = document.createElement("div");
    element.textContent = text || "";
    return element.innerHTML;
}

const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2700);
}

async function logout() {
    try { await signOut(auth); } catch (error) { console.error("Logout error:", error); }
    sessionStorage.removeItem("campusUser");
    window.location.href = "index.html";
}

document.getElementById("logoutButton").addEventListener("click", logout);
document.getElementById("sidebarLogout").addEventListener("click", logout);
document.getElementById("profileLogout").addEventListener("click", logout);

onAuthStateChanged(auth, async firebaseUser => {
    firebaseReady = true;
    if (!firebaseUser) {
        sessionStorage.removeItem("campusUser");
        window.location.href = "index.html";
        return;
    }

    const email = (firebaseUser.email || "").toLowerCase().trim();
    if (!email.endsWith("@vitbhopal.ac.in")) {
        await logout();
        return;
    }

    const student = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "Student",
        email: firebaseUser.email,
        photo: firebaseUser.photoURL,
        role: "student"
    };

    sessionStorage.setItem("campusUser", JSON.stringify(student));
    setCurrentUser(student);
});