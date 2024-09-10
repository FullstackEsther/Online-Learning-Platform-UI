const forgotBtn = document.querySelector('#forgot-btn');
const emailInput = document.querySelector('#email');








async function sendCode(username) {
    try {
        const requestBody = {
            userName: username
        };

        const response = await fetch('https://localhost:7290/api/Auth/sendCode', {
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
        console.log("here");
        window.location.href = '/VerifyCode/verify.html';

    } catch (error) {
        console.error('Login failed:', error.message);
        alert(error.message);
    }
}

forgotBtn.addEventListener('click', function (e) {
    const email = emailInput.value;
    if (email) {
        localStorage.setItem('userEmail', JSON.stringify(email));
        sendCode(email);
    } else {
        console.error("Email input is empty.");
        alert('Please enter an email.');
    }
    e.preventDefault();
})
