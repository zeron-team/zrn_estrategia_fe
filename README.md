# Ifes Chatbot Moodle CRM - Frontend

This is the frontend for the Ifes Chatbot Moodle CRM project. It is a React application that provides the user interface for interacting with the backend API.

## Tech Stack

- **Framework:** React
- **UI Library:** Material-UI (inferred from `styles/theme.js`)
- **Routing:** React Router
- **API Client:** Axios (inferred from `api/client.js`)

## Prerequisites

- Node.js
- npm

## Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd Ifes_chatbot_moodle_crm/frontend
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```

## Running the Application

To run the development server, use the following command:
```bash
npm start
```
The application will be available at `http://localhost:3000`.

## Available Scripts

In the project directory, you can run:

- `npm start`: Runs the app in the development mode.
- `npm test`: Launches the test runner in the interactive watch mode.
- `npm run build`: Builds the app for production to the `build` folder.
- `npm run eject`: Removes the single dependency and copies all the configuration files and transitive dependencies (webpack, Babel, ESLint, etc.) right into your project so you have full control over them.

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