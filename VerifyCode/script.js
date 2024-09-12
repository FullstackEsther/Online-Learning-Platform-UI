const inputs = document.querySelectorAll("input");
const button = document.querySelector("#verify-btn");

inputs.forEach((input, index1) => {
  input.addEventListener("keyup", (e) => {
    const currentInput = input,
      nextInput = input.nextElementSibling,
      prevInput = input.previousElementSibling;

    if (currentInput.value.length > 1) {
      currentInput.value = "";
      return;
    }
    if (nextInput && nextInput.hasAttribute("disabled") && currentInput.value !== "") {
      nextInput.removeAttribute("disabled");
      nextInput.focus();
    }
    if (e.key === "Backspace") {
      inputs.forEach((input, index2) => {
        if (index1 <= index2 && prevInput) {
          input.setAttribute("disabled");
          currentInput.value = "";
          prevInput.focus();
        }
      });
    }
    if (!inputs[5].disabled && inputs[5].value !== "") {
      button.classList.add("active");
      return;
    }
    button.classList.remove("active");
  });
});



async function compareCode(email, code) {
  try {
    const requestBody = {
      email: email,
      code: code
    };

    const response = await fetch('https://localhost:7290/api/Auth/compareCode', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      let errorMessage = `Error: ${response.status}`;
      const contentType = response.headers.get("Content-Type");

      if (contentType && contentType.includes("application/json")) {
        try {
          const errorData = await response.json();
          errorMessage = getErrorMessage(response.status, errorData.message);
        } catch (jsonError) {
          errorMessage = `Failed to parse error response`;
        }
      } else {
        const textData = await response.text();
        errorMessage = `Error: ${textData || 'Unknown error'}`;
      }

      throw new Error(errorMessage);
    }

    window.location.href = '/ResetPasswordForgotPassword/reset.html';
  } catch (error) {
    console.error('Verification failed:', error.message);
    alert(error.message);
  }
}

function getErrorMessage(status, message) {
  switch (status) {
    case 400:
      return `Bad Request: ${message}`;
    case 404:
      return `Not Found: ${message}`;
    case 409:
      return `Conflict: ${message}`;
    case 500:
      return `Internal Server Error`;
    default:
      return `Error: ${message || 'Unknown error'}`;
  }
}

const retrieveEmail = localStorage.getItem('userEmail');
const email = JSON.parse(retrieveEmail );
console.log(email);

window.addEventListener("load", () => inputs[0].focus());
button.addEventListener('click', function (e) {
  let code = '';
  inputs.forEach(input => {
    code += input.value;
  });
  if (code.length === 6) { 
    compareCode(email, code);
    e.preventDefault();
  } else {
    alert('Please enter a valid 6-digit code.');
  }
});
