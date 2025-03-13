const axios = require("axios");

async function testAPI() {
  try {
    const exampleData = {
      Name: "Animal Welfare Society",
      Type: "Non Profit",
      Description:
        "We are dedicated to protecting and improving the lives of animals through rescue, rehabilitation, and education programs.",
      "Target Audience":
        "Animal lovers, potential pet adopters, and community members interested in animal welfare",
      "Organization looking 1": "Non Profit",
      "Organization looking 2":
        "Looking for partnerships with pet food companies, veterinary clinics, and pet supply retailers to support our animal care programs and expand our reach in the community.",
    };

    console.log("Testing external API with example data...");
    const response = await axios.post(
      "https://causeconnect-api.onrender.com/test/complete-matching-process",
      exampleData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("API Response:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    return null;
  }
}

testAPI();
