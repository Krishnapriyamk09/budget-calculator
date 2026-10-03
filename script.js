let notificationTimer;

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const budgetForm = document.getElementById("budgetForm");

registerForm.addEventListener("submit", function(event) {
    event.preventDefault();
    register();
});

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();
    login();
});

budgetForm.addEventListener("submit", function(event) {
    event.preventDefault();
    calculateBudget();
});

function showNotification(title, message, type = "success") {
    const notification = document.getElementById("notification");
    const notificationIcon = document.getElementById("notificationIcon");
    const notificationTitle = document.getElementById("notificationTitle");
    const notificationMessage = document.getElementById("notificationMessage");

    notificationTitle.textContent = title;
    notificationMessage.textContent = message;

    notification.classList.remove("error-notification", "warning-notification");

    if (type === "error") {
        notification.classList.add("error-notification");
        notificationIcon.textContent = "×";
    } else if (type === "warning") {
        notification.classList.add("warning-notification");
        notificationIcon.textContent = "!";
    } else {
        notificationIcon.textContent = "✓";
    }

    notification.classList.add("show");

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(function() {
        closeNotification();
    }, 4000);
}

function closeNotification() {
    document.getElementById("notification").classList.remove("show");
}

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);

    if (input.type === "password") {
        input.type = "text";
        button.textContent = "Hide";
    } else {
        input.type = "password";
        button.textContent = "Show";
    }
}

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function register() {
    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;

    if (!username || !email || !password) {
        showNotification(
            "Incomplete details",
            "Please fill in all the registration fields.",
            "warning"
        );
        return;
    }

    if (username.length < 3) {
        showNotification(
            "Invalid username",
            "Username must contain at least 3 characters.",
            "warning"
        );
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        showNotification(
            "Invalid email",
            "Please enter a valid email address.",
            "warning"
        );
        return;
    }

    if (password.length < 6) {
        showNotification(
            "Password too short",
            "Your password must contain at least 6 characters.",
            "warning"
        );
        return;
    }

    const users = getUsers();

    const usernameExists = users.some(function(user) {
        return user.username.toLowerCase() === username.toLowerCase();
    });

    if (usernameExists) {
        showNotification(
            "Username unavailable",
            "This username is already registered.",
            "error"
        );
        return;
    }

    const emailExists = users.some(function(user) {
        return user.email.toLowerCase() === email;
    });

    if (emailExists) {
        showNotification(
            "Email already registered",
            "An account with this email already exists.",
            "error"
        );
        return;
    }

    const newUser = {
        username: username,
        email: email,
        password: password,
        budget: {
            income: "",
            rent: "",
            groceries: "",
            transportation: "",
            entertainment: "",
            other: ""
        }
    };

    users.push(newUser);
    saveUsers(users);

    document.getElementById("registerUsername").value = "";
    document.getElementById("registerEmail").value = "";
    document.getElementById("registerPassword").value = "";

    showNotification(
        "Account created",
        "Your BudgetWise account has been created successfully.",
        "success"
    );

    setTimeout(function() {
        showLogin();
    }, 1000);
}

function login() {
    const loginValue = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!loginValue || !password) {
        showNotification(
            "Incomplete details",
            "Please enter your username or email and password.",
            "warning"
        );
        return;
    }

    const users = getUsers();

    const user = users.find(function(user) {
        return (
            user.username.toLowerCase() === loginValue.toLowerCase() ||
            user.email.toLowerCase() === loginValue.toLowerCase()
        );
    });

    if (!user) {
        showNotification(
            "Login failed",
            "No account was found with those details.",
            "error"
        );
        return;
    }

    if (user.password !== password) {
        showNotification(
            "Login failed",
            "The password you entered is incorrect.",
            "error"
        );
        return;
    }

    localStorage.setItem("loggedUser", user.username);

    document.getElementById("loginUsername").value = "";
    document.getElementById("loginPassword").value = "";

    showBudget();

    showNotification(
        "Welcome back",
        "You have logged in successfully.",
        "success"
    );
}

function calculateBudget() {
    const income = document.getElementById("income").value.trim();
    const rent = document.getElementById("rent").value.trim();
    const groceries = document.getElementById("groceries").value.trim();
    const transportation = document.getElementById("transportation").value.trim();
    const entertainment = document.getElementById("entertainment").value.trim();
    const other = document.getElementById("other").value.trim();

    if (
        income === "" ||
        rent === "" ||
        groceries === "" ||
        transportation === "" ||
        entertainment === "" ||
        other === ""
    ) {
        showNotification(
            "Incomplete budget",
            "Please enter all your income and expense amounts.",
            "warning"
        );
        return;
    }

    const incomeValue = Number(income);
    const rentValue = Number(rent);
    const groceriesValue = Number(groceries);
    const transportationValue = Number(transportation);
    const entertainmentValue = Number(entertainment);
    const otherValue = Number(other);

    const values = [
        incomeValue,
        rentValue,
        groceriesValue,
        transportationValue,
        entertainmentValue,
        otherValue
    ];

    const invalidValue = values.some(function(value) {
        return !Number.isFinite(value) || value < 0;
    });

    if (invalidValue) {
        showNotification(
            "Invalid amount",
            "Please enter valid positive amounts.",
            "warning"
        );
        return;
    }

    const loggedUser = localStorage.getItem("loggedUser");

    if (!loggedUser) {
        showLogin();
        return;
    }

    const users = getUsers();

    const userIndex = users.findIndex(function(user) {
        return user.username === loggedUser;
    });

    if (userIndex === -1) {
        localStorage.removeItem("loggedUser");
        showLogin();
        return;
    }

    const totalExpenses =
        rentValue +
        groceriesValue +
        transportationValue +
        entertainmentValue +
        otherValue;

    const balance = incomeValue - totalExpenses;

    users[userIndex].budget = {
        income: incomeValue,
        rent: rentValue,
        groceries: groceriesValue,
        transportation: transportationValue,
        entertainment: entertainmentValue,
        other: otherValue
    };

    saveUsers(users);

    updateSummary(incomeValue, totalExpenses, balance);
    displayResult(incomeValue, totalExpenses, balance);

    showNotification(
        "Budget updated",
        "Your monthly budget has been calculated and saved.",
        "success"
    );
}

function updateSummary(income, expenses, balance) {
    document.getElementById("summaryIncome").textContent =
        formatCurrency(income);

    document.getElementById("summaryExpense").textContent =
        formatCurrency(expenses);

    document.getElementById("summaryBalance").textContent =
        formatCurrency(balance);
}

function formatCurrency(amount) {
    return "₹" + amount.toLocaleString("en-IN");
}

function displayResult(income, expenses, balance) {
    const result = document.getElementById("result");

    let statusHTML = "";

    if (balance >= 0) {
        statusHTML = `
            <div class="result-status success">
                ✓ Remaining balance: ${formatCurrency(balance)}
            </div>
        `;
    } else {
        statusHTML = `
            <div class="result-status danger">
                ⚠ Overspending: ${formatCurrency(Math.abs(balance))}
            </div>
        `;
    }

    result.innerHTML = `
        <div class="result-box">
            <h3>Budget Summary</h3>

            <div class="result-row">
                <span>Total income</span>
                <strong>${formatCurrency(income)}</strong>
            </div>

            <div class="result-row">
                <span>Total expenses</span>
                <strong>${formatCurrency(expenses)}</strong>
            </div>

            ${statusHTML}
        </div>
    `;
}

function loadBudget(user) {
    const budget = user.budget || {};

    document.getElementById("income").value =
        budget.income !== "" && budget.income !== undefined
            ? budget.income
            : "";

    document.getElementById("rent").value =
        budget.rent !== "" && budget.rent !== undefined
            ? budget.rent
            : "";

    document.getElementById("groceries").value =
        budget.groceries !== "" && budget.groceries !== undefined
            ? budget.groceries
            : "";

    document.getElementById("transportation").value =
        budget.transportation !== "" && budget.transportation !== undefined
            ? budget.transportation
            : "";

    document.getElementById("entertainment").value =
        budget.entertainment !== "" && budget.entertainment !== undefined
            ? budget.entertainment
            : "";

    document.getElementById("other").value =
        budget.other !== "" && budget.other !== undefined
            ? budget.other
            : "";

    if (budget.income === "" || budget.income === undefined) {
        document.getElementById("summaryIncome").textContent = "—";
        document.getElementById("summaryExpense").textContent = "—";
        document.getElementById("summaryBalance").textContent = "—";

        document.getElementById("result").innerHTML = `
            <div class="result-box">
                <div class="result-placeholder">
                    Enter your income and expenses to see your budget summary.
                </div>
            </div>
        `;

        return;
    }

    const income = Number(budget.income) || 0;

    const expenses =
        (Number(budget.rent) || 0) +
        (Number(budget.groceries) || 0) +
        (Number(budget.transportation) || 0) +
        (Number(budget.entertainment) || 0) +
        (Number(budget.other) || 0);

    const balance = income - expenses;

    updateSummary(income, expenses, balance);
    displayResult(income, expenses, balance);
}

function showRegister() {
    document.getElementById("registerPage").style.display = "flex";
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("budgetPage").style.display = "none";
}

function showLogin() {
    document.getElementById("registerPage").style.display = "none";
    document.getElementById("loginPage").style.display = "flex";
    document.getElementById("budgetPage").style.display = "none";
}

function showBudget() {
    const loggedUser = localStorage.getItem("loggedUser");

    if (!loggedUser) {
        showLogin();
        return;
    }

    const users = getUsers();

    const user = users.find(function(user) {
        return user.username === loggedUser;
    });

    if (!user) {
        localStorage.removeItem("loggedUser");
        showLogin();
        return;
    }

    document.getElementById("registerPage").style.display = "none";
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("budgetPage").style.display = "block";

    const initial = user.username.charAt(0).toUpperCase();

    document.getElementById("userInitial").textContent = initial;
    document.getElementById("profileInitial").textContent = initial;
    document.getElementById("navUsername").textContent = user.username;
    document.getElementById("displayUsername").textContent = user.username;
    document.getElementById("displayEmail").textContent = user.email;

    loadBudget(user);
}

function logout() {
    localStorage.removeItem("loggedUser");

    document.getElementById("budgetForm").reset();

    showLogin();

    showNotification(
        "Logged out",
        "You have been logged out successfully.",
        "success"
    );
}

window.addEventListener("load", function() {
    const loggedUser = localStorage.getItem("loggedUser");

    if (loggedUser) {
        showBudget();
    } else {
        showRegister();
    }
});