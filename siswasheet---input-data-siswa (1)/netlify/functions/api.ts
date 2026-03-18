import { Handler } from "@netlify/functions";
import axios from "axios";

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwcpTyuGU1pQTfAfIRKE103gu79vjJNgEOVdSsjvChZPVtQuQeU38vzcVZcgO6Xr-Fi/exec';

export const handler: Handler = async (event) => {
  // Netlify redirects /api/* to /.netlify/functions/api/:splat
  // We need to extract the sub-path (e.g., /students or /submit)
  const path = event.path.replace("/.netlify/functions/api", "");
  
  try {
    // Handle Search (GET /api/students)
    if (event.httpMethod === "GET" && (path === "/students" || path === "students")) {
      const query = event.queryStringParameters?.q || "";
      const response = await axios.get(`${APPS_SCRIPT_URL}?q=${encodeURIComponent(query)}`);
      
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response.data),
      };
    }
    
    // Handle Submit (POST /api/submit)
    if (event.httpMethod === "POST" && (path === "/submit" || path === "submit")) {
      const response = await axios.post(APPS_SCRIPT_URL, event.body, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response.data),
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Path not found: " + path }),
    };
    
  } catch (error: any) {
    console.error("API Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal Server Error" }),
    };
  }
};
