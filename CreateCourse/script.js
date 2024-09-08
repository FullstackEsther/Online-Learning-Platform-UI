const token = localStorage.getItem('authToken');
window.onload = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');
  console.log(courseId);

  if (courseId) {
    try {
      const courseData = await GetCourseById(courseId);
      if (courseData) {
        document.querySelector('input[name="title"]').value = courseData.data.title;
        document.querySelector('select[name="level"]').value = courseData.data.level;
        document.querySelector('input[name="price"]').value = courseData.data.price;
        document.querySelector('select[name="category"]').value = courseData.data.categoryId;
        document.querySelector('input[name="courseCode"]').value = courseData.data.courseCode;
        document.querySelector('textarea[name="whatToLearn"]').value = courseData.data.whatToLearn;
        document.querySelector('select[name="status"]').value = courseData.data.courseStatus;

        const displayPictureInput = document.querySelector('input[name="displayPicture"]');
        if (displayPictureInput) {
          displayPictureInput.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Error loading course data:', error.message);
      alert('Failed to load course data. Please try again later.');
    }
  } else {
    const displayPictureInput = document.querySelector('input[name="displayPicture"]');
    if (displayPictureInput) {
      displayPictureInput.style.display = 'block';
    }
  }
};

async function GetCourseById(courseId) {
  const response = await fetch(`https://localhost:7290/api/Course/${courseId}`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    alert("Course doesn't exist");
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const previousButton = document.querySelector(".previous");
  const continueButton = document.querySelector(".continue");
  const headers = document.querySelectorAll("header");
  let currentIndex = 0;

  function updateButton() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');

    if (currentIndex === headers.length - 1) {
      continueButton.textContent = courseId ? "Update Course" : "Create Course";
    } else {
      continueButton.textContent = "Continue";
    }
  }

  previousButton.addEventListener("click", function () {
    if (currentIndex > 0) {
      headers[currentIndex].classList.add("hidden");
      currentIndex--;
      headers[currentIndex].classList.remove("hidden");
      updateButton();
    }
  });

  continueButton.addEventListener("click", async function () {
    if (currentIndex < headers.length - 1) {
      headers[currentIndex].classList.add("hidden");
      currentIndex++;
      headers[currentIndex].classList.remove("hidden");
      updateButton();
    } else if (currentIndex === headers.length - 1) {
      const title = document.querySelector('input[name="title"]').value.trim();
      const level = document.querySelector('select[name="level"]').value.trim();
      const price = document.querySelector('input[name="price"]').value.trim();
      const categoryId = document.querySelector('select[name="category"]').value.trim();
      const courseCode = document.querySelector('input[name="courseCode"]').value.trim();
      const whatToLearn = document.querySelector('textarea[name="whatToLearn"]').value.trim();
      const courseStatus = document.querySelector('select[name="status"]').value.trim();

      const urlParams = new URLSearchParams(window.location.search);
      const courseId = urlParams.get('courseId');

      if (courseId) {

        var response = await editCourse(courseId, title, level, categoryId, courseCode, whatToLearn, courseStatus, price);
        if (response != null) {
          
        }
      } else {

        const displayPicture = document.querySelector('input[name="displayPicture"]').files[0];
        var response = await createCourse(title, level, categoryId, courseCode, displayPicture, whatToLearn, courseStatus, price);
        if (response) {
          window.location.href("/instructorDashboard/instructor.html");
        }
      }
    }
  });

  updateButton();
  loadLevels();
  loadStatuses();
  await loadCategories();
});

async function createCourse(title, level, categoryId, courseCode, displayPicture, whatToLearn, courseStatus, price) {
  try {
    const formData = new FormData();
    formData.append('model.Title', title);
    formData.append('model.Level', level);
    formData.append('model.CategoryId', categoryId);
    formData.append('model.CourseCode', courseCode);
    formData.append('model.DisplayPicture', displayPicture);
    formData.append('model.WhatToLearn', whatToLearn);
    formData.append('model.CourseStatus', courseStatus);
    formData.append('model.Price', price);

    const response = await fetch('https://localhost:7290/api/Course/create', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to create course: ${response.statusText}`);
    }
    window.location.href("/instructorDashboard/instructor.html");
    return await response.json();
  } catch (error) {
    console.error('Course Creation Failed :', error.message);
    alert(error.message);
  }
}

async function editCourse(courseId, title, level, categoryId, courseCode, whatToLearn, courseStatus, price) {
  try {
    const data = {
      title: title,
      courseCode: courseCode,
      price: parseFloat(price),
      whatToLearn: whatToLearn,
      level: parseInt(level),
      courseStatus: parseInt(courseStatus),
      categoryId: categoryId
    };

    const response = await fetch(`https://localhost:7290/api/Course/course/${courseId}`, {
      method: 'PUT',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),

    });
    console.log('Payload:', JSON.stringify(data));
    if (!response.ok) {
      throw new Error(`Failed to update course: ${response.statusText}`);
    }
    window.location.href = '/InstructorDashboard/instructor.html';
  } catch (error) {
    console.error('Course Update Failed:', error.message);
    alert(error.message);
  }
}

function loadLevels() {
  fetch('https://localhost:7290/api/Enum/level')
    .then(response => response.json())
    .then(data => {
      const levelSelect = document.getElementById('level');
      data.forEach(level => {
        const option = document.createElement('option');
        option.value = level.value;
        option.text = level.name;
        levelSelect.appendChild(option);
      });
    })
    .catch(error => console.error('Error loading levels:', error));
}

function loadStatuses() {
  fetch('https://localhost:7290/api/Enum/courseStatus')
    .then(response => response.json())
    .then(data => {
      const statusSelect = document.getElementById('status');
      data.forEach(status => {
        const option = document.createElement('option');
        option.value = status.value;
        option.text = status.name;
        statusSelect.appendChild(option);
      });
    })
    .catch(error => console.error('Error loading statuses:', error));
}

async function loadCategories() {
  try {
    const response = await fetch('https://localhost:7290/api/Category/parentcategories');

    if (!response.ok) {
      throw new Error(`Failed to load categories: ${response.statusText}`);
    }

    const result = await response.json();
    const data = result.data;
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '';
    data.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.text = category.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading categories:', error.message);
    alert(error.message);
  }
}
