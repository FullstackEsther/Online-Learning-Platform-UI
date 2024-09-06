const token = localStorage.getItem('authToken');
let course;

var menubtn = document.querySelector('.menu-btn');
var menuList = document.querySelector('.main-navbar .nav-list');
var menuListItems = document.querySelectorAll('.nav-list li a');
menubtn.addEventListener('click', function () {
  menubtn.classList.toggle('active');
  menuList.classList.toggle('active');
});
for (var i = 0; i < menuListItems.length; i++) {
  menuListItems[i].addEventListener('click', menuItemClicked);
}
function menuItemClicked() {
  menubtn.classList.toggle('active');
  menuList.classList.toggle('active');
}


function getCourseIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('courseId');
}

async function GetCourseById(courseId) {
  const response = await fetch(`https://localhost:7290/api/Course/${courseId}`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (response.ok) {
    const data = await response.json();
    console.log(data)
    return data.data;

  } else {
    alert("Course doesn't exist");
  }
}

function populateCourseDetails(course) {
  document.querySelector('.overview img').src = course.displayPicture || '';
  document.querySelector('.course-head .c-name h2').textContent = course.title || 'N/A';
  document.querySelector('.course-head p').textContent = course.courseStatus || 'N/A';
  document.querySelector('.course-head span').textContent = `#${course.price || '0'}`;
  // document.querySelector('.tutor img').src = course.instructorImage || ''; 
  document.querySelector('.tutor-det h5').textContent = course.instructorName || 'N/A';
  document.querySelector('.learn p').innerHTML = `<i class='bx bxs-check-circle'></i>${course.whatToLearn || 'N/A'}`;
  document.querySelector('.enroll p:nth-child(2)').innerHTML = `<i class='bx bx-time'></i>${course.totalTime || '0'} total minutes`;
  document.querySelector('.enroll p:nth-child(3)').innerHTML = `<i class='bx bx-news'></i>${course.numberOfLessons || '0'} lessons`;
}


(async function initializeCoursePage() {
  const courseId = getCourseIdFromUrl();
  if (courseId) {
    course = await GetCourseById(courseId);
    if (course) {
      populateCourseDetails(course);
    }
  } else {
    console.error('No courseId found in URL');
  }
})();

document.querySelector('#enroll-btn').addEventListener('click', async () => {
  if (token == null) {
    window.location.href = `/LoginPage/index.html`;
  } else {
    if (course.courseStatus === 1) {
      
       const response = await Enroll(course.id);
      if (response != null) {
        window.location.href = `/TakeCourse/index.html?courseId=${course.id}`;
      }

    }
    else {
      window.location.href = `/PaymentInitialization/index.html?courseId=${course.id}`;
    }
  }

});

async function Enroll(courseId) {
  try {
    const response = await fetch(`https://localhost:7290/api/Enrollment/enroll?courseId=${encodeURIComponent(courseId)}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    if (response.ok) {
      console.log(response);
      return response.json();
    }
    return null;

  } catch (error) {
    console.error('Error fetching course data:', error);
  }
}