<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Voice Customer Support System - README</title>
</head>
<body>

    <h1>AI Voice Customer Support System</h1>
    <p><strong>Project Status:</strong> In Active Development</p>
    
    <p>This project is a modular, AI-driven Voice Interactive Voice Response (IVR) system. It replaces traditional robotic phone menus with a dynamic AI assistant capable of understanding natural human speech, identifying customer intents, querying a live database, and speaking back in both English and natural-sounding Tamil.</p>
    <p>It consists of a Node.js/Express backend that handles the telecommunications and AI logic, and a React frontend admin dashboard to monitor orders and configure testing environments.</p>

    <hr>

    <h2>What New Problem It Solves</h2>
    <p>Traditional IVR systems force callers through frustrating, time-consuming mazes ("Press 1 for this, Press 2 for that"). If a customer needs to cancel a grocery delivery or check a logistics route, they usually have to wait for a human agent.</p>
    <p>This system solves that by bridging the gap between a high-tech software backend and a simple phone call.</p>
    <ul>
        <li><strong>Zero Menu Fatigue:</strong> Customers speak their intent naturally.</li>
        <li><strong>Real-Time Action, Not Just Chat:</strong> Unlike standard chatbots that just answer FAQs, this AI securely authenticates the caller's phone number and executes live database operations (like halting a shipment before it goes out).</li>
        <li><strong>Localized Accessibility:</strong> By dynamically switching to regional languages like Tamil, it brings enterprise-grade AI customer support to local users who may not be comfortable navigating complex mobile apps or English-only menus.</li>
        <li><strong>Scalability for SaaS:</strong> Built with a highly modular architecture, this system can be easily adapted for multi-tenant SaaS platforms, e-commerce stores, or logistics delivery networks without rewriting the core telecom logic.</li>
    </ul>

    <hr>

    <h2>Core Concepts</h2>
    <ul>
        <li><strong>Conversational AI over Phone:</strong> Instead of just pressing buttons, users can speak their requests (e.g., "I want to cancel my order"). The audio is captured by Twilio, transcribed, and passed to Google's Gemini AI to extract the intent and order ID.</li>
        <li><strong>Dynamic Database Validation:</strong> The system does not just chat; it executes business logic. It checks caller ID against the database, verifies if an order can actually be cancelled (preventing cancellation of shipped orders), and updates the MySQL database in real-time.</li>
        <li><strong>Bilingual Support:</strong> The system dynamically switches between English and Tamil using Google Wavenet text-to-speech, handling regional nuances like English loan-words in spoken Tamil.</li>
        <li><strong>Modular Architecture:</strong> Both the frontend and backend are built using a strict, independent block-by-block architecture. Features like order status, order cancellation, and admin settings are completely isolated into their own files to ensure components can be added or removed without impacting existing features.</li>
    </ul>

    <hr>

    <h2>Tech Stack and Languages</h2>
    <ul>
        <li><strong>Languages Used:</strong> JavaScript, JSX, SQL, HTML, CSS.</li>
        <li><strong>Backend:</strong> Node.js, Express.js, MySQL. (Note: The backend strictly uses ESM / ECMAScript Modules, utilizing "import/export" syntax).</li>
        <li><strong>Frontend:</strong> React.js (Vite/Create React App).</li>
        <li><strong>AI Provider:</strong> Google Gemini API (Model: gemini-3.6-flash).</li>
        <li><strong>Telecom Provider:</strong> Twilio (Programmable Voice).</li>
    </ul>

    <h3>Libraries Installed</h3>
    <ul>
        <li><strong>Backend:</strong> express, mysql2 (for database pooling), @google/genai, dotenv, cors.</li>
        <li><strong>Frontend:</strong> react, react-dom, react-router-dom.</li>
    </ul>

    <h3>React Concepts Utilized</h3>
    <ul>
        <li><strong>Hooks:</strong> Extensive use of <code>useState</code> and <code>useEffect</code> for data fetching and state management.</li>
        <li><strong>React Router:</strong> Implemented nested routing and Layout components (PublicLayout vs AdminLayout) to securely separate public pages from the admin dashboard.</li>
        <li><strong>Component Lifecycle:</strong> Fetching database records dynamically on component mount.</li>
        <li><strong>Conditional Rendering:</strong> Displaying modal windows and dynamic tables based on state.</li>
    </ul>

    <hr>

    <h2>Folder Structure</h2>
    <p>Below is a simplified view of the project's architecture to demonstrate the separation of concerns.</p>
    
    <h3>Frontend Structure (React / Vite)</h3>
<pre><code>/ (Frontend Root)
├── index.html
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── App.css
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    │
    ├── assets/
    │   ├── hero.png
    │   ├── react.svg
    │   └── vite.svg
    │
    ├── components/              # Public-facing components
    │   ├── Help.jsx
    │   ├── Home.jsx
    │   ├── Navbar.jsx
    │   └── PublicLayout.jsx
    │
    └── admin/                   # Dedicated Admin Directory
        ├── components/          # Admin-specific components
        │   ├── AdminLayout.jsx
        │   ├── IvrMenusList.jsx
        │   ├── Login.jsx
        │   ├── OrdersList.jsx
        │   ├── ProductsList.jsx
        │   ├── Settings.jsx
        │   └── UsersList.jsx
        │
        └── styles/              # Admin-specific stylesheets
            ├── AdminPanel.css
            └── Login.css
</code></pre>

    <h3>Backend Structure (Node.js / Express)</h3>
<pre><code>voice-api-backend/
├── .env
├── curl
├── eslint.config.js
├── package-lock.json
├── package.json
├── server.js                    # Main server entry point
│
├── admin/                       # Admin API endpoints
│   ├── auth.js
│   ├── ivr.js
│   ├── orders.js
│   ├── products.js
│   ├── settings.js
│   └── users.js
│
├── config/                      # Database & state configuration
│   ├── db.js
│   └── testState.js
│
└── voice/                       # Public voice & IVR webhooks
    ├── ai-assistant.js
    ├── call.js
    └── order-status.js
</code></pre>

    <hr>

    <h2>System Workflow</h2>
    <ol>
        <li><strong>Incoming Call:</strong> A user dials the Twilio virtual phone number (+12207990117).</li>
        <li><strong>Routing:</strong> Twilio sends an HTTP POST request to the local backend via Ngrok.</li>
        <li><strong>IVR Menu:</strong> The Express server responds with TwiML (Twilio Markup Language), asking the user to select English or Tamil.</li>
        <li><strong>Handoff to AI:</strong> Depending on the menu choice, the call is routed to a specific module. If the user asks to cancel an order, Twilio records their speech and sends the text to the backend.</li>
        <li><strong>AI Processing:</strong> The backend prompts the gemini-3.6-flash model to extract the "intent" and "order ID" in strict JSON format.</li>
        <li><strong>Database Execution:</strong> The backend verifies the order in MySQL. If valid, it triggers a second confirmation prompt to the user.</li>
        <li><strong>Final Response:</strong> The system updates the MySQL database and Twilio speaks the success/failure message back to the user before hanging up.</li>
    </ol>

    <hr>

    <h2>Local Setup Instructions</h2>
    <p>To run this project on your local machine, follow these steps to configure the database, environment, and servers.</p>

    <h3>Step 1: Database Setup</h3>
    <ol>
        <li>Ensure MySQL is installed and running on your machine.</li>
        <li>Create a new database (e.g., <code>voice_support_db</code>).</li>
        <li>Create the necessary tables: <code>users</code>, <code>orders</code>, <code>order_items</code>, and <code>ivr_menus</code>.</li>
        <li>Insert mock data to test the caller ID security features.</li>
    </ol>

    <h3>Step 2: Environment Variables</h3>
    <p>Create a <code>.env</code> file in your <code>/backend</code> directory and add the following keys:</p>
<pre><code>GEMINI_API_KEY=your_google_gemini_api_key
PORT=3000</code></pre>

    <h3>Step 3: Start the Backend (Terminal 1)</h3>
    <p>Navigate to the backend folder and run:</p>
<pre><code>npm install express mysql2 @google/genai dotenv cors
npm start</code></pre>

    <h3>Step 4: Start the Frontend (Terminal 2)</h3>
    <p>Navigate to the frontend folder and run:</p>
<pre><code>npm install react react-router-dom
npm run dev</code></pre>

    <h3>Step 5: Start the Ngrok Tunnel (Terminal 3)</h3>
    <p>Twilio needs a public URL to communicate with your local Node.js server. Run:</p>
<pre><code>npx ngrok http 3000</code></pre>

    <h3>Step 6: Twilio Configuration & Webhooks</h3>
    <ol>
        <li>Once Ngrok is running, copy the Forwarding URL (e.g., <code>https://1234-abcd.ngrok-free.app</code>).</li>
        <li>Log into the Twilio Console and navigate to your active phone number (+12207990117).</li>
        <li>Under the "Voice & Fax" section, find "A CALL COMES IN".</li>
        <li>Set the webhook URL to: <code>[Your-Ngrok-URL]/api/voice/incoming</code></li>
        <li>Ensure the HTTP method is set to POST.</li>
    </ol>
    <p>Alternatively, you can test using the Twilio CLI dev-phone environment:</p>
<pre><code>twilio profiles:use voice-project
twilio dev-phone</code></pre>

    <hr>

    <h2>How to Test the System</h2>
    <p>Because the system includes a strict security check (matching the incoming caller's phone number against the database), testing with different scenarios requires overriding the caller ID.</p>
    <ol>
        <li>Open the React Admin Dashboard and navigate to the "Settings" page.</li>
        <li>The page will display a list of all users in the database as navigational pills.</li>
        <li>Click on a user and hit "Save Configuration". This updates an in-memory block on the backend (<code>testState.js</code>).</li>
        <li>Call the Twilio number (+12207990117) from any phone. The backend will temporarily mock your caller ID to match the user you selected in the admin panel.</li>
        <li>You can also open the "Orders" page in the Admin Dashboard to manually change an order status (e.g., from Placed to Shipped) using the dropdown, and immediately call the system to hear how the AI response adapts.</li>
    </ol>

    <hr>

    <h2>Future Modifications and Planned Features</h2>
    <p>As this project is still in development, the following features are on the roadmap:</p>
    <ul>
        <li><strong>Outbound SMS Notifications:</strong> Integrating Twilio SMS to text the user a tracking link automatically when they request order status.</li>
        <li><strong>Complex Logistics Logic:</strong> Porting over capacity-matching logic to assign delivery drivers via phone.</li>
        <li><strong>Advanced Agent Handoff:</strong> Instead of blindly dialing the customer support number, the system will check an agent's availability in the database before routing.</li>
        <li><strong>Real-time Analytics Dashboard:</strong> Adding a page to the React admin panel to visualize IVR drop-off rates and AI intent accuracy.</li>
    </ul>

</body>
</html>