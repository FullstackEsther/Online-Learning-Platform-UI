const save = document.querySelector("#save-btn");
const cancel = document.querySelector("#cancel-btn");
const reset = document.querySelector("#reset-btn");
const firstName = document.querySelector("#firstName");
const lastName = document.querySelector("#lastName");
const biography = document.querySelector("#biography");
const emailInput = document.querySelector("#email");
const fileInput = document.querySelector(".account-settings-fileinput");
const retrieveEmail = localStorage.getItem('Email');
const currentPassword = document.getElementById('current-password');
const newPassword = document.getElementById('new-password');
const email = JSON.parse(retrieveEmail);
const token = localStorage.getItem('authToken');
console.log(token)
let isNewProfile = false;
const isInstructor = localStorage.getItem('IsInstructor');






document.addEventListener('DOMContentLoaded', function () {
    const profileData = JSON.parse(localStorage.getItem('profileData'));
    console.log('Loaded profileData:', profileData);
    console.log(token);
    if (profileData) {
        loadData(profileData.data);
        isNewProfile = false;
    } else {
        loadData({});
        isNewProfile = true;
    }
});

function loadData(data) {
    console.log(data);
    const image = document.querySelector('.tab-pane img');
    const firstName = document.querySelector("#firstName");
    const lastName = document.querySelector("#lastName");
    const biography = document.querySelector("#biography");
    const emailInput = document.querySelector("#email");

    if (data && Object.keys(data).length !== 0) {
        image.src = data.profilePicture || 'https://bootdey.com/img/Content/avatar/avatar1.png';
        firstName.value = data.firstName || '';
        lastName.value = data.lastName || '';
        biography.value = data.biography || '';
        emailInput.value = email || 'user@example.com';
    } else {
        image.src = 'https://bootdey.com/img/Content/avatar/avatar1.png';
        firstName.value = '';
        lastName.value = '';
        biography.value = '';
        emailInput.value = email || 'user@example.com';
    }
}



function handleFileChange(event) {
    const selectedFile = event.target.files[0]; 
   
    if (selectedFile) {
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(selectedFile.type)) {
            alert('Please select an image file (JPG, PNG, or GIF)');
            return;
        }

        if (selectedFile.size > 800000) { 
            alert('File size is too large! Maximum size is 800 KB.');
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            const image = document.querySelector('.tab-pane img'); 
            image.src = e.target.result; 
        };

        reader.readAsDataURL(selectedFile);
    }
}


async function addProfile(firstname, lastname, biography, profilepicture) {
    try {
        let url = '';
        if (isInstructor) {
            console.log("here");
            url ='https://localhost:7290/api/Instructor';
        }
        // else{
        //     url = 'https://localhost:7290/api/Student/profile';
        // }
        const formData = new FormData();
        formData.append('Model.ProfilePicture', profilepicture);
        formData.append('Model.FirstName', firstname);
        formData.append('Model.LastName', lastname);
        formData.append('Model.Biography', biography);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData,
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
        localStorage.removeItem('IsInstructor');
        isNewProfile = false;

    } catch (error) {
        console.error('profile failed:', error.message);
        alert(error.message);
    }
}

async function updateProfile(firstname, lastname, biography) {
    try {
        let url = '';
        if (isInstructor) {
            url ='https://localhost:7290/api/Instructor';
        }
        else{
            url = 'https://localhost:7290/api/Student/profile';
        }
        const body = {
            model: {
                firstName: firstname,
                lastName: lastname,
                biography: biography
            }
        };

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body),
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
        localStorage.removeItem('IsInstructor');
        return response.json();

    } catch (error) {
        console.error('profile failed:', error.message);
        alert(error.message);
    }
}

async function resetProfilePicture(profilePicture) {
    try {
        let url = '';
        if (isInstructor) {
            url ='https://localhost:7290/api/Instructor/profilepicture';
        }
        else{
            url = 'https://localhost:7290/api/Student/profilepicture';
        }
        const formData = new FormData();
        formData.append('File', profilePicture);

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData,
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
                errorMessage = `Error: ${'Profile not updated' || 'Unknown error'}`;
            }

            throw new Error(errorMessage);
        }
        localStorage.removeItem('IsInstructor');

    } catch (error) {
        console.error('profile failed:', error.message);
        alert(error.message);
    }
}

async function updatePassword(oldpassword,newPassword) {
    try {
        let url = '';
        if (isInstructor) {
            url ='https://localhost:7290/api/Auth/password';
        }
        else{
            url = 'https://localhost:7290/api/Auth/password';
        }
        const body = JSON.stringify({
                "oldPassword" : oldpassword,
                "newPassword" : newPassword,
        });

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: body,
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
        localStorage.removeItem('IsInstructor');
        return response;

    } catch (error) {
        console.error('profile failed:', error.message);
        alert(error.message);
    }
}






fileInput.addEventListener('change', handleFileChange);

save.addEventListener('click', function (e) {
    e.preventDefault();
    const activeTab = document.querySelector('.tab-content .tab-pane.active');
    console.log(activeTab);
    if (activeTab.id === 'account-general') {
        isNewProfile ? addProfile(firstName.value, lastName.value, biography.value, fileInput.files[0]) : updateProfile(firstName.value, lastName.value, biography.value);
    } else if (activeTab.id === 'account-change-password') {
        updatePassword(currentPassword.value,newPassword.value); 
    }
})
cancel.addEventListener('click', function (e) {
    console.log("entered");
    if (isInstructor) {
        window.location.href = '/InstructorDashboard/instructor.html';
    }
    else{
        window.location.href = '/student/index.html';
    }
    e.preventDefault();
})
reset.addEventListener('click', function (e) {
    resetProfilePicture(fileInput.files[0]);
    e.preventDefault();
})