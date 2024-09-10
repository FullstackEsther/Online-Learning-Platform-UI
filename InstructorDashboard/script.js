
const allSideMenu = document.querySelectorAll('.sidebar .side-menu li a');
let isInstructor = false;
const token = localStorage.getItem('authToken');
console.log(token);

allSideMenu.forEach(item => {
    const li = item.parentElement;

    item.addEventListener('click', function () {
        allSideMenu.forEach(i => {
            i.parentElement.classList.remove('active');
        })
        li.classList.add('active');
    })
});

//sidebar navbar
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sideBar = document.getElementById('sidebar');

menuBar.addEventListener('click', function () {
    console.log("Menu bar clicked");
    sideBar.classList.toggle('hide');

})


const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');
searchButton.addEventListener('click', function (e) {
    if (window.innerWidth < 576) {
        e.preventDefault();
        searchForm.classList.toggle('show');
        if (searchForm.classList.contains('show')) {
            searchButtonIcon.classList.replace('bx-search', 'bx-x');
        } else {
            searchButtonIcon.classList.replace('bx-x', 'bx-search');
        }
    }

})


if (window.innerWidth < 768) {
    sideBar.classList.add('hide');
} else if (window.innerWidth > 576) {
    searchButtonIcon.classList.replace('bx-x', 'bx-search');
    searchForm.classList.remove('show');
}

window.addEventListener('resize', function () {
    if (this.innerWidth > 576) {
        searchButtonIcon.classList.replace('bx-x', 'bx-search');
        searchForm.classList.remove('show');
    }
})


document.querySelector("#get-profile").addEventListener("click", async function () {
    try {
        isInstructor = true;
        localStorage.setItem('IsInstructor', isInstructor);
        await getProfile();
    } catch (error) {
        console.error('Failed:', error.message);
        localStorage.setItem('profileData', null);
    } finally {
        window.location.href = '/Profile/profile.html';
    }
});

async function getProfile(){
    const response = await fetch(`https://localhost:7290/api/Instructor`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('profileData', JSON.stringify(data));
        localStorage.setItem('instructorId', data.data.id);
        return data;
    } else {
         localStorage.setItem('profileData', null);
        localStorage.setItem('instructorId', null);
    }
}

document.querySelector("#create-course").addEventListener("click", async function () {
    try {
        const response = await getProfile();
        if (response != null) {
            window.location.href = '/CreateCourse/index.html';
        }
        else{
            isInstructor = true;
            localStorage.setItem('IsInstructor', isInstructor);
            window.location.href = '/Profile/profile.html';
        }
    } catch (error) {
        console.error('Failed:', error.message);
    }
});

async function getInstructorCourses() {
     await getProfile();
    const instructorId = localStorage.getItem('instructorId');
    const response = await fetch(`https://localhost:7290/api/Course/instructor/${instructorId}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    const tableBody = document.querySelector('tbody');

    if (response.ok) {
        const courses = await response.json();

        if (courses.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3">There are no courses available yet.</td></tr>';
        } else {
            courses.data.forEach(course => {
                const courseRow = `
                    <tr>
                        <td>
                            <img src="${course.displayPicture}" alt="${course.title}">
                            <p>${course.title}</p>
                        </td>
                        <td>${course.courseCode}</td>
                        <td><span class="status ${course.isVerified ? 'verified' : 'unverified'}">${course.isVerified ? 'Verified' : 'Unverified'}</span></td>
                        <td><a href="/CreateCourse/index.html?courseId=${course.id}">Edit Course</a></td>
                        <td><a href="/CourseCurriculum/index.html?courseId=${course.id}">Add Curriculum</a></td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', courseRow);
            });
        }
    } else {
        tableBody.innerHTML = '<tr><td colspan="3">You do not have any created course at the moment.</td></tr>';
    }
}


document.querySelector("#logout").addEventListener("click",() =>{
    localStorage.removeItem('authToken');
    window.location.href= "/HomePage/index.html";
})


getInstructorCourses();





