const GOOGLE_APPS_SCRIPT_WEBAPP_URL = "http://localhost:3000/register";

function getShareCount() {
  return Number(localStorage.getItem("tfg_share_count")) || 0;
}
function isSubmitted() {
  return localStorage.getItem("tfg_submitted") === "true";
}
let shareCount = getShareCount();
let submitted = isSubmitted();

const welcomeScreen = document.getElementById("welcomeScreen");
const registerBtn = document.getElementById("registerBtn");
const formContainer = document.getElementById("formContainer");
const form = document.getElementById("registrationForm");
const whatsappShareBtn = document.getElementById("whatsappShareBtn");
const shareCounter = document.getElementById("shareCounter");
const shareCompleteMsg = document.getElementById("shareCompleteMsg");
const submitBtn = document.getElementById("submitBtn");
const loadingSpinner = document.getElementById("loadingSpinner");
const errorMsg = document.getElementById("errorMsg");
const successMsg = document.getElementById("successMsg");
const sharePopup = document.getElementById("sharePopup");
const popupMessage = document.getElementById("popupMessage");
const popupClose = document.getElementById("popupClose");
const fileInput = document.getElementById("screenshot");

registerBtn.addEventListener("click", () => {
  shareCount = getShareCount();
  submitted = isSubmitted();
  welcomeScreen.style.animation = "fadeIn 0.5s reverse";
  setTimeout(() => {
    welcomeScreen.style.display = "none";
    formContainer.style.display = "block";
    formContainer.style.animation = "fadeInUp 1s";
    updateShareUI();
    if (submitted) {
      disableForm();
      setTimeout(() => {
        window.location.href = "thankyou.html";
      }, 800);
    } else {
      enableForm();
      hideSuccess();
    }
  }, 400);
});

window.onload = () => {
  shareCount = getShareCount();
  submitted = isSubmitted();
  welcomeScreen.style.display = "flex";
  formContainer.style.display = "none";
};

whatsappShareBtn.addEventListener("click", function() {
  shareCount = getShareCount();
  if (shareCount < 5) {
    const message = encodeURIComponent("Hey Buddy, Join Tech For Girls Community!");
    const url = `https://wa.me/?text=${message}`;
    window.open(url, "_blank");

    shareCount++;
    localStorage.setItem("tfg_share_count", shareCount);
    updateShareUI();
  }
});

function updateShareUI() {
  shareCount = getShareCount();
  shareCounter.textContent = `Count: ${shareCount}/5`;
  if (shareCount >= 5) {
    whatsappShareBtn.disabled = true;
    shareCompleteMsg.style.display = "block";
  } else {
    whatsappShareBtn.disabled = false;
    shareCompleteMsg.style.display = "none";
  }
}

fileInput.addEventListener("click", function(e) {
  shareCount = getShareCount();
  if (shareCount < 5) {
    e.preventDefault();
    showSharePopup(5 - shareCount);
  }
});
fileInput.addEventListener("focus", function(e) {
  shareCount = getShareCount();
  if (shareCount < 5) {
    e.preventDefault();
    showSharePopup(5 - shareCount);
    fileInput.blur();
  }
});

function showSharePopup(remaining) {
  popupMessage.textContent = `Share to ${remaining} more ${remaining === 1 ? "person" : "people"} to continue.`;
  sharePopup.style.display = "flex";
}
popupClose.onclick = function() {
  sharePopup.style.display = "none";
};
sharePopup.onclick = function(e) {
  if (e.target === sharePopup) {
    sharePopup.style.display = "none";
  }
};

form.addEventListener("submit", function(e) {
  e.preventDefault();
  console.log("Form submit handler triggered");
  errorMsg.textContent = "";

  shareCount = getShareCount();
  if (shareCount < 5) {
    showSharePopup(5 - shareCount);
    return;
  }

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const college = document.getElementById("college").value.trim();
  const file = fileInput.files[0];

  // === File size check (10 MB limit) ===
  if (file && file.size > 10 * 1024 * 1024) { // 10 MB
    errorMsg.textContent = "File too large. Please upload a file smaller than 10MB.";
    submitBtn.disabled = false;
    submitBtn.style.display = "block";
    loadingSpinner.style.display = "none";
    return;
  }

  if (!name || !phone || !email || !college || !file) {
    errorMsg.textContent = "Please fill all required fields and upload your screenshot.";
    submitBtn.disabled = false;
    submitBtn.style.display = "block";
    loadingSpinner.style.display = "none";
    return;
  }

  loadingSpinner.style.display = "flex";
  submitBtn.style.display = "none";

  const reader = new FileReader();
  reader.onload = async function(event) {
    const fileData = event.target.result;

    const dataToSend = {
      name,
      phone,
      email,
      college,
      fileName: file.name,
      fileData: fileData
    };

    try {
      const response = await fetch(GOOGLE_APPS_SCRIPT_WEBAPP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
        mode: "cors"
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        localStorage.setItem("tfg_submitted", "true");
        window.location.href = "thankyou.html";
      } else {
        errorMsg.textContent = "Submission failed: " + (result.error || "Unknown error");
        submitBtn.disabled = false;
        submitBtn.style.display = "block";
        loadingSpinner.style.display = "none";
      }
    } catch (err) {
      console.error("Fetch error:", err);
      errorMsg.textContent = "Network error. Please try again.";
      submitBtn.disabled = false;
      submitBtn.style.display = "block";
      loadingSpinner.style.display = "none";
    }
  };

  reader.readAsDataURL(file);
});

function disableForm() {
  Array.from(form.elements).forEach((el) => (el.disabled = true));
  whatsappShareBtn.disabled = true;
  submitBtn.style.display = "none";
  loadingSpinner.style.display = "none";
}
function enableForm() {
  Array.from(form.elements).forEach((el) => (el.disabled = false));
  updateShareUI();
  submitBtn.style.display = "block";
  loadingSpinner.style.display = "none";
}
function showSuccess() {}
function hideSuccess() {
  successMsg.classList.remove("popup");
  successMsg.style.display = "none";
}
