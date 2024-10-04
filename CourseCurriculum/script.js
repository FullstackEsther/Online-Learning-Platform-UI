const token = localStorage.getItem('authToken');
const courseId = new URLSearchParams(window.location.search).get('courseId');

let moduleIdCount = 1;
let lessonIdCount = 1;
let quizIdCount = 1;
let questionIdCount = 1;
let OptionIdCount = 1;

const questionTypeEnum = {
    0: "Multiple Choice",
    1: "Single Choice",
}

function populateCourseData(courseData) {
    const modulesContainer = document.getElementById("modules-container");
    if (!modulesContainer) {
        console.error("Modules container not found!");
        return;
    }
    courseData.modules.forEach((module) => {
        const moduleId = module.id;
        console.log(moduleId);
        const moduleElement = document.createElement("div");
        moduleElement.classList.add("module");
        moduleElement.id = moduleId;
        moduleElement.dataset.moduleId = moduleId;

        moduleElement.innerHTML = `
            <span class="lesson-number">Module ${moduleIdCount++}:</span>
           <h2 class="section-title">
            Title: <span class="module-title">${module.title}</span>
             </h2>
            <div class="module-actions">
                <button class="edit" onclick="showEditModuleForm(this)"><i class='bx bxs-edit-alt'></i></button>
                <button class="delete" onclick="deleteModule(this)"data-module-id="${moduleId}"data-course-id="${courseId}"><i class='bx bx-trash'></i></button>
            </div>
            <div class="lessons-container"></div>
            <div class="add-buttons">
                <button class="btn add-lesson" onclick="showLessonForm(this)" data-module-id="${moduleId}"><i class='bx bx-plus'></i> Lesson</button>
                <button class="btn add-quiz" onclick="showQuizForm(this)" data-module-id="${moduleId}" data-quiz-added="${module.quiz ? 'true' : 'false'}"><i class='bx bx-plus'></i> Quiz</button>
            </div>`;

        // Populate lessons
        const lessonsContainer = moduleElement.querySelector(".lessons-container");
        if (!lessonsContainer) {
            console.error("Lessons container not found for module", moduleId);
            return;
        }
        module.lessons.forEach((lesson) => {
            const lessonId = lesson.id;
            const lessonElement = document.createElement("div");
            lessonElement.classList.add("lesson");
            lessonElement.id = lessonId;
            lessonElement.innerHTML = `
                <span class="lesson-number">Lesson ${lessonIdCount++}:</span>
                <span class="lesson-title">Topic :<span> ${lesson.topic}</span></span>
                <div class="lesson-actions">
                    <button class="edit" onclick="showEditLessonForm(this)"data-edit-module-id="${moduleId}" data-edit-lesson-id="${lessonId}"><i class='bx bxs-edit-alt'></i></button>
                    <button class="delete" onclick="deleteLesson(this)"data-module-id="${moduleId}"data-lesson-id="${lessonId}"><i class='bx bx-trash'></i></button>
                    <button class="edit-video" onclick="showEditLessonVideoForm(this)" data-edit-module-id="${moduleId}" data-edit-lesson-id="${lessonId}"><i class='bx bxs-video'></i></button>
                </div>
                <div class="lesson-content">
                    <p class="lesson-article">Article : <span>${lesson.article ? lesson.article : ''}</span></p>
                    <h5 class="lesson-duration">Duration <span>${lesson.totalMinutes}</span> minutes</h5>
                </div>`;
            lessonsContainer.appendChild(lessonElement);
        });
        // Populate quiz
        if (module.quiz) {
            const quizElement = document.createElement("div");
            quizElement.classList.add("quiz");
            quizElement.id = module.quiz.id;
            quizElement.innerHTML = `
                <h3 class="quiz-title">Quiz: (${module.quiz.duration} minutes)</h3>
                <div class="quiz-actions">
                    <button class="delete" onclick="deleteQuiz(this)"data-module-id="${moduleId}"><i class='bx bx-trash'></i></button>
                </div>
                <div class="questions-container"></div>
                <div class="add-question">
                <button class="btn add-question" onclick="showQuestionForm(this)" data-quiz-id="${module.quiz.id}" data-module-id ="${moduleId}"><i class='bx bx-plus'></i> Question</button>
            </div>`;
            lessonsContainer.appendChild(quizElement);

            // Populate quiz questions
            const questionsContainer = quizElement.querySelector(".questions-container");
            if (!questionsContainer) {
                console.error("Questions container not found for quiz", module.quiz.id);
                return;
            }
            module.quiz.questions.forEach((question) => {
                const questionId = question.id;;
                const questionElement = document.createElement("div");
                questionElement.classList.add("question");
                questionElement.id = questionId;
                questionElement.innerHTML = `
                    <span class="lesson-number">Question ${questionIdCount++}:</span>
                    <span class="question-text">${question.questionText} (${questionTypeEnum[question.questionType]})</span>
                    <div class="question-actions">
                        <button class="edit" onclick="showEditQuestionForm(this)"data-module-id ="${moduleId}"><i class='bx bxs-edit-alt'></i></button>
                        <button class="delete" onclick="deleteQuestion(this)"data-module-id ="${moduleId}" data-question-id="${questionId}"><i class='bx bx-trash'></i></button>
                    </div>
                    <div class="options-container"></div>
                     <div class="add-option">
                <button class="btn add-option" onclick="showOptionForm(this)" data-question-id="${questionId}"data-module-id="${moduleId}"><i class='bx bx-plus'></i> Option</button>
            </div>`;
                questionsContainer.appendChild(questionElement);

                // Populate question options
                const optionsContainer = questionElement.querySelector(".options-container");
                if (!optionsContainer) {
                    console.error("Options container not found for question", questionId);
                    return;
                }
                question.questionOptions.forEach((option) => {
                    const optionElement = document.createElement("div");
                    optionElement.classList.add("option");
                    optionElement.innerHTML = `
                        <span class="option-text">Option${OptionIdCount++} :${option.option}</span>
                        <span class="option-correct">(${option.isCorrect ? "Correct" : "Incorrect"})</span>
                        <div class="option-actions">
                            <button class="delete" onclick="deleteOption(this)"data-option-text="${option.option}" data-module-id="${moduleId}" data-question-id ="${questionId}"><i class='bx bx-trash'></i></button>
                        </div>`;
                    optionsContainer.appendChild(optionElement);
                    OptionIdCount = 1;
                });
            });
        }

        modulesContainer.appendChild(moduleElement);
        lessonIdCount = 1; quizIdCount = 1; questionIdCount = 1;
    });
}


async function fetchCourseData(courseId) {
    try {
        const response = await fetch(`https://localhost:7290/api/Course/${courseId}`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch course data: ${response.statusText}`);
        }
        const courseData = await response.json();
        populateCourseData(courseData.data);
    } catch (error) {
        console.error('Error fetching course data:', error);
        alert('Failed to load course data. Please try again.');
    }
}


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("module-form").addEventListener("submit", handleModuleFormSubmit);
    document.getElementById("lesson-form").addEventListener("submit", handleLessonFormSubmit);
    document.getElementById("lesson-video-form").addEventListener("submit", handleLessonVideoFormSubmit);
    document.getElementById("edit-lesson-form").addEventListener("submit", handleLessonFormSubmit);
    document.getElementById("quiz-form").addEventListener("submit", handleQuizFormSubmit);
    document.getElementById("question-form").addEventListener("submit", handleQuestionFormSubmit);
    document.getElementById("option-form").addEventListener("submit", handleOptionFormSubmit);
    fetchCourseData(courseId);
    loadQuestionType();
});



async function handleModuleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const title = form["module-title"].value;
    const editingModuleId = form.dataset.editingModuleId;
    console.log(editingModuleId);
    if (editingModuleId) {
        const module = document.getElementById(editingModuleId);
        const retrievedModuleId = module.dataset.moduleId;
        console.log(retrievedModuleId);
        await editModule(courseId, title, retrievedModuleId);
        if (module) {
            module.querySelector(".section-title").innerText = title;
        }
        form.removeAttribute("data-editing-module-id");

    } else {
        try {
            const response = await createModule(courseId, title);
            const moduleData = response.data;
            const moduleId = moduleData.id;
            const module = document.createElement("div");
            module.classList.add("module");
            module.id = moduleId;
            module.dataset.moduleId = moduleId;
            module.innerHTML = `
        <span class="lesson-number">Module ${moduleIdCount++}:</span>
           <h2 class="section-title">
             Title: <span class="module-title">${moduleData.title}</span>
             </h2>
            <div class="module-actions">
                <button class="edit" onclick="showEditModuleForm(this)"><i class='bx bxs-edit-alt'></i></button>
                <button class="delete" onclick="deleteModule(this)"data-module-id="${moduleId}"data-course-id="${courseId}"><i class='bx bx-trash'></i></button>
            </div>
            <div class="lessons-container"></div>
            
            <div class="add-buttons">
                <button class="btn add-lesson" onclick="showLessonForm(this)" data-module-id="${moduleId}"><i class='bx bx-plus'></i> Lesson</button>
                <button class="btn add-quiz" onclick="showQuizForm(this)" data-module-id="${moduleId}" data-quiz-added="false"><i class='bx bx-plus'></i> Quiz</button>
            </div>`;
            const modulesContainer = document.getElementById("modules-container");
            modulesContainer.appendChild(module);

        } catch (error) {
            console.error('Failed to create module:', error);
            alert('Failed to create module. Please try again.');
        }


    }
    closeModuleForm();
    form.reset();
}

async function createModule(courseId, title) {
    try {
        const response = await fetch(`https://localhost:7290/api/Course/module/${courseId}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(title)
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
                            errorMessage = `Error: Internal Error`;
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
        return response.json();

    } catch (error) {
        console.error('failed:', error.message);
        alert(error.message);
        throw error;
    }
}

async function editModule(courseId, title, moduleId) {
    try {
        const response = await fetch(`https://localhost:7290/api/Course/module/${courseId}/${moduleId}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(title)
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
                            errorMessage = `Error: Internal Error`;
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
        return response;

    } catch (error) {
        console.error('failed:', error.message);
        alert(error.message);
        throw error;
    }
}

async function createLesson(topic, file, article, moduleId, totalMinutes) {
    try {
        const formdata = new FormData();
        formdata.append('Model.Topic', topic);
        formdata.append('Model.File', file);
        formdata.append('Model.Article', article);
        formdata.append('Model.ModuleId', moduleId);
        formdata.append('Model.TotalMinutes', totalMinutes);
        const response = await fetch(`https://localhost:7290/api/Course/lesson`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formdata
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
                            errorMessage = `Error: Internal Error`;
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
        return response.json();

    } catch (error) {
        console.error('failed:', error.message);
        alert(error.message);
        throw error;
    }
}

async function editLesson(moduleId, lessonId, article, duration, topic) {
    try {

        const body = {
            article: article,
            topic: topic,
            totalMinutes: duration
        }
        const response = await fetch(`https://localhost:7290/api/Course/lesson/${moduleId}/${lessonId}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
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
                            errorMessage = `Error: Internal Error`;
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
        return response;

    } catch (error) {
        console.error('failed:', error.message);
        alert(error.message);
        throw error;
    }
}



async function handleLessonFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const title = form["lesson-title"].value;
    const article = form["lesson-article"].value;
    const duration = form["lesson-duration"].value;
    const editingLessonId = form.dataset.editingLessonId;
    const moduleId = document.getElementById("lesson-form-modal").dataset.moduleId;
    console.log(document.getElementById("lesson-form-modal"))

    if (editingLessonId) {

        const lesson = document.getElementById(editingLessonId);
        const retrieveModuleId = form.dataset.editingLessonModuleId;
        console.log(editingLessonId + "here");
        console.log(retrieveModuleId);
        if (lesson) {
            console.log("here")
            lesson.querySelector(".lesson-title").innerText = title;
            lesson.querySelector(".lesson-content .lesson-article").innerText = article;
            lesson.querySelector(".lesson-content .lesson-duration").innerText = duration;
            await editLesson(retrieveModuleId, editingLessonId, article, duration, title);
        }
        form.removeAttribute("data-editing-lesson-id");
    } else {

        const file = form["lesson-video"].files[0];
        const response = await createLesson(title, file, article, moduleId, duration);
        console.log(response.data)
        const Id = response.data.id;
        const lesson = document.createElement("div");
        lesson.classList.add("lesson");
        lesson.id = Id;
        lesson.dataset.lessonId = Id;
        lesson.innerHTML = `
        <span class="lesson-number">Lesson ${lessonIdCount++}:</span>
            <span class="lesson-title">Topic :<span> ${title}</span></span>
            <div class="lesson-actions">
                <button class="edit" onclick="showEditLessonForm(this)" data-edit-module-id="${moduleId}" data-edit-lesson-id="${Id}"><i class='bx bxs-edit-alt'></i></button>
                <button class="delete" onclick="deleteLesson(this)"data-module-id="${moduleId}" data-lesson-id="${Id}"><i class='bx bx-trash'></i></button>
                <button class="edit-video" onclick="showEditLessonVideoForm(this)"data-edit-module-id="${moduleId}" data-edit-lesson-id="${Id}"><i class='bx bxs-video'></i></button>
            </div>
            <div class="lesson-content">
                <p class="lesson-article">Article : <span>${article ? article : ''}</span></p>
                <h5 class="lesson-duration"> Duration <span>${duration}</span> minutes</h5>
            </div>`;
        const module = document.getElementById(moduleId);
        if (module) {
            module.querySelector(".lessons-container").appendChild(lesson);
        } else {
            console.error(`Module with ID ${moduleId} not found.`);
        }
    }

    closeLessonForm();
    form.reset();
}

async function editLessonVideo(file, lessonId, moduleId) {
    try {
        const formdata = new FormData();
        formdata.append('Request.File', file);
        formdata.append('Request.ModuleId', moduleId);
        formdata.append('Request.LessonId', lessonId);
        const response = await fetch(`https://localhost:7290/api/Course/lessonfile`, {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formdata
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
                            errorMessage = `Error: Internal Error`;
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
        return response;

    } catch (error) {
        console.error('failed:', error.message);
        alert(error.message);
        throw error;
    }
}


async function handleLessonVideoFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const videoFile = form["edit-lesson-video"].files[0];
    const lessonId = form.dataset.editingLessonId;
    const moduleId = form.dataset.editingLessonModuleId;
    if (!videoFile) {
        alert('Please select a video file to upload');
        return;
    }
    console.log(moduleId)

    if (lessonId && videoFile) {
        await editLessonVideo(videoFile, lessonId, moduleId);
        const lesson = document.getElementById(lessonId);
        // if (lesson) {
        //     const lessonContent = lesson.querySelector(".lesson-content");
        //     lessonContent.innerHTML += `
        //         <video controls>
        //             <source src="${URL.createObjectURL(videoFile)}" type="${videoFile.type}">
        //             Your browser does not support the video tag.
        //         </video>`;
        // }
    }

    closeLessonVideoForm();
    form.reset();
}

async function createQuiz(moduleId, duration) {
    try {
        const response = await fetch(`https://localhost:7290/api/Course/quiz/${moduleId}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(duration)
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
                            errorMessage = `Error: Internal Error`;
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
        return response.json();

    } catch (error) {
        console.error('failed:', error.message);
        alert(error.message);
        throw error;
    }
}


async function handleQuizFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const duration = form["quiz-duration"].value;
    const editingQuizId = form.dataset.editingQuizId;
    const moduleId = document.getElementById("quiz-form-modal").dataset.moduleId;
    console.log(document.getElementById("quiz-form-modal"));

    if (editingQuizId) {
        const quiz = document.getElementById(editingQuizId);
        if (quiz) {
            quiz.querySelector(".quiz-title").innerText = `Quiz (${duration} minutes)`;
        }
        form.removeAttribute("data-editing-quiz-id");
    } else {
        const module = document.getElementById(moduleId);
        const quizAdded = module.querySelector(".add-quiz").dataset.quizAdded === "true";
        if (quizAdded) {
            alert("Only one quiz is allowed per module.");
            return;
        }
        var response = await createQuiz(moduleId, duration);
        const Id = response.data.id;
        const quiz = document.createElement("div");
        quiz.classList.add("quiz");
        quiz.id = Id;

        quiz.innerHTML = `
            <h3 class="quiz-duration">Quiz: (${duration} minutes)</h3>
            <div class="quiz-actions">
                <button class="delete" onclick="deleteQuiz(this)"data-module-id ="${moduleId}"><i class='bx bx-trash'></i></button>
            </div>
            <div class="questions-container"></div>
            <div class="add-question">
                <button class="btn add-question" onclick="showQuestionForm(this)" data-quiz-id="${Id}" data-module-id ="${moduleId}"><i class='bx bx-plus'></i> Question</button>
            </div>`;

        if (module) {
            module.querySelector(".lessons-container").appendChild(quiz);
        } else {
            console.error(`Module with ID ${moduleId} not found.`);
        }
        module.querySelector(".add-quiz").dataset.quizAdded = "true";
        // const addQuizButton = module.querySelector(`[data-module-id="${moduleId}"]`);
        // addQuizButton.disabled = true;
    }

    closeQuizForm();
    form.reset();
}


function loadQuestionType() {
    fetch('https://localhost:7290/api/Enum/questiontype')
        .then(response => response.json())
        .then(data => {
            const levelSelect = document.getElementById('question-type');
            data.forEach(questiontype => {
                const option = document.createElement('option');
                option.value = questiontype.value;
                option.text = questiontype.name;
                levelSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading levels:', error));
}


async function addQuestion(moduleId, quizId, questionText, questionType) {
    try {
        const body = {
            questionText,
            questionType
        };
        const response = await fetch(`https://localhost:7290/api/Course/question/${moduleId}/${quizId}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
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
                            errorMessage = `Error: Internal Error`;
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
        return response.json();

    } catch (error) {
        console.error('failed:', error.message);
        alert(error.message);
        throw error;
    }
}


async function updateQuestion(moduleId, questionId, questionText, questionType) {
    try {
        const body = {
            questionText,
            questionType
        };
        const response = await fetch(`https://localhost:7290/api/Course/question/${moduleId}/${questionId}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
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
                            errorMessage = `Error: Internal Error`;
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
        return response.json();

    } catch (error) {
        console.error('failed:', error.message);
        alert(error.message);
        throw error;
    }
}


async function handleQuestionFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const questionText = form["question-text"].value;
    const questionType = form["question-type"].value;
    const editingQuestionId = form.dataset.editingQuestionId;
    const quizId = document.getElementById("question-form-modal").dataset.quizId;
    const moduleId = document.getElementById("question-form-modal").dataset.moduleId;
    console.log(moduleId);

    if (editingQuestionId) {
        const question = document.getElementById(editingQuestionId);
        if (question) {
            const editingModuleId = form.dataset.editingModuleId;
            await updateQuestion(editingModuleId, editingQuestionId, questionText, parseInt(questionType, 10));
            question.querySelector(".question-text").innerText = `${questionText} (${questionTypeEnum[questionType]})`;
        }
        form.removeAttribute("data-editing-question-id");
    } else {
        const response = await addQuestion(moduleId, quizId, questionText, parseInt(questionType, 10));
        const Id = response.data.id;
        const question = document.createElement("div");
        question.classList.add("question");
        question.id = Id;
        question.innerHTML = `
        <span class="lesson-number">Question ${questionIdCount++}:</span>
            <span class="question-text">${questionText} (${questionTypeEnum[questionType]})</span>
            <div class="question-actions">
                <button class="edit" onclick="showEditQuestionForm(this)"data-module-id ="${moduleId}"><i class='bx bxs-edit-alt'></i></button>
                <button class="delete" onclick="deleteQuestion(this)"data-module-id ="${moduleId}" data-question-id="${Id}"><i class='bx bx-trash'></i></button>
            </div>
            <div class="options-container"></div>
            <div class="add-option">
                <button class="btn add-option" onclick="showOptionForm(this)" data-question-id="${Id}" data-module-id="${moduleId}"><i class='bx bx-plus'></i> Option</button>
            </div>`;
        const quiz = document.getElementById(quizId);
        if (quiz) {
            quiz.querySelector(".questions-container").appendChild(question);
        }
    }

    closeQuestionForm();
    form.reset();
}

async function addOption(moduleId, questionId, optionText, isCorrect) {
    try {
        const body = {
            optionText,
            isCorrect
        };
        const response = await fetch(`https://localhost:7290/api/Course/option${moduleId}/${questionId}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
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
                            errorMessage = `Error: Internal Error`;
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
        return response.json();

    } catch (error) {
        console.error('failed:', error.message);
        alert(error.message);
        throw error;
    }
}

async function removeOption(moduleId, questionId, optionText) {
    try {

        const response = await fetch(`https://localhost:7290/api/Course/option/${moduleId}/${questionId}/${optionText}`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
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
                            errorMessage = `Error: Internal Error`;
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
        return response;

    } catch (error) {
        console.error('failed:', error.message);
        alert(error.message);
        throw error;
    }
}

async function handleOptionFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const optionText = form["option-text"].value;
    const optionCorrect = form["option-correct"].value === "true";
    const questionId = document.getElementById("option-form-modal").dataset.questionId;
    const moduleId = document.getElementById("option-form-modal").dataset.moduleId;
    console.log(moduleId);
    await addOption(moduleId, questionId, optionText, optionCorrect);
    const option = document.createElement("div");
    option.classList.add("option");

    option.innerHTML = `
        <span class="option-text">Option ${OptionIdCount++} : ${optionText}</span>
        <span class="option-correct">(${optionCorrect ? "Correct" : "Incorrect"})</span>
        <div class="option-actions">
            <button class="delete" onclick="deleteOption(this)"data-option-text="${optionText}" data-module-id="${moduleId}" data-question-id ="${questionId}"><i class='bx bx-trash'></i></button>
        </div>`;

    const question = document.getElementById(questionId);
    if (question) {
        question.querySelector(".options-container").appendChild(option);
    }

    closeOptionForm();
    form.reset();
}

function showModuleForm() {
    document.getElementById("module-form-modal").style.display = "block";
}

function closeModuleForm() {
    document.getElementById("module-form-modal").style.display = "none";
}

function showLessonForm(button) {
    console.log("Module ID:", button.dataset.moduleId);
    const modal = document.getElementById("lesson-form-modal");
    modal.style.display = "block";
    modal.dataset.moduleId = button.dataset.moduleId;
    console.log(modal)
}

function closeLessonForm() {
    document.getElementById("lesson-form-modal").style.display = "none";
}
function showEditLessonForm(button) {
    const lesson = button.closest(".lesson");
    const editModuleId = button.dataset.editModuleId;
    const editLessonId = button.dataset.editLessonId;
    if (!lesson) {
        console.error("Lesson element not found");
        return;
    }
    const lessonTitle = lesson.querySelector(".lesson-title span").innerText;
    const lessonArticle = lesson.querySelector("p span") ? lesson.querySelector("p span").innerText : "";
    const lessonDuration = lesson.querySelector("h5").innerText;

    const form = document.getElementById("edit-lesson-form");
    form["lesson-title"].value = lessonTitle;
    form["lesson-article"].value = lessonArticle;
    form["lesson-duration"].value = lessonDuration;
    form.dataset.editingLessonId = editLessonId;
    form.dataset.editingLessonModuleId = editModuleId;

    const modal = document.getElementById("edit-lesson-form-modal");
    modal.style.display = "block";
}
function closeEditLessonForm() {
    const modal = document.getElementById("edit-lesson-form-modal");
    modal.style.display = "none";
}


function showEditLessonVideoForm(button) {
    const lesson = button.closest(".lesson");
    if (lesson) {
        const editModuleId = button.dataset.editModuleId;
        const editLessonId = button.dataset.editLessonId;
        const form = document.getElementById("lesson-video-form");
        form.dataset.editingLessonId = editLessonId;
        form.dataset.editingLessonModuleId = editModuleId;
    }

    const modal = document.getElementById("lesson-video-form-modal");
    modal.style.display = "block";

}

function closeLessonVideoForm() {
    document.getElementById("lesson-video-form-modal").style.display = "none";
}

function showQuizForm(button) {
    const modal = document.getElementById("quiz-form-modal");
    modal.style.display = "block";
    modal.dataset.moduleId = button.dataset.moduleId;
}

function closeQuizForm() {
    document.getElementById("quiz-form-modal").style.display = "none";
}

function showQuestionForm(button) {
    const modal = document.getElementById("question-form-modal");
    console.log(modal);
    modal.style.display = "block";
    modal.dataset.quizId = button.dataset.quizId;
    modal.dataset.moduleId = button.dataset.moduleId;
}

function closeQuestionForm() {
    document.getElementById("question-form-modal").style.display = "none";
}

function showOptionForm(button) {
    const modal = document.getElementById("option-form-modal");
    modal.style.display = "block";
    modal.dataset.questionId = button.dataset.questionId;
    modal.dataset.moduleId = button.dataset.moduleId;
}

function closeOptionForm() {
    document.getElementById("option-form-modal").style.display = "none";
}

function showEditModuleForm(button) {
    const module = button.closest(".module");
    const title = module.querySelector(".section-title span").innerText;
    showModuleForm();
    const form = document.getElementById("module-form");
    form["module-title"].value = title;
    form.dataset.editingModuleId = module.id;
}
function showEditQuestionForm(button) {
    const question = button.closest(".question");
    const text = question.querySelector(".question-text").innerText.split(' (')[0];
    const type = question.querySelector(".question-text").innerText.split(' (')[1].slice(0, -1);
    showQuestionForm(button);
    const form = document.getElementById("question-form");
    form["question-text"].value = text;
    form["question-type"].value = type;
    form.dataset.editingQuestionId = question.id;
    form.dataset.editingModuleId = button.dataset.moduleId;
    console.log(button.dataset.moduleId)
}

async function removeModule(courseId, moduleId) {
    try {

        const response = await fetch(`https://localhost:7290/api/Course/module/${courseId}/${moduleId}`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
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
                            errorMessage = `Error: Internal Error`;
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
        return response;

    } catch (error) {
        console.error('failed:', error.message);
        alert(error.message);
        throw error;
    }
}

async function deleteModule(button) {
    const module = button.closest(".module");
    const courseId = button.dataset.courseId;
    const moduleId = button.dataset.moduleId;
    await removeModule(courseId, moduleId);
    module.remove();
}

async function removeLesson(moduleId, lessonId) {
    try {

        const response = await fetch(`https://localhost:7290/api/Course/lesson/${moduleId}/${lessonId}`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
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
                            errorMessage = `Error: Internal Error`;
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
        return response;

    } catch (error) {
        console.error('failed:', error.message);
        alert(error.message);
        throw error;
    }
}

async function deleteLesson(button) {
    const lesson = button.closest(".lesson");
    const moduleId = button.dataset.moduleId;
    const lessonId = button.dataset.lessonId;
    await removeLesson(moduleId, lessonId);
    lesson.remove();
}

async function removeQuiz(moduleId) {
    try {

        const response = await fetch(`https://localhost:7290/api/Course/quiz/${moduleId}`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
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
                            errorMessage = `Error: Internal Error`;
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
        return response;

    } catch (error) {
        console.error('failed:', error.message);
        alert(error.message);
        throw error;
    }
}

async function deleteQuiz(button) {
    const quiz = button.closest(".quiz");
    const moduleId = button.dataset.moduleId;
    await removeQuiz(moduleId);
    quiz.remove();
    document.querySelector(".add-quiz").dataset.quizAdded = false;
}

async function removeQuestion(moduleId, questionId) {
    try {

        const response = await fetch(`https://localhost:7290/api/Course/question/${moduleId}/${questionId}`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
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
                            errorMessage = `Error: Internal Error`;
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
        return response;

    } catch (error) {
        console.error('failed:', error.message);
        alert(error.message);
        throw error;
    }
}

async function deleteQuestion(button) {
    const question = button.closest(".question");
    const moduleId = button.dataset.moduleId;
    const questionId = button.dataset.questionId;
    await removeQuestion(moduleId, questionId);
    question.remove();
}

function deleteOption(button) {
    const option = button.closest(".option");
    const text = button.dataset.optionText;
    const moduleId = button.dataset.moduleId;
    const questionId = button.dataset.questionId;
    console.log(text);
    removeOption(moduleId, questionId, text);
    option.remove();
}

