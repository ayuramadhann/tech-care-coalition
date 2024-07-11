let username = 'coalition';
let password = 'skills-test';
let auth = btoa(`${username}:${password}`);

function generateMonthLabels(startDate, endDate) {
  let labels = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    const month = currentDate.toLocaleString('default', {
      month: 'short'
    });
    const year = currentDate.getFullYear();
    labels.push(`${month}, ${year}`);

    // Move to the next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return labels;
}

$(document).ready(function () {
  $.ajax({
    url: 'https://fedskillstest.coalitiontechnologies.workers.dev',
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`
    },
    success: function (data) {
      console.log(data[3]);
      let userData = data[3];
      $('#detail-profile-picture').attr('src', userData.profile_picture);
      $('#detail-full-name').text(userData.name);
      $('#detail-birthday').text(userData.date_of_birth);
      $('#detail-gender').text(userData.gender);
      $('#detail-contact-info').text(userData.phone_number);
      $('#detail-emergency-contact').text(userData.emergency_contact);
      $('#detail-insurance-provider').text(userData.insurance_type);

      console.log(userData);
      $('#lab-result').empty();

      // Loop through the lab results and create list items
      userData.lab_results.forEach(function (result) {
        $('#lab-result').append(`
                    <li style="margin-bottom: 15px;">
                        <div class="flex">
                            <span>${result}</span>
                            <button><span><img src="download_FILL0_wght300_GRAD0_opsz24 (1).svg" alt=""></span></button>
                        </div>
                    </li>
                `);
      });

      $('table tr:not(:first)').remove();

      // Loop through the diagnoses and append to the table
      userData.diagnostic_list.forEach(function (diagnosis) {
        $('table').append(`
                    <tr>
                        <td>${diagnosis.name}</td>
                        <td>${diagnosis.description}</td>
                        <td>${diagnosis.status}</td>
                    </tr>
                `);
      });

      // Generate labels from October 2023 to March 2024
      const labels = generateMonthLabels('2023-10-01', new Date());
      const ctx = document.getElementById('myChart');
      const diastolicValues = userData.diagnosis_history.map(item => item.blood_pressure.diastolic.value);
      const systolicValues = userData.diagnosis_history.map(item => item.blood_pressure.systolic.value);

      let myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
              label: 'Diastolic',
              data: diastolicValues,
              borderColor: '#C26EB4',
              backgroundColor: '#C26EB4',
              borderWidth: 1,
              detail: userData.diagnosis_history
            },
            {
              label: 'Systolic',
              data: systolicValues,
              borderColor: '#7E6CAB',
              backgroundColor: '#7E6CAB',
              borderWidth: 1,
              detail: userData.diagnosis_history
            }
          ]
        },
      });

      function clickHandler(evt) {
        const points = myChart.getElementsAtEventForMode(evt, 'nearest', {
          intersect: true
        }, true);
        if (points.length) {
          const firstPoint = points[0];
          var label = myChart.data.labels[firstPoint.index];
          var value = myChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
          // Check the value range for the x-axis (label index)
          console.log(myChart.data);
          if (-1 < firstPoint.index && firstPoint.index < myChart.data.labels.length) {
            alert("You clicked me!");
          }
        }
      }

      // Attach the click handler to the canvas
      document.getElementById('myChart').onclick = clickHandler;
    },
    error: function (xhr, status, error) {
      console.warn(xhr, status, error);
    }
  });
});