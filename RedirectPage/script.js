 

// async function Enroll(courseId,trxref,token) {
//     try {
//       const response = await fetch(`https://localhost:7290/api/Enrollment/enroll?courseId=${encodeURIComponent(courseId)}&trxref=${encodeURIComponent(trxref)}`, {
//         method: 'POST',
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         }
//       });
//       if (response.ok) {
//         console.log(response);
//         return response.json();
//       }
//       return null;
  
//     } catch (error) {
//       console.error('Error fetching course data:', error);
//     }
//   }
//   Enroll(courseId, reference,token)
//       .then(data => {
//         if (data) {
//           window.location.href = `/TakeCourse/index.html?courseId=${courseId}`; 
//         }
//       })
//       .catch(error => {
//         console.error('Error during enrollment process:', error);
      // });



  document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    console.log("Paystack Redirection Token" , token);
    const courseId = new URLSearchParams(window.location.search).get('courseId');
    const reference = new URLSearchParams(window.location.search).get('reference');
    axios.post(`https://localhost:7290/api/Enrollment/enroll?courseId=${encodeURIComponent(courseId)}&trxref=${encodeURIComponent(reference)}`,{},{
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(response => {
        if (response.data) {
          window.location.href = `/TakeCourse/index.html?courseId=${courseId}`; 
        }
    }).catch(error => {
      console.error('Error fetching data:', error);
    });
  
  
  });

