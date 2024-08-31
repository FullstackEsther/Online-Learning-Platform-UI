var menubtn = document.querySelector('.menu-btn');
 var menuList = document.querySelector('.main-navbar .nav-list');
 var menuListItems = document.querySelectorAll('.nav-list li a'); 
menubtn.addEventListener('click', function(){
    menubtn.classList.toggle('active');
    menuList.classList.toggle('active');
});
for(var i = 0; i< menuListItems.length; i++)
    {
        menuListItems[i].addEventListener('click', menuItemClicked);
    }
    function menuItemClicked(){
        menubtn.classList.toggle('active');
        menuList.classList.toggle('active');
    }

    const categoryId = new URLSearchParams(window.location.search).get('categoryId');

    document.addEventListener('DOMContentLoaded', function () {
        const coursesContainer = document.querySelector('.course-contents');

        fetch(`https://localhost:7290/api/Course/getcategorycourses/${categoryId}`, {
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
                const courses = data.data;
    
            courses.forEach(course => {
                console.log(course);
    
                const courseCard = createCourseCard(course);
    
                courseCard.dataset.courseId = course.id;
                console.log(course.id);
    
                courseCard.addEventListener('click', function () {
                    const detailsUrl = `/CourseDisplay/index.html?courseId=${course.id}`;
                    window.location.href = detailsUrl;
                });
                coursesContainer.appendChild(courseCard);
            });
          })
          .catch(error => {console.error('Failed to fetch courses:', error); coursesContainer.innerHTML=`<p>There are no Courses in this Category</p>`})

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
                <span><b>#</b>${course.price? course.price : "Free"}</span>
              </div>
            `;
          
            return courseCard;
    }});