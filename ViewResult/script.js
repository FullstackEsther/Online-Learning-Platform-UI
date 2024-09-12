const token = localStorage.getItem('authToken');
console.log(token);








async function getAllResult() {
    const response = await fetch(`https://localhost:7290/api/Student/results`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
 
    const tableBody = document.querySelector('tbody');
 
    if (response.ok) {
        const results = await response.json();
 
        if (results.data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3">There are no results available yet.</td></tr>';
        } else {
            results.data.forEach(result => {
                console.log(result.quizDto);
                localStorage.setItem('currentQuiz', JSON.stringify(result.quizDto));
                const resultRow = `
                    <tr>
                        <td>
                            <p>${result.quizDto.moduleTitle}</p>
                        </td>
                        <td>${result.score}</td>
                        <td><span class="status ${result.isPassedTest ? 'verified' : 'unverified'}">${result.isPassedTest ? 'Passed' : 'Failed'}</span></td>
                         <td>${result.isPassedTest ? '' : `<a href="/QuizPage/index.html?moduleId=${result.quizDto.moduleId}">Retake Quiz</a>`}</td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', resultRow);
            });
        }
    } else {
        tableBody.innerHTML = '<tr><td colspan="3">You have no Results. Please try again later.</td></tr>';
    }
 }


 document.addEventListener("DOMContentLoaded", () => {
    getAllResult();
 });

