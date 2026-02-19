# VahanPe - Vehicle Services Platform

This is a full-stack web application for vehicle and driving licence services, featuring a customer-facing portal and an admin dashboard.

## 📂 Project Structure

- **client/**: The Frontend (React, Tailwind CSS). Is what the user sees.
- **server/**: The Backend (Node.js, Express, SQLite). Handles data and logic.

## 🚀 How to Run Locally

You need to run **both** the backend and frontend terminals simultaneously.

### 1. Start the Backend (Server)
This handles the database and API.
```bash
cd server
npm install  # Only needed the first time
npm run dev
```
*You should see: `Server running on http://localhost:5000`*

### 2. Start the Frontend (Client)
Open a **new** terminal (click `+` in your terminal window).
```bash
cd client
npm install  # Only needed the first time
npm run dev
```
*You should see: `Local: http://localhost:5173`*

---

## 🎥 Demo Script (For Presentation)

Use this script to show your manager the key features effectively.

**1. The "Premium" First Impression (Home Page)**
- **Open:** `http://localhost:5173`
- **Highlight:** 
    - "Notice the modern, dark-themed Hero section with the moving truck animation in the background."
    - "Hover over the **Shield Logo** in the top left to see the interaction."
    - "Point out the **'How It Works'** section with step-by-step icons."
    - "Scroll to the bottom to show the professional **4-Column Footer**."

**2. The User Journey (Booking a Service)**
- **Action:** Click the floating **"Start Now"** button.
- **Action:** Select **"Vehicle Services"**.
- **Highlight:** "The wizard is intuitive. Watch how it auto-advances when I select an option."
- **Step 1:** Select **"2 Wheeler"**.
- **Step 2:** Select **"Bangalore / Karnataka"**.
- **Step 3:** Enter a dummy number like `KA01AB1234` (Matches visually).
- **Step 4:** Select **"Transfer of Ownership"**.
- **Action:** Click **"Pay & Book"**.
- **Result:** You are redirected to the "My Services" dashboard.

**3. Real-Time Tracking (User Dashboard)**
- **Highlight:** "Here the user sees their booking status timeline."
- **Point out:** The "Booking ID", "Service Name", and current status "Payment Confirmed".

**4. The Admin Power (Backend Management)**
- **Action:** Go to `http://localhost:5173/admin`
- **Login:** `admin` / `admin123`
- **Action:** Find the booking you just made. Click **"View"**.
- **Action:** Change Status to **"Documents Picked Up"** and click **Update**.
- **Highlight:** "The backend updates instantly."

**5. Closing the Loop**
- **Action:** Go back to the **User Dashboard** tab.
- **Action:** Click **"Refresh"**.
- **Result:** The timeline now shows "Documents Picked Up".
- **Conclusion:** "We have a fully functional loop from User -> Admin -> User."

---

## ☁️ Deployment (Going Live)

To put this on the internet for everyone to see:

1.  **Database**: Since we use SQLite (a file-based DB), you need a host that supports persistent storage (like a VPS or Render with a Disk).
2.  **Backend**: Deploy the `server` folder to a service like **Render** or **Railway**.
3.  **Frontend**: Deploy the `client` folder to **Vercel** or **Netlify**. You will need to update the API URL in the frontend code to point to your live backend instead of `localhost`.
