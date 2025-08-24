# 🌺 Onam Procession Bulk Registration Portal

A full-stack web application for house captains to register their entire team of 30 participants for a college's Onam procession. Built with React, Tailwind CSS, Supabase, and Firebase.

## ✨ Features

- **Bulk Registration**: Register 30 participants at once for each house
- **Real-time Dashboard**: Live updates showing registration status for all houses
- **Data Integrity**: Duplicate prevention and validation
- **Dual Database**: Primary Supabase with Firebase backup
- **Data Export**: Download registration data as PDF or Excel
- **Onam Theme**: Beautiful UI with traditional Onam colors and design elements

## 🏠 Houses

- SPARTANS
- MUGHALS  
- VIKINGS
- RAJPUTS
- ARYANS

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Supabase account
- Firebase account

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd rset-onam
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Supabase and Firebase credentials in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

3. **Set up Supabase database:**
   
   Run this SQL in your Supabase SQL editor:
   ```sql
   CREATE TABLE registrations (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     college_id VARCHAR(20) UNIQUE NOT NULL,
     house VARCHAR(20) NOT NULL CHECK (house IN ('SPARTANS', 'MUGHALS', 'VIKINGS', 'RAJPUTS', 'ARYANS')),
     class VARCHAR(20) NOT NULL CHECK (class IN ('AEI', 'AIDS', 'CIVIL', 'CSBS', 'CS ALPHA', 'CS BETA', 'CS GAMMA', 'CS DELTA', 'EEE', 'EC ALPHA', 'EC BETA', 'EC GAMMA', 'IT', 'MECH ALPHA', 'MECH BETA')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
   );

   -- Create indexes for better performance
   CREATE INDEX idx_registrations_house ON registrations(house);
   CREATE INDEX idx_registrations_college_id ON registrations(college_id);
   ```

4. **Set up Firebase:**
   - Create a Firestore database
   - Create a collection named `registrations`
   - Configure Firestore rules as needed

5. **Start the development server:**
   ```bash
   pnpm dev
   ```

## 🔧 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Primary Database**: Supabase (PostgreSQL)
- **Backup Database**: Firebase Firestore
- **PDF Export**: jsPDF + jspdf-autotable
- **Excel Export**: SheetJS (xlsx)
- **Fonts**: Inter, Lora (Google Fonts)

## 📱 Components

### BulkRegistration
- House selection dropdown
- 30-participant data entry table
- Real-time validation
- Bulk submission to both databases

### DataExport
- Registration statistics dashboard
- PDF export with Onam theming
- Excel export with multiple sheets
- Real-time data refresh

## 🎨 Design Features

- **Onam Color Palette**: Gold, Red, Green, Orange, Purple, Cream
- **Typography**: Inter (primary), Lora (headings)
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Live dashboard using Supabase subscriptions
- **Cultural Elements**: Pookalam-inspired design patterns

## 🔐 Data Flow

1. **User Input**: House captain selects house and fills 30 participant details
2. **Validation**: Client-side validation for required fields and duplicates
3. **Primary Write**: Bulk insert to Supabase (PostgreSQL)
4. **Backup Write**: Batch write to Firebase Firestore (if Supabase succeeds)
5. **Real-time Updates**: Dashboard updates via Supabase subscriptions

## 📊 Export Features

### PDF Export
- Formatted with Onam theme colors
- Grouped by house
- Includes registration statistics
- Professional layout with auto-table

### Excel Export
- Multiple sheets: All registrations, per-house sheets, summary
- Rich formatting and data organization
- Download includes timestamp

## 🚀 Deployment

The application can be deployed to:
- Vercel (recommended)
- Netlify
- Firebase Hosting
- Any static hosting service

Make sure to set environment variables in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Happy Onam! 🌺** Built with ❤️ for celebrating Kerala's most beloved festival.
