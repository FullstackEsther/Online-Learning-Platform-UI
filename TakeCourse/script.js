let currentLessonIndex = 0;
let currentSectionIndex = 0;
let currentContentIndex = 0;
let currentLessons = [];
let sections = document.querySelectorAll('.section');
let course;
const token = localStorage.getItem('authToken');


function loadLesson(contentSrc, contentType = 'video') {
    const videoPlayer = document.querySelector('.video-player');
    const articleContainer = document.querySelector('.article-container');

    if (contentType === 'video') {
        if (videoPlayer) {
            videoPlayer.style.display = 'block';
            videoPlayer.innerHTML = `<video src="${contentSrc}" controls autoplay controlsList="nodownload"></video>`;
        }
        if (articleContainer) {
            articleContainer.style.display = 'none';
        }
    }
    // } else if (contentType === 'article') {
    //     if (videoPlayer) {
    //         videoPlayer.style.display = 'none';
    //     }
    //     if (articleContainer) {
    //         articleContainer.style.display = 'block';
    //         articleContainer.innerHTML = `<iframe src="${contentSrc}" frameborder="0"></iframe>`;
    //     }
    // } else {
    //     console.error('Unknown content type:', contentType);
    // }
}


function updateCurrentLessons() {
    const section = sections[currentSectionIndex];
    currentLessons = Array.from(section.querySelectorAll('.lessons li'));
}

function moveToNext() {
    const currentLesson = currentLessons[currentLessonIndex];

    if (!currentLesson) {
        console.log('No more lessons in this section.');
        return;
    }

    const videoSrc = currentLesson.getAttribute('data-video-src');
    // const articleSrc = currentLesson.getAttribute('data-article-src');
    const title = currentLesson.textContent;

    if (currentContentIndex === 0 && videoSrc) {
        loadLesson(videoSrc, 'video');
        currentContentIndex++;
    } else if (currentContentIndex === 1 && articleSrc) {
        loadLesson(articleSrc, 'article');
        currentContentIndex++;
    } else {
        currentContentIndex = 0;
        if (currentLessonIndex < currentLessons.length - 1) {
            currentLessonIndex++;
            moveToNext();
        } else if (currentSectionIndex < sections.length - 1) {
            currentSectionIndex++;
            currentLessonIndex = 0;
            updateCurrentLessons();
            toggleSection(sections[currentSectionIndex].querySelector('.section-title'));
            moveToNext();
        } else {
            console.log('No more lessons available.');
        }
    }
}
function toggleSection(sectionTitleElement) {
    const section = sectionTitleElement.parentElement;
    const lessonsList = section.querySelector('.lessons');

    if (lessonsList.style.display === 'none' || !lessonsList.style.display) {

        lessonsList.style.display = 'block';
    } else {

        lessonsList.style.display = 'none';
    }
}


function handleLessonClick(event) {
    const lesson = event.target;
    currentLessonIndex = currentLessons.indexOf(lesson);
    currentContentIndex = 0;
    moveToNext();
}

function getCourseIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('courseId');
}

async function getCourse(courseId) {
    try {
        const response = await fetch(`https://localhost:7290/api/Course/${courseId}`);
        const result = await response.json();

        if (result.status && result.data) {
            course = result.data;
            populateCourseDisplay(result.data);
        } else {
            console.error('Failed to fetch course data:', result.message);
        }
    } catch (error) {
        console.error('Error fetching course data:', error);
    }
}

async function populateCourseDisplay(course) {
    document.getElementById('course-title').innerText = course.title;
    const courseContent = document.getElementById('course-content');

    course.modules.forEach((module, moduleIndex) => {
        const moduleElement = document.createElement('div');
        moduleElement.className = 'section';

        const moduleTitle = document.createElement('div');
        moduleTitle.className = 'section-title';
        moduleTitle.innerText = `Module ${moduleIndex + 1}: ${module.title}`;
        moduleTitle.onclick = function () {
            toggleSection(moduleTitle);
        };
        moduleElement.appendChild(moduleTitle);

        const lessonsList = document.createElement('ul');
        lessonsList.className = 'lessons';

        module.lessons.forEach((lesson) => {
            console.log(module.lessons)
            const lessonItem = document.createElement('li');
            lessonItem.dataset.courseId = course.id;
            lessonItem.dataset.lessonId = lesson.id;
            console.log(course.id, lesson.id);

            lessonItem.innerText = lesson.topic;

            if (lesson.file) {
                lessonItem.dataset.videoSrc = lesson.file;
            }

            if (lesson.article) {
                lessonItem.dataset.articleSrc = lesson.article;
            }
            lessonItem.addEventListener('click', function () {
                AddProgress(course.id, lesson.id);
                const videoSrc = this.dataset.videoSrc;
                if (videoSrc) {
                    console.log('Playing video from:', videoSrc);
                    const videoPlayer = document.getElementById('video-player');
                    videoPlayer.src = videoSrc;
                    videoPlayer.play();
                    videoPlayer.onended = () => {
                        const courseId = this.dataset.courseId;
                        const lessonId = this.dataset.lessonId;
                        UpdateProgress(courseId, lessonId);

                        console.log(`Video ended. Progress updated for Course ID: ${courseId}, Lesson ID: ${lessonId}`);
                    };
                } else {
                    console.log('No video available for this lesson.');
                }
            });

            lessonsList.appendChild(lessonItem);
        });

        moduleElement.appendChild(lessonsList);
        console.log(module.quiz)
        if (module.quiz) {
            const quizButton = document.createElement('button');
            quizButton.className = 'quiz-button';
            quizButton.innerText = 'Take Quiz';
            quizButton.onclick = function () {
                goToQuiz(module.id);
            };
            lessonsList.appendChild(quizButton);
        }

        courseContent.appendChild(moduleElement);
    });
}

function goToQuiz(moduleId) {
    const module = course.modules.find(m => m.id === moduleId);

    if (module && module.quiz) {
        localStorage.setItem('currentQuiz', JSON.stringify(module.quiz));
        window.location.href = `/QuizPage/index.html?moduleId=${moduleId}`;
    } else {
        console.error('Quiz not found for the selected module');
    }
}

async function AddProgress(courseId, lessonId) {
    try {
        const response = await fetch(`https://localhost:7290/api/Progress/${courseId}/${lessonId}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('Error fetching course data:', error);
    }
}
async function UpdateProgress(courseId, lessonId) {
    try {
        const response = await fetch(`https://localhost:7290/api/Progress/${courseId}/${lessonId}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to update progress');
            return null;
        }

    } catch (error) {
        console.error('Error updating progress:', error);
        return null;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // console.log(localStorage.getItem('0e885aea-5425-4e22-be2d-b319b13c6dda'));
    const courseId = getCourseIdFromUrl();
    if (courseId) {
        getCourse(courseId);
    } else {
        console.error('No course ID found in URL');
    }
});

document.querySelector('.back-button').addEventListener('click', () => {
    window.location.href = '/student/index.html';
});




// Initial setup
updateCurrentLessons();
document.querySelectorAll('.lessons li').forEach(lesson => {
    lesson.addEventListener('click', handleLessonClick);
});
document.querySelector('.next-button').addEventListener('click', moveToNext);

