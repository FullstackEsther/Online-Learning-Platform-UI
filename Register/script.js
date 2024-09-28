const regButton = document.querySelector('#register_btn');
const emailInput = document.querySelector('#reg-email');
const passwordInput = document.querySelector('#reg-pass');

const showHiddenPass = (regPass, regEye) =>{
    const input = document.getElementById(regPass),
    iconEye = document.getElementById(regEye)
    iconEye.addEventListener('click', () => {
        //chang password to text
        if(input.type ==='password'){
            //switch to text
            input.type = 'text'
            //icon change
            iconEye.classList.add('ri-eye-line')
            iconEye.classList.remove('ri-eye-off-line')
        }else{
            //Change to Password
            input.type = 'password'
            //icon change
            iconEye.classList.remove('ri-eye-line')
            iconEye.classList.add('ri-eye-off-line')
        }
    })
}

async function register(username, password) {
    try {
        const regBody = {
            userName: username,
            password: password
        };

        const response = await fetch('https://localhost:7290/api/User/register', {
            method: 'POST',
            body: JSON.stringify(regBody),
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
        console.error('Registraton failed:', error.message);
        alert(error.message);
    }
}

showHiddenPass('reg-pass','reg-eye');
regButton.addEventListener('click', function(e){
    register(emailInput.value,passwordInput.value);
    e.preventDefault();
})