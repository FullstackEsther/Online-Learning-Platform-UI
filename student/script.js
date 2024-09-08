// const token = localStorage.getItem('authToken');
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
});

document.addEventListener("DOMContentLoaded", () => {
     GetEnrollments();
    // const courses = document.querySelectorAll('.course');

    // courses.forEach(course => {
    //     const progress = course.getAttribute('data-progress');
    //     const progressBar = course.querySelector('.progress');
    //     const progressText = course.querySelector('.progress-text');

    //     progressBar.style.width = `${progress}%`;
    //     progressText.textContent = `${progress}% completed`;

    //     course.addEventListener('click', () => {
    //         const courseUrl = course.getAttribute('data-course');
    //         window.location.href = courseUrl;
    //     });
    // });
});

document.querySelector("#get-profile").addEventListener("click", async function () {
    try {
        const response = await fetch(`https://localhost:7290/api/Student`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('profileData', JSON.stringify(data));
        } else {
            localStorage.setItem('profileData', null);
        }

    } catch (error) {
        console.error('Failed:', error.message);
        localStorage.setItem('profileData', null);
    } finally {
        window.location.href = '/Profile/profile.html';
    }
});

document.querySelector("#logout").addEventListener("click", () => {
    localStorage.removeItem('authToken');
    window.location.href = "/HomePage/index.html";
})

async function GetEnrollments() {
    try {
        const response = await fetch(`https://localhost:7290/api/Enrollment`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (response.ok) {
           const data = await response.json();
            populateDashboard(data.data);
        }

    } catch (error) {
        console.error('Error fetching course data:', error);
    }
}

  async function populateDashboard(enrollments) {
    const coursesContainer = document.querySelector('.courses-section .courses');
    coursesContainer.innerHTML = ''; 
    if (enrollments.length === 0) {
        coursesContainer.innerHTML = '<tr><td colspan="3">You have no enrolled courses yet.</td></tr>';
    } else {

        for (const enrollment of enrollments) {
        const courseProgress = await GetUserProgress(enrollment.courseId);
        console.log(courseProgress.numberOfCompletedLessons);
        const courseElement = document.createElement('div');
        courseElement.className = 'course';
        courseElement.dataset.progress = courseProgress;

        courseElement.innerHTML = `
            <img src="${enrollment.courseDto.displayPicture || 'default-image.jpg'}" alt="${enrollment.courseDto.title}">
            <div class="course-info">
                <h4>${enrollment.courseDto.title}</h4>
                <div class="progress-bar">
                    <div class="progress" style="width: ${courseProgress.numberOfCompletedLessons}%"></div>
                </div>
                <p class="progress-text">${courseProgress.numberOfCompletedLessons}% completed</p>
            </div>
        `;

        courseElement.addEventListener('click', () => {
            window.location.href = `/TakeCourse/index.html?courseId=${enrollment.courseId}`;
        });

        coursesContainer.appendChild(courseElement);
    };
}
}
async function GetUserProgress(courseId) {
    try {
        const response = await fetch(`https://localhost:7290/api/Progress/${courseId}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (response.ok) {
           const progress = await response.json();
           return progress;
        }

    } catch (error) {
        console.error('Error fetching course data:', error);
    }
}


