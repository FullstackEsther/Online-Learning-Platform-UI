const loginButton = document.querySelector('#login_btn');
const emailInput = document.querySelector('#login-email');
const passwordInput = document.querySelector('#login-pass');


const showHiddenPass = (loginPass, loginEye) => {
    const input = document.getElementById(loginPass),
        iconEye = document.getElementById(loginEye)
    iconEye.addEventListener('click', () => {
        if (input.type === 'password') {
            input.type = 'text'
            iconEye.classList.add('ri-eye-line')
            iconEye.classList.remove('ri-eye-off-line')
        } else {
            input.type = 'password'
            iconEye.classList.remove('ri-eye-line')
            iconEye.classList.add('ri-eye-off-line')
        }
    })
}
function storeToken(token) {
    localStorage.setItem('authToken', token);
}
function getToken() {
    return localStorage.getItem('authToken');
}

function storeToken(token) {
    localStorage.setItem('authToken', token);
    console.log('Token stored:', token);
}

function getToken() {
    return localStorage.getItem('authToken');
}

async function assignRole(roleName, token) {
    try {
        const response = await fetch(`https://localhost:7290/api/User/assignrole?roleName=${encodeURIComponent(roleName)}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
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
                            errorMessage = `Error: Internal Error`;
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

        return true;

    } catch (error) {
        console.error('Role assignment failed:', error.message);
        alert(error.message);
        throw error;
    }
}



async function login(username, password) {
    try {
        const loginBody = {
            userName: username,
            password: password
        };

        const response = await fetch('https://localhost:7290/api/Auth/login', {
            method: 'POST',
            body: JSON.stringify(loginBody),
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

        let data = {};
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
            try {
                data = await response.json();
            } catch (jsonError) {
                console.warn('Login response is not valid JSON:', await response.text());
                throw new Error('Login response is not valid JSON.');
            }
        } else {
            console.warn('Login response is not JSON:', await response.text());
        }

        storeToken(data.token);
        console.log('Token stored:', localStorage.getItem('authToken'));

        const token = data.token;
        let userRoles = data.role
        console.log(userRoles);

        const isInstructor = localStorage.getItem('instructorApplication');
        if (isInstructor) {
            console.log("entered");
            const regeneratedToken = await assignRole('Instructor', token);
            storeToken(regeneratedToken);
            userRoles.push('Instructor');
            localStorage.removeItem('instructorApplication');
            console.log('Instructor role assigned successfully');
        }

        if (userRoles.length === 0) {
            console.log("entered");
            const regeneratedToken = await assignRole('Student', token);
            storeToken(regeneratedToken);
            console.log(regeneratedToken);
            userRoles.push('Student');

        }

        if (userRoles.includes('Admin')) {
            window.location.href = '/AdminDashboard/admin.html';
        } else if (userRoles.includes('Instructor')) {
            window.location.href = '/InstructorDashboard/instructor.html';
        } else {
            window.location.href = '/student/index.html';
        }

    } catch (error) {
        console.error('Login failed:', error.message);
        alert(error.message);
    }
}

async function assignStudentRole(roleName, token) {
    try {
        const response = await fetch(`https://localhost:7290/api/User/assignrole?roleName=${encodeURIComponent(roleName)}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
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
                            errorMessage = `Error: Internal Error`;
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

        return response.json();

    } catch (error) {
        console.error('Role assignment failed:', error.message);
        alert(error.message);
        throw error;
    }
}









showHiddenPass('login-pass', 'login-eye')
loginButton.addEventListener('click', function (e) {
    const email = emailInput.value;
    if (email) {
        localStorage.setItem('Email', JSON.stringify(email));
        login(emailInput.value, passwordInput.value);
        e.preventDefault();
    }
})