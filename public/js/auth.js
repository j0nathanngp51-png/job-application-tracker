let isRegisterMode = false;

const form = document.getElementById("auth-form");
const toggleBtn = document.getElementById("toggle-mode");
const toggleText = document.getElementById("toggle-text");
const subtitle = document.getElementById("form-subtitle");
const submitBtn = document.getElementById("submit-btn");
const errorMsg = document.getElementById("error-msg");

toggleBtn.addEventListener("click", function () {
  isRegisterMode = !isRegisterMode;

  if (isRegisterMode) {
    subtitle.textContent = "Create a new account";
    submitBtn.textContent = "Sign Up";
    toggleText.textContent = "Already have an account?";
    toggleBtn.textContent = "Log in";
  } else {
    subtitle.textContent = "Log in to your account";
    submitBtn.textContent = "Log In";
    toggleText.textContent = "Don't have an account?";
    toggleBtn.textContent = "Sign up";
  }

  errorMsg.classList.add("hidden");
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  errorMsg.classList.add("hidden");

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    showError("Username and password are required.");
    return;
  }

  const endpoint = isRegisterMode ? "register.php" : "login.php";
  submitBtn.disabled = true;
  submitBtn.textContent = isRegisterMode ? "Signing up..." : "Logging in...";

  try {
    const res = await fetch(`/JOB-TRACKER/api/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const result = await res.json();

    if (result.success) {
      if (isRegisterMode) {
        // After successful registration, log them in automatically
        const loginRes = await fetch("/JOB-TRACKER/api/login.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const loginResult = await loginRes.json();
        if (loginResult.success) {
          window.location.href = "index.html";
        } else {
          showError("Account created — please log in.");
          toggleBtn.click(); // switch back to login mode
        }
      } else {
        window.location.href = "index.html";
      }
    } else {
      showError(result.error || "Something went wrong.");
    }
  } catch (err) {
    showError("Could not reach the server. Please try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = isRegisterMode ? "Sign Up" : "Log In";
  }
});

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove("hidden");
}
