Visual Product Matcher

Visual Product Matcher is an advanced web application that leverages Google's Gemini AI to find visually similar products across the web. Upload an image, and the application will analyze its features, search for matches, and display results from general web and e-commerce sites with a similarity score.

Key Features
AI-Powered Image Analysis: Utilizes the Google Gemini API to analyze uploaded images, detecting objects, dominant colors, style, and generating an optimized search query.
Dual Search Functionality: Performs concurrent searches on both general web and e-commerce platforms using the Google Custom Search API.
Visual Similarity Scoring: Compares the uploaded image with search result images to provide a percentage-based similarity score and identify matching features.
Interactive UI: A modern, responsive interface built with React, TypeScript, and shadcn/ui components.
Flexible Image Input: Supports drag-and-drop file uploads, file selection, and pasting image URLs.
Dynamic Filtering: Allows users to filter search results based on the AI-calculated similarity score.
Detailed Breakdowns: Displays detailed analysis from the AI, including detected objects, confidence scores, and the generated search query.
Tech Stack
Frontend: React, TypeScript, Tailwind CSS
UI Components: shadcn/ui, Lucide React
AI & Search: Google Gemini API, Google Custom Search API
State Management: Zustand
Build Tool: esbuild
Dependencies: Axios, React Hook Form, clsx, tailwind-merge
Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

Prerequisites
You need to have Node.js (version 16.x or higher) installed on your system.

Configuration
The application requires API keys for Google Gemini and Google Custom Search to function.

Create a .env file in the root of the project by copying the example file:

cp .env.example .env
Open the newly created .env file and add your API keys.

# .env.example
# Gemini
VITE_GEMINI_API_KEY=AIzaSyCS-Jaqg5GuALF32ApWhGSi5oVfu-JWNfk

# Google Custom Search – primary key
VITE_GOOGLE_API_KEY=AIzaSyDUrOB5S_1PXIbqrnIlUCzZF9kddaEBptE
VITE_GOOGLE_CX=b7e075e7f90154197

# Google Custom Search – secondary key (optional)
VITE_GOOGLE_API_KEY_2=AIzaSyBLjF8uo1cZMzJE9URnZc5_OAYQfemhV3s
VITE_GOOGLE_CX_2=a556df55959e64a4b
Installation & Execution
Clone the repository:

git clone https://github.com/unnyanr11/visual-product-matcher.git
cd visual-product-matcher
Install the dependencies:

npm install
Run the development server:

npm run dev
The application will be available at http://localhost:8000 (or another available port).

Build for production:

npm run build
This command compiles the application into static files in the dist/ directory, ready for deployment.

Deployment
The project is configured for easy deployment as a static site. The output from the npm run build command is the dist/ directory, which contains all the necessary HTML, CSS, and JavaScript files.

You can deploy this directory to any static hosting provider. Here are some recommendations:

Vercel: Easiest option. Simply drag and drop the dist/ folder into a new "Static" project dashboard.
Cloudflare Pages: Fastest global delivery. Upload a zip of the dist/ folder to create a new project.
Netlify: User-friendly. Drag and drop the dist/ folder onto the Netlify homepage.
GitHub Pages: Free and reliable. Upload the contents of the dist/ folder to a repository and enable GitHub Pages in the settings.
For developers, you can set up Git-based auto-deployment by connecting your repository to Vercel or Netlify and configuring the build settings:

Build Command: npm run build
Publish Directory: dist
Project Structure
src/: Contains all the application source code.
components/: Reusable React components, including UI components from shadcn.
services/: Logic for interacting with external APIs (Gemini, Google Custom Search).
pages/: The main page components of the application.
hooks/: Custom React hooks.
types/: TypeScript type definitions for data structures like products and search results.
lib/: Utility functions and client initializations.
scripts/: Contains the esbuild configuration for development and production builds.
dist/: The production-ready output directory. This is not committed to the repository.
package.json: Lists project dependencies and scripts.
tailwind.config.js: Configuration file for Tailwind CSS.
tsconfig.json: TypeScript compiler configuration.
