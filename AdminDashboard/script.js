const token = localStorage.getItem('authToken');
const allSideMenu = document.querySelectorAll('.sidebar .side-menu li a');

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


async function getAllCourses() {
    const response = await fetch(`https://localhost:7290/api/Course/courses`, {
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
                console.log(course.isVerified)
                const courseRow = `
                   <tr>
                       <td>
                           <img src="${course.displayPicture}" alt="${course.title}">
                           <p>${course.title}</p>
                       </td>
                       <td>${course.courseCode}</td>
                       <td><span class="status ${course.isVerified ? 'verified' : 'unverified'}">${course.isVerified ? 'Verified' : 'Unverified'}</span></td>
                        <td>${course.isVerified ? '' : `<a href="/CourseVerification/index.html?courseId=${course.id}">Verify Course</a>`}</td>
                   </tr>
               `;
                tableBody.insertAdjacentHTML('beforeend', courseRow);
            });
        }
    } else {
        const errorMessage = await response.text();
        tableBody.innerHTML = `<tr><td colspan="3">Failed to load courses. Error: ${errorMessage || 'Please try again later.'}</td></tr>`;
    }
}


document.querySelector("#logout").addEventListener("click", () => {
    localStorage.removeItem('authToken');
    window.location.href = "/HomePage/index.html";
})




getAllCourses();