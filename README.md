# Ifes Chatbot Moodle CRM - Frontend

This is the frontend for the Ifes Chatbot Moodle CRM project. It is a React application that provides the user interface for interacting with the backend API.

## Features

*   **Intuitive Dashboard:** Visualize key performance indicators (KPIs) and track CRM activities.
*   **User Management:** Administer user accounts and roles.
*   **Course Management:** View and manage course-related information.
*   **CRM Interface:** Interact with student data and manage communication flows.
*   **Chatbot Flow Editor:** Visually design and configure conversational flows for the WhatsApp chatbot.
*   **Real-time Interactions:** Monitor and manage chatbot interactions.
*   **Authentication:** Secure user login and session management.

## Tech Stack

-   **Framework:** React
-   **UI Library:** Material-UI (inferred from `styles/theme.js`)
-   **Routing:** React Router
-   **API Client:** Axios (inferred from `api/client.js`)

## Prerequisites

-   Node.js (LTS version recommended)
-   npm (Node Package Manager)

## Installation

1.  **Navigate to the frontend directory:**
    ```bash
    cd Ifes_chatbot_moodle_crm/frontend
    ```

2.  **Install the dependencies:**
    ```bash
    npm install
    ```

## Configuration

The frontend application needs to know where the backend API is located. You can configure this by setting an environment variable. Create a `.env` file in the `frontend/` directory with the following content:

```
REACT_APP_API_BASE_URL=http://localhost:8000
```

Replace `http://localhost:8000` with the actual URL of your backend API if it's running on a different host or port.

## Running the Application

To run the development server, use the following command:
```bash
npm start
```
The application will be available at `http://localhost:3000`.

## Available Scripts

In the project directory, you can run:

*   `npm start`: Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

    The page will reload if you make edits.
    You will also see any lint errors in the console.

*   `npm test`: Launches the test runner in the interactive watch mode.

*   `npm run build`: Builds the app for production to the `build` folder.

    It correctly bundles React in production mode and optimizes the build for the best performance.

    The build is minified and the filenames include the hashes.
    Your app is ready to be deployed!

*   `npm run eject`: **Note: this is a one-way operation. Once you `eject`, you can’t go back!**

    If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project. Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc.) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

## Deployment

After running `npm run build`, the optimized static files will be generated in the `build/` directory. These files can be served by any static file server (e.g., Nginx, Apache) or deployed to a static site hosting service (e.g., Netlify, Vercel, GitHub Pages).

## Project Structure

```
/frontend
├── public/
│   └── index.html              # The page template
├── src/
│   ├── App.js                  # Main application component
│   ├── index.js                # The entry point of the application
│   ├── api/
│   │   └── client.js           # Axios client setup
│   ├── components/
│   │   ├── crm/
│   │   │   ├── ConversationView.js
│   │   │   └── StudentList.js
│   │   ├── dashboard/
│   │   │   ├── CrmActionsChart.js
│   │   │   ├── KpiCard.js
│   │   │   ├── KpiGrid.js
│   │   │   ├── MessageTable.js
│   │   │   └── TimelineChart.js
│   │   ├── flows/
│   │   │   ├── FlowDiagram.js
│   │   │   ├── FlowEditor.js
│   │   │   ├── FlowForm.js
│   │   │   ├── FlowList.js
│   │   │   └── nodes/
│   │   │       └── MessageNode.js
│   │   ├── layout/
│   │   │   └── MainLayout.js
│   │   ├── Login.js
│   │   ├── MessageList.js
│   │   ├── ProtectedRoute.js
│   │   └── UserManagement.js
│   ├── contexts/
│   │   └── AuthContext.js      # Authentication context for the app
│   ├── hooks/
│   │   └── useAuth.js          # Custom hook for authentication
│   ├── pages/
│   │   ├── CoursesPage.js
│   │   ├── CrmPage.js
│   │   ├── DashboardPage.js
│   │   ├── FlowsPage.js
│   │   ├── InteractionsPage.js
│   │   ├── LoginPage.js
│   │   ├── NotFoundPage.js
│   │   └── UserManagementPage.js
│   ├── routes/
│   │   ├── AppRouter.js        # Main application router
│   │   └── ProtectedRoute.js   # Route guard for authenticated routes
│   ├── services/
│   │   ├── api.js              # Generic API service
│   │   ├── flowApi.js          # Flow-specific API service
│   │   └── userApi.js          # User-specific API service
│   └── styles/
│       └── theme.js            # Material-UI theme configuration
├── package.json
└── ...
```