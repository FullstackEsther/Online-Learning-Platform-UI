// home section starts
var menubtn = document.querySelector('.menu-btn');
var menuList = document.querySelector('.main-navbar .nav-list');
var menuListItems = document.querySelectorAll('.nav-list li a');
var instructorApplyBtn = document.querySelector('#instructor-apply');



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

var homesection = document.querySelector('.home');
window.addEventListener('scroll', pageScrollFunction);
window.addEventListener('load', pageScrollFunction);
function pageScrollFunction() {
    if (window.scrollY > 120) {
        homesection.classList.add('active');
    }
    else {
        homesection.classList.remove('active');
    }
}


$('.partners-slider').owlCarousel({
    loop: true,
    autoplay: true,
    autoplayTimeout: 3000,
    margin: 10,
    nav: true,
    navText: ["<i class = 'fa-solid fa-arrow-left'></i>",

        "<i class = 'fa-solid fa-arrow-right'></i>"],
    responsive: {
        0: {
            items: 1
        },
        500: {
            items: 2
        },
        700: {
            items: 3
        },
        1000: {
            items: 5
        }
    }
});


async function fetchCategories() {
    fetch('https://localhost:7290/api/Category/parentcategories') 
        .then(response => response.json())
        .then(data => {
            const categoriesContent = document.getElementById('categories-content');
            categoriesContent.innerHTML = ''; 

            data.data.forEach(category => {
                const categoryItem = document.createElement('div');
                categoryItem.className = 'category-item';
                categoryItem.dataset.categoryId = category.id;

                categoryItem.innerHTML = `
                    <div class="category-icon">
                        <i class="fa-solid fa-computer"></i>
                    </div>
                    <div class="category-desc">
                        <h3>${category.name}</h3>
                        <p>${category.description}</p>
                    </div>
                `;
                categoryItem.addEventListener('click', function() {
                    window.location.href = `/CourseByCategoryDisplay/index.html?categoryId=${category.id}`;
                });

                categoriesContent.appendChild(categoryItem);
            });
        })
        .catch(error => console.error('Error fetching categories:', error));
}

document.addEventListener('DOMContentLoaded', function () {
    fetchCategories();
    async function fetchCategories() {
        fetch('https://localhost:7290/api/Category/parentcategories') 
            .then(response => response.json())
            .then(data => {
                const categoriesContent = document.getElementById('categories-content');
                categoriesContent.innerHTML = ''; 
    
                data.data.forEach(category => {
                    const categoryItem = document.createElement('div');
                    categoryItem.className = 'category-item';
                    categoryItem.dataset.categoryId = category.id;
    
                    categoryItem.innerHTML = `
                        <div class="category-icon">
                            <i class="fa-solid fa-computer"></i>
                        </div>
                        <div class="category-desc">
                            <h3>${category.name}</h3>
                            <p>${category.description}</p>
                        </div>
                    `;
                    categoryItem.addEventListener('click', function() {
                        window.location.href = `/CourseByCategoryDisplay/index.html?categoryId=${category.id}`;
                    });
    
                    categoriesContent.appendChild(categoryItem);
                });
            })
            .catch(error => console.error('Error fetching categories:', error));
    }
    const coursesContainer = document.querySelector('.course-contents');

    fetch('https://localhost:7290/api/Course/verifiedcourses', {
        method: 'GET',
    })
        .then(async response => {
            if (!response.ok) {
                try {
                    const text = await response.text();
                    switch (text.status) {
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
                    errorMessage = `Failed to parse error response${jsonError}`;
                }

                throw new Error(errorMessage);
            }
            return response.json();
        }).then(data => {
            const
        courses = data.data;

        courses.forEach(course => {
            console.log(course);

            const courseCard = createCourseCard(course);

            courseCard.dataset.courseId = course.id;
            console.log(course.id);

            courseCard.addEventListener('click', function () {
                // const courseId = this.dataset.courseId;
                const detailsUrl = `/CourseDisplay/index.html?courseId=${course.id}`;
                window.location.href = detailsUrl;
            });
            coursesContainer.appendChild(courseCard);
        });
      })
      .catch(error => console.error('Failed to fetch courses:', error));
 
  
  function createCourseCard(course) {
    const courseCard = document.createElement('div');
    courseCard.className = 'course-card';
  
    courseCard.innerHTML = `
      <img class="course-img" src="${course.displayPicture}" alt="${course.title}">
      <div class="category">
        <div class="subject">
          <h3>${course.title}</h3>
        </div>
        <img src="${course.displayPicture}" alt="${course.categoryId}">
      </div>
      <h2 class="course-title">${course.title}</h2>
      <div class="course-desc">
        <span><i class="fa-solid fa-video"></i>${course.numberOfLessons} lessons</span>
        <span><i class="fa-solid fa-users"></i>2154+ Students</span>
      </div>
      <div class="course-ratings">
        <span>4.9 <i class="fa-solid fa-star"></i></span>
        <span><b>#</b>${course.price || '<b>Free</b>'}</span>
      </div>
    `;
  
    return courseCard;
}});

instructorApplyBtn.addEventListener('click', () => {
    localStorage.setItem('instructorApplication', 'true');
    window.location.href = '/LoginPage/index.html';  
});