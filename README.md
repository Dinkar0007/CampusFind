# CampusFind — College Lost & Found Management System

## 1. Abstract
CampusFind is a college-focused Lost & Found web application. It gives students and staff one place to report lost belongings, report found belongings, search reports and receive possible-match suggestions. It also includes a simple claim workflow, notifications and an admin verification area.

## 2. Technology
- React
- JavaScript
- Vite
- React Router
- CSS
- Browser localStorage for demo data persistence

This version is intentionally simple so it can run without MongoDB, an external API key or a backend server. It is suitable for an academic/demo project. In a production deployment, the localStorage layer should be replaced with a secure server/database.

## 3. Main Features
- Student signup/login/logout
- Student dashboard
- Lost and found reporting
- Search and filters
- Explainable matching score
- Possible Matches page
- Claim Item workflow
- Admin claim approval/rejection
- In-app notifications
- Sample sightings
- Responsive design
- Admin overview of users and reports

## 4. Matching Algorithm
The matching feature is an explainable rule-based score, not a machine-learning model.

| Factor | Weight |
|---|---:|
| Category | 20 |
| Colour | 15 |
| Brand | 10 |
| Item name | 20 |
| Description similarity | 15 |
| Location | 15 |
| Date | 5 |
| Total | 100 |

The application compares two reports and adds points when their values match or are similar. The result is shown with matching factors so the user can understand why a suggestion was made.

## 5. Data Model
The browser stores these collections in one localStorage object:
- Users
- LostItems
- FoundItems
- Matches
- Claims
- Notifications
- Sightings
- Locations
- AdminActions

A production database can map these collections to MongoDB collections.

## 6. Demo Accounts
Student:
- Email: `student@college.edu`
- Password: `student123`

Admin:
- Email: `admin@college.edu`
- Password: `admin123`

## 7. Installation

Requirements:
- Node.js 18 or newer
- npm

Commands:

```bash
npm install
npm run dev
```

Open the local address shown by Vite, normally:

```text
http://localhost:5173
```

For a production build:

```bash
npm run build
npm run preview
```

## 8. Project Structure

```text
src/
  data/
    sampleData.js
  utils/
    matching.js
  App.jsx
  main.jsx
  styles.css
```

The project keeps the main logic small and readable for a BCA-level viva.

## 9. Testing Checklist
1. Login with the demo student account.
2. Open Report Lost and submit a report.
3. Open Report Found and submit a similar report.
4. Open Matches and check the score.
5. Open a found item and submit a claim.
6. Login as admin and open Admin.
7. Approve/reject the claim.
8. Check the student's notification.
9. Test Browse search and filters.
10. Resize the browser to test mobile layout.

## 10. Limitations
- Authentication is a browser demo and is not suitable for real sensitive accounts.
- Data is stored in localStorage.
- Photos use optional image URLs instead of a real upload server.
- Matching is rule-based and should not be described as machine learning.
- Email/SMS notifications are not included.

## 11. Future Scope
- Node.js/Express API
- MongoDB database
- Secure JWT authentication
- Real image upload storage
- College email verification
- Email notifications
- More advanced NLP/image matching
- Audit logs and role permissions
- Deployment on a college server

## 12. Academic Note
The interface, project name, data model and application logic in this project were created specifically for this project. External libraries are used only as development dependencies and are listed in `package.json`.
