# User Interface

This folder contains the user-facing (view-only) version of the pet clinic application.

## Structure

- **Pages/** - View-only pages for users (Dashboard, Records, Prescriptions, Vaccinations, Lab Results)
- **Routes/** - User routing configuration
- **UserApp.jsx** - Main user application component

## Key Differences from Admin

- No "New Record", "Add", "Edit", or "Delete" buttons
- No modal forms for creating/editing data
- Search functionality retained for filtering
- Same styling and layout as admin pages
- View-only access to all medical records

## Usage

To use the user interface, import and render `UserApp` instead of the main `App` component:

\`\`\`javascript
import UserApp from './USER/UserApp';

// In your main entry point (e.g., main.jsx)
root.render(<UserApp />);
\`\`\`

## API Integration

The user pages use the same mock data structure as admin pages. When connecting to your backend:

1. Replace mock data with actual API calls to your MERN backend
2. Use the same service files from the Services folder
3. Ensure proper authentication and authorization for user access
