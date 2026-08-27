/* ============================================
   V3 CLASSES — Centralized API Configuration
   ============================================
   This file sets the backend API base URL for all frontend scripts.
   
   FOR PRODUCTION: Change the URL below to your Render backend URL.
   Example: window.V3_API_BASE = "https://v3classes-backend.onrender.com/api";
   
   FOR LOCAL DEVELOPMENT: Leave as-is (uses localhost:5000).
   ============================================ */

(function () {
  'use strict';

  // ── Set your production backend URL here ──
  // Uncomment and edit the line below after deploying backend to Render:
  // window.V3_API_BASE = "https://YOUR-BACKEND-SERVICE.onrender.com/api";

  // Default: localhost for development
  if (!window.V3_API_BASE) {
    window.V3_API_BASE = 'http://localhost:5000/api';
  }
})();
