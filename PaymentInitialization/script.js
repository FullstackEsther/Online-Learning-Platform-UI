const courseId = new URLSearchParams(window.location.search).get('courseId');
const token = localStorage.getItem('authToken');
console.log("InitializationPage :", token);

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
async function populateCourseDetails(courseId) {
    try {
      const courseData = await GetCourseById(courseId);
      if (courseData) {
        document.getElementById('course-title').textContent = courseData.title;
        document.getElementById('course-amount').textContent = courseData.price; 
      } else {
        console.error('Course not found');
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      
    }
  }

  // async function InitializePayment(courseId) {
  //   const response = await fetch(`https://localhost:7290/api/Enrollment/initializepayment/${courseId}`, {
  //     method: 'POST',
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Authorization": `Bearer ${token}`
  //     }
  //   });
  //   if (response.ok) {
  //     const data = await response.text();
  //     // console.log(data)
  //     return data;
  
  //   } else {
  //     alert("Couldn't initialize Payment");
  //   }
  // }
  // var response = await InitializePayment(courseId);
  // if (response != null) {
  //   // console.log(response);
  //   window.location.href = response;
  //     // console.log(window.location.href);
  // }

document.getElementById('proceed-payment-btn').addEventListener('click', () => {
  const token = localStorage.getItem('authToken');
console.log("InitializationPage :", token);
    axios.post(`https://localhost:7290/api/Enrollment/initializepayment/${courseId}`,{},{
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(response => {
      if(response)
      {
        window.location.href = response.data;
      }
    }).catch(error => {
      console.error('Error fetching data:', error);
    });
});


populateCourseDetails(courseId);