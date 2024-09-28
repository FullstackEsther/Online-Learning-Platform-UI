let eye = document.querySelector(".container .new-password .eye");
let eyeSlash = document.querySelector(".container .new-password .eye-slash");
let newPassInput = document.querySelector(".container .new-password input");
let confirmPassInput = document.querySelector(".container .confirm-password input");
let submitBtn = document.querySelector(".container .submit-btn");
let msg = document.querySelector(".container .msg");
let passToggle = () => {
    if (newPassInput.type === "password") {
        newPassInput.type = "text";
        eye.style.display = "none";
        eyeSlash.style.display = "block";
    } else {
        newPassInput.type = "password";
        eye.style.display = "block";
        eyeSlash.style.display = "none ";
    }
}

let checkPassword = () => {
    if (newPassInput.value === confirmPassInput.value) {
        msg.style.display = "block";
        msg.style.color = "#00ff00";
        msg.innerHTML = `<i class = "fa-solid fa-circle-check"></i> Both passwords matched.`;
    } else {
        msg.style.display = "block";
        msg.style.color = "#ff0000";
        msg.innerHTML = `<i class = "fa-solid fa-triangle-exclamation"></i> Both passwords not matched.`;
    }
}

submitBtn.addEventListener("click", () => {
    if (newPassInput.value.length < 8 && newPassInput != "") {
        msg.style.display = "block";
        msg.style.color = "#808080";
        msg.innerHTML = "Please fill atleast 8 characters."
    } else if (newPassInput.value != "" && confirmPassInput.value != "") {
        checkPassword();

    } else {
        msg.style.display = "block";
        msg.style.color = "#808080";
        msg.innerHTML = "Please fill all required fields."
    }
})
let checkPassLength = () => {
    if (newPassInput.value.length >= 8) {
        confirmPassInput.disabled = false;
    } else {
        confirmPassInput.disabled = true;
    }
}





async function resetPassword(username, password, confirmPassword) {
    try {
        const requestBody = {
            userName: username,
            password: password,
            confirmPassword: confirmPassword
        };

        const response = await fetch('https://localhost:7290/api/Auth/resetPassword', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            let errorMessage = `Error: ${response.status}`;
            const contentType = response.headers.get("Content-Type");

            if (contentType && contentType.includes("application/json")) {
                try {
                    const errorData = await response.json();
                    switch (response.status) {
                        case 400:
                            errorMessage = `Bad Request: ${errorData.message}`;
                            break;
                        case 404:
                            errorMessage = `Not Found: ${errorData.message}`;
                            break;
                        case 409:
                            errorMessage = `Conflict: ${errorData.message}`;
                            break;
                        case 500:
                            errorMessage = `Internal Server Error`;
                            break;
                        default:
                            errorMessage = `Error: ${errorData.message || 'Unknown error'}`;
                            break;
                    }
                } catch (jsonError) {
                    errorMessage = `Failed to parse error response`;
                }
            } else {
                const textData = await response.text();
                errorMessage = `Error: ${textData || 'Unknown error'}`;
            }

            throw new Error(errorMessage);
        }
        window.location.href = '/LoginPage/index.html';

    } catch (error) {
        console.error('resetPassword failed:', error.message);
        alert(error.message);
    }
}



newPassInput.addEventListener("input", checkPassLength);
eye.addEventListener("click", passToggle);
eyeSlash.addEventListener("click", passToggle);

submitBtn.addEventListener('click', function (e) {
    const retrieveEmail = localStorage.getItem('userEmail');
    const email = JSON.parse(retrieveEmail);
    console.log(email);
    resetPassword(email, newPassInput.value, confirmPassInput.value);
    e.preventDefault();
})
