const axios = require('axios');
const { performance } = require('perf_hooks');

// Function to send requests to the API
async function sendRequests(apiEndpoint, numberOfRequests,loginData) {
  let successCount = 0;
  let errorCount = 0;
  let errorCount1 = 0;

  const startTime = performance.now();

  // Use Promise.all to send multiple requests concurrently
  const requests = Array.from({ length: numberOfRequests }, async () => {
    try {
      const response = await axios.post(apiEndpoint,loginData);
      console.log(`Success: ${response.status} - ${response.statusText}`);
      successCount++;
    } catch (error) {
      console.error(`Error: ${error.message}`);
      errorCount++;
    }
  });

  // Wait for all requests to complete
  await Promise.all(requests);

  const endTime = performance.now();
  const totalTime = (endTime - startTime)/1000;

  // Display summary
  console.log('\nSummary:');
  console.log(`Successful requests: ${successCount}`);
  console.log(`Failed requests: ${errorCount}`);
  console.log(`Total time taken: ${totalTime.toFixed(2)} seconds`);
}

// Usage example
const apiEndpoint = 'http://localhost:5000/api/login';
const numberOfRequests = 500; // You can change this to the desired number of requests
const logData = {
    "email":"sixkerimmemmedov2001@gmail.com",
    "password":"20012912M.s"
}
sendRequests(apiEndpoint, numberOfRequests,logData);
