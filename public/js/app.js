// Check if logged in; redirect to login page if not
async function checkAuth() {
  try {
    const res = await fetch("/JOB-TRACKER/api/get_applications.php");
    const data = await res.json();
    if (data.error === "Not logged in") {
      window.location.href = "login.html";
    }
  } catch (err) {
    console.error("Auth check failed:", err);
  }
}
checkAuth();

// Dark mode setup
const themeToggle = document.getElementById("theme-toggle");
const htmlEl = document.documentElement;

function applyTheme(isDark) {
  if (isDark) {
    htmlEl.classList.add("dark");
    themeToggle.textContent = "☀️ Light mode";
  } else {
    htmlEl.classList.remove("dark");
    themeToggle.textContent = "🌙 Dark mode";
  }
}

// Load saved preference, or default to light
const savedTheme = localStorage.getItem("theme");
applyTheme(savedTheme === "dark");

themeToggle.addEventListener("click", function () {
  const isDark = htmlEl.classList.contains("dark");
  applyTheme(!isDark);
  localStorage.setItem("theme", !isDark ? "dark" : "light");
});

let allApplications = [];

//badge color classes per status

const statusStyles = {
  Applied: "bg-slate-100 text-slate-700",
  Interviewing: "bg-amber-100 text-amber-800",
  Offer: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-rose-100 text-rose-800",
};

// load server apoplications:

async function loadApplications() {
  try {
    const res = await fetch("/JOB-TRACKER/api/get_applications.php");
    const data = await res.json();

    if (data.error) {
      console.error(data.error);
      return;
    }

    allApplications = data;
    renderApplications();
  } catch (err) {
    console.error("Failed to load applications:", err);
  }
}

// render the list and the filter dropdown

function renderApplications() {
  const filterValue = document.getElementById("status-filter").value;
  const searchValue = document
    .getElementById("search-box")
    .value.trim()
    .toLowerCase();
  const container = document.getElementById("app-list");

  let filtered =
    filterValue === "All"
      ? allApplications
      : allApplications.filter((app) => app.status === filterValue);

  if (searchValue) {
    filtered = filtered.filter((app) =>
      app.company_name.toLowerCase().includes(searchValue),
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
            <div class="text-center text-slate-400 dark:text-slate-500 text-sm py-10 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                No applications yet. Add one above to get started.
            </div>
        `;
    return;
  }

  container.innerHTML = filtered
    .map(
      (app) => `
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm transition">
            <div class="flex items-start justify-between">
                <div>
                    <h3 class="font-semibold text-slate-900 dark:text-white">${escapeHtml(app.job_title)}</h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400">${escapeHtml(app.company_name)}</p>
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[app.status] || statusStyles.Applied}">
                    ${escapeHtml(app.status)}
                </span>
            </div>

            <p class="text-xs text-slate-400 mt-2">Applied ${app.date_applied || "—"}</p>

            ${app.notes ? `<p class="text-sm text-slate-600 mt-2">${escapeHtml(app.notes)}</p>` : ""}

            ${app.job_url ? `<a href="${escapeHtml(app.job_url)}" target="_blank" class="text-sm text-indigo-600 hover:underline mt-2 inline-block">View posting →</a>` : ""}

            <div class="mt-3 flex gap-2">
                <button onclick="deleteApplication(${app.id})"
                    class="text-xs font-medium text-rose-600 hover:text-rose-800">
                    Delete
                </button>
            </div>
        </div>
    `,
    )
    .join("");
}

// escaping so the notes and company names dont fuck up the html

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// adding a new job application:
async function addApplication(formData) {
  const submitBtn = document.querySelector('#add-form button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Adding...";

  try {
    const res = await fetch("/JOB-TRACKER/api/add_application.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const result = await res.json();

    if (result.success) {
      loadApplications();
    } else {
      alert(result.error || "Something went wrong adding this application.");
    }
  } catch (err) {
    console.error("Failed to add application:", err);
    alert("Could not reach the server. Please try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Add application";
  }
}

// deleting the applciation:

async function deleteApplication(id) {
  const confirmed = confirm("Delete this application?");
  if (!confirmed) return;

  try {
    const res = await fetch("/JOB-TRACKER/api/delete_application.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await res.json();

    if (result.success) {
      loadApplications();
    }
  } catch (err) {
    console.error("Failed to delete application:", err);
  }
}

// bring up the form:

document.getElementById("add-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const companyName = document.getElementById("company_name").value.trim();
  const jobTitle = document.getElementById("job_title").value.trim();
  const jobUrl = document.getElementById("job_url").value.trim();

  if (!companyName || !jobTitle) {
    alert("Company name and job title are required.");
    return;
  }

  if (jobUrl && !jobUrl.startsWith("http")) {
    alert("Job URL should start with http:// or https://");
    return;
  }

  const formData = {
    company_name: companyName,
    job_title: jobTitle,
    status: document.getElementById("status").value,
    date_applied: document.getElementById("date_applied").value,
    job_url: jobUrl,
    notes: document.getElementById("notes").value.trim(),
  };

  addApplication(formData);
  this.reset();
});

// bring up the filter menu:

document
  .getElementById("status-filter")
  .addEventListener("change", renderApplications);

document
  .getElementById("search-box")
  .addEventListener("input", renderApplications);

document
  .getElementById("logout-btn")
  .addEventListener("click", async function () {
    try {
      await fetch("/JOB-TRACKER/api/logout.php", { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    window.location.href = "login.html";
  });

// load the applicatoins when the page open:
loadApplications();
