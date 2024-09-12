const token = localStorage.getItem('authToken');
const IsAdmin = localStorage.getItem('isAdmin');
const questionTypeEnum = {
    0: "Multiple Choice",
    1: "Single Choice",
}
const QuizData = localStorage.getItem('currentQuiz');
const storedQuizData = JSON.parse(QuizData);

let quiz = storedQuizData;

let index = 0;
let selectedOptions = [];
let questions = quiz.questions.sort(() => 0.5 - Math.random()); 
let totalQuestion = quiz.questions.length;
console.log(totalQuestion);

$(function () {
    let totalTime = quiz.duration * 60; 
    let counter = 0;

    let timer = setInterval(function () {
        counter++;
        let min = Math.floor((totalTime - counter) / 60);
        let sec = totalTime - min * 60 - counter;
        $(".timerBox span").text(`${min}:${sec}`);
        
        if (counter >= totalTime) {
            alert("Time's up. Press OK to show the result.");
            clearInterval(timer);
            showResult();
        }
    }, 1000);

    printQuestion(index);

    if (IsAdmin === "true") {
        $("#submitButton").prop("disabled", true); 
        
    }
});

// Function to escape HTML characters
function escapeHtml(text) {
    if (typeof text !== 'string') {
        text = String(text);
    }
    
    return text.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;");
}

function printQuestion(i) {
    $(".questionBox").text(questions[i].questionText);
    console.log(questions[i].questionType)
    $(".optionBox").empty();

    let inputType = questionTypeEnum[questions[i].questiontype] === "Single Choice" ? "radio" : "checkbox";
    
    const options = Array.isArray(questions[i].questionOptions) ? questions[i].questionOptions : [];
    options.forEach((option) => {
        let escapedOption = escapeHtml(option.option); 
        let optionHTML = `
            <label>
                <input type="${inputType}" class="optionCheckbox" value="${escapedOption}">
                ${escapedOption}
            </label>`;
        $(".optionBox").append(optionHTML);
    });
}

// Function to save selected options
function saveSelectedOptions() {
    let selected = [];
    $(".optionCheckbox:checked").each(function() {
        selected.push($(this).val());
    });
    selectedOptions.push({
        questionId: questions[index].id,
        selectedOptions: selected
    });
}

// Function for the next question
function showNext() {
    saveSelectedOptions(); 
    if (index >= (questions.length - 1)) {
        if (IsAdmin !== "true") { 
            
            showResult();
        }
        localStorage.removeItem('isAdmin');
        return;
    }
    index++;
    printQuestion(index);
}


function showResult() {
    saveSelectedOptions(); 
    let payload = {
        quizId: quiz.id,
        answers: selectedOptions
    };

    console.log("Selected options:", payload);
    $("#questionScreen").hide();
    QuizResult(payload)
        .then(response => {
            if (response && response.data && response.data.score !== undefined) {
                const score = response.data.score;
                $("#Score").text(score);
                $("#totalQuestion").text(totalQuestion);
                $("#resultScreen").show();
            } else {
                console.error("Score not found in the response.");
                alert("There was an issue with retrieving your quiz score. Please try again.");
            }
        })
        .catch(error => {
            console.error("Failed to fetch quiz result:", error);
            alert("There was an error fetching your result. Please try again.");
        });
}


async function QuizResult(payload) {
    try {
        const response = await fetch(`https://localhost:7290/api/Course/result`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
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


