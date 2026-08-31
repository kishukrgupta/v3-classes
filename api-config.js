/* ============================================
   V3 CLASSES — Centralized API Configuration
   ============================================
   This file sets the backend API base URL for all frontend scripts.
   
   PRODUCTION URL: https://v3-classes.onrender.com/api
   LOCAL DEVELOPMENT: http://localhost:5000/api
   ============================================ */

(function () {
  'use strict';

  var isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]' ||
    window.location.protocol === 'file:'
  );

  if (isLocalhost) {
    if (!window.V3_API_BASE) {
      window.V3_API_BASE = 'http://localhost:5000/api';
    }
  } else {
    window.V3_API_BASE = 'https://v3-classes.onrender.com/api';
  }
})();

