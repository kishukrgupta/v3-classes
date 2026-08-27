const prisma = require('../utils/prisma');

/**
 * Enterprise Rule-Based Chatbot Service for V3 Classes.
 * Features:
 * - Predefined guided conversational flows (Courses, Fees, Admission, Results, Counsellor)
 * - State machine tracking visitor progress without losing context
 * - Indian phone number validator (10-digit mobile)
 * - PostgreSQL FAQ dataset keyword & semantic matching engine
 * - Automatic Enquiry creation in PostgreSQL upon phone submission
 * - Modular design ready for future AI API drop-in replacement
 */
class ChatbotService {
  constructor() {
    this.faqCache = null;
    this.cacheExpiry = 0;
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    // Built-in FAQ dataset (synced with Database & Seed)
    this.DEFAULT_FAQS = [
      {
        question: 'What courses does V3 Classes offer?',
        answer: 'V3 Classes offers comprehensive coaching for Classes 5th to 12th (CBSE & Bihar Board), as well as specialized preparation for JEE (Main & Advanced) and NEET UG entrance exams. All major science subjects — Physics, Chemistry, Mathematics, and Biology — are covered.',
        category: 'courses',
        keywords: ['course', 'courses', 'offer', 'class', 'subjects', 'programs', 'study'],
      },
      {
        question: 'Where is V3 Classes located?',
        answer: '📍 V3 Classes is located on the **2nd Floor, Beside Indian Overseas Bank, Near JNL College Road, Khagaul, Bihar**. Easily accessible by public transport!',
        category: 'contact',
        keywords: ['location', 'address', 'located', 'where', 'directions', 'map', 'reach', 'khagaul'],
      },
      {
        question: 'Who is the founder of V3 Classes?',
        answer: '👨‍🏫 V3 Classes was founded by **Vikash Prakash** (M.Sc. Physics) on 13th March 2016. V3 stands for "Value of Your Vision and Visibility".',
        category: 'general',
        keywords: ['founder', 'director', 'vikash', 'prakash', 'who', 'started'],
      },
      {
        question: 'What is the fee structure at V3 Classes?',
        answer: '💰 V3 Classes offers quality education with competitive and affordable fees. Flexible installment plans and merit scholarships are available. Contact our counsellor for the exact fee breakdown for your class.',
        category: 'fees',
        keywords: ['fee', 'fees', 'cost', 'installment', 'pricing', 'price'],
      },
      {
        question: 'What are the class timings?',
        answer: '⏰ Class timings vary by batch and course. We offer flexible scheduling with morning and evening batches (Mon–Sat, 7:00 AM – 8:00 PM).',
        category: 'timings',
        keywords: ['timing', 'timings', 'time', 'hours', 'schedule', 'morning', 'evening'],
      },
      {
        question: 'What is the batch size at V3 Classes?',
        answer: '👥 We maintain small batch sizes (limited students per batch) to ensure personalized attention and 1-on-1 doubt clearing for every student.',
        category: 'general',
        keywords: ['batch', 'size', 'students', 'strength', 'small'],
      },
      {
        question: 'Can I attend a demo class before enrolling?',
        answer: '🎓 Yes! We provide free demo classes so students and parents can experience our teaching methodology firsthand before taking admission.',
        category: 'admission',
        keywords: ['demo', 'trial', 'free class', 'demo class'],
      },
      {
        question: 'What is the success rate of V3 Classes?',
        answer: '🏆 V3 Classes maintains a 95%+ success rate in board exams with 100+ JEE selections and 80+ NEET selections since 2016.',
        category: 'results',
        keywords: ['success', 'rate', 'result', 'results', 'topper', 'toppers', 'selection'],
      },
      {
        question: 'How can I contact V3 Classes?',
        answer: '📞 Call/WhatsApp us at **+91 93868 51441** or email **vikashprakashv3class@gmail.com**.',
        category: 'contact',
        keywords: ['contact', 'phone', 'call', 'email', 'mobile', 'whatsapp', 'number'],
      },
    ];

    // Main options
    this.MAIN_OPTIONS = ['Courses', 'Fees', 'Admission', 'Results', 'Talk to Counsellor'];

    // In-memory sessions map
    this.sessions = new Map();
  }

  /**
   * Validate Indian 10-digit mobile number
   */
  isValidIndianPhone(phone) {
    if (!phone) return false;
    const clean = phone.replace(/[\s\-\+\(\)]/g, '');
    if (/^[6-9]\d{9}$/.test(clean)) return clean;
    if (/^91[6-9]\d{9}$/.test(clean)) return clean.slice(2);
    if (/^0[6-9]\d{9}$/.test(clean)) return clean.slice(1);
    return false;
  }

  /**
   * Parse keywords field — handles both JSON string (SQLite) and native array (PostgreSQL)
   */
  parseKeywords(keywords) {
    if (!keywords) return [];
    if (Array.isArray(keywords)) return keywords;
    if (typeof keywords === 'string') {
      try {
        const parsed = JSON.parse(keywords);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  async getFaqs() {
    const now = Date.now();
    if (this.faqCache && now < this.cacheExpiry) {
      return this.faqCache;
    }

    try {
      const faqs = await prisma.fAQ.findMany({
        where: { isActive: true },
        select: { question: true, answer: true, keywords: true, category: true },
      });
      if (faqs && faqs.length > 0) {
        // Parse keywords from JSON string to array
        const parsed = faqs.map(faq => ({
          ...faq,
          keywords: this.parseKeywords(faq.keywords),
        }));
        this.faqCache = parsed;
        this.cacheExpiry = now + this.CACHE_TTL;
        return parsed;
      }
    } catch (err) {
      // Use fallback
    }

    this.faqCache = this.DEFAULT_FAQS;
    this.cacheExpiry = now + this.CACHE_TTL;
    return this.DEFAULT_FAQS;
  }

  /**
   * Get courses from database
   */
  async getCourses() {
    try {
      return await prisma.course.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    } catch (err) {
      return [];
    }
  }

  /**
   * Retrieve or initialize session state
   */
  async getSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      let state = 'MAIN_MENU';
      let visitorName = null;
      let visitorPhone = null;
      let visitorClass = null;

      try {
        const dbSession = await prisma.chatSession.findUnique({
          where: { sessionId },
        });
        if (dbSession) {
          state = dbSession.currentState;
          visitorName = dbSession.visitorName;
          visitorPhone = dbSession.visitorPhone;
          visitorClass = dbSession.visitorClass;
        } else {
          await prisma.chatSession.create({
            data: { sessionId, currentState: state },
          });
        }
      } catch (err) {
        // Table might not be migrated yet or in-memory fallback
      }

      this.sessions.set(sessionId, {
        state,
        visitorName,
        visitorPhone,
        visitorClass,
        pendingFlow: null,
        lastActive: Date.now(),
      });
    }

    const session = this.sessions.get(sessionId);
    session.lastActive = Date.now();
    return session;
  }

  /**
   * Update session state in-memory and database
   */
  async updateSession(sessionId, updates) {
    const session = await this.getSession(sessionId);
    Object.assign(session, updates);

    try {
      await prisma.chatSession.upsert({
        where: { sessionId },
        update: {
          currentState: session.state,
          visitorName: session.visitorName || undefined,
          visitorPhone: session.visitorPhone || undefined,
          visitorClass: session.visitorClass || undefined,
        },
        create: {
          sessionId,
          currentState: session.state,
          visitorName: session.visitorName || null,
          visitorPhone: session.visitorPhone || null,
          visitorClass: session.visitorClass || null,
        },
      });
    } catch (err) {
      // Ignore DB session sync errors if table in transition
    }

    return session;
  }

  /**
   * Initial greeting & Main Menu message
   */
  getGreeting() {
    return {
      response: 'Namaste! 👋 Welcome to V3 Classes.\nHow can I help you today?',
      options: this.MAIN_OPTIONS,
      state: 'MAIN_MENU',
    };
  }

  /**
   * Process incoming user message / button selection
   * @param {string} sessionId
   * @param {string} userMessage
   * @returns {Promise<{response: string, options: string[], createEnquiry?: boolean, enquiryData?: Object}>}
   */
  async processMessage(sessionId, userMessage) {
    const text = (userMessage || '').trim();
    const textLower = text.toLowerCase();
    const session = await this.getSession(sessionId);

    // ── Global Restart / Main Menu command ──
    if (['restart', 'reset', 'start over', 'main menu', 'menu', 'home'].includes(textLower)) {
      await this.updateSession(sessionId, {
        state: 'MAIN_MENU',
        visitorName: null,
        visitorPhone: null,
        visitorClass: null,
        pendingFlow: null,
      });
      return this.getGreeting();
    }

    // ── STATE-BASED CONVERSATION FLOW ROUTER ──

    // 1. LEAD CAPTURE: NAME STEP
    if (session.state === 'COLLECTING_NAME') {
      if (!text || text.length < 2) {
        return {
          response: 'Please enter your full name to proceed:',
          options: ['Main Menu'],
        };
      }
      await this.updateSession(sessionId, {
        visitorName: text,
        state: session.visitorClass ? 'COLLECTING_PHONE' : 'COLLECTING_CLASS',
      });

      if (!session.visitorClass) {
        return {
          response: `Nice to meet you, ${text}! 🎓 Which class/course are you interested in?`,
          options: ['5th–8th', '9th–10th', '11th–12th', 'JEE', 'NEET'],
        };
      }

      return {
        response: `Thank you, ${text}! 📱 Please enter your 10-digit mobile number so our academic counsellor can reach out to you:`,
        options: ['Main Menu'],
      };
    }

    // 2. LEAD CAPTURE: CLASS/COURSE STEP
    if (session.state === 'COLLECTING_CLASS') {
      await this.updateSession(sessionId, {
        visitorClass: text,
        state: 'COLLECTING_PHONE',
      });
      return {
        response: `Got it! (${text}) 📱 Please enter your 10-digit mobile number for admission assistance:`,
        options: ['Main Menu'],
      };
    }

    // 3. LEAD CAPTURE: PHONE STEP (with Indian Phone Validation)
    if (session.state === 'COLLECTING_PHONE') {
      const validPhone = this.isValidIndianPhone(text);
      if (!validPhone) {
        return {
          response: '⚠️ Please enter a valid 10-digit Indian mobile number (e.g., 9876543210):',
          options: ['Main Menu'],
        };
      }

      await this.updateSession(sessionId, {
        visitorPhone: validPhone,
        state: 'COLLECTING_MESSAGE',
      });

      return {
        response: 'Got your number! 📝 Anything else you would like to ask or specify?',
        options: ['No, that is all', 'Want a demo class', 'Fee details', 'Skip'],
      };
    }

    // 4. LEAD CAPTURE: OPTIONAL MESSAGE & SUBMISSION
    if (session.state === 'COLLECTING_MESSAGE') {
      const notes = ['skip', 'no, that is all'].includes(textLower) ? '' : text;
      const visitorName = session.visitorName || 'Visitor';
      const visitorPhone = session.visitorPhone;
      const visitorClass = session.visitorClass || 'General';

      // Create enquiry payload
      const enquiryData = {
        sessionId,
        name: visitorName,
        phone: visitorPhone,
        course: visitorClass,
        message: notes ? `Chatbot Enquiry: ${notes}` : `Chatbot Enquiry for ${visitorClass}`,
        source: 'CHATBOT',
        status: 'NEW',
      };

      // Reset state to COMPLETED
      await this.updateSession(sessionId, {
        state: 'MAIN_MENU',
      });

      return {
        response: `Thank you, ${visitorName}! 🎓\nYour enquiry has been received.\nOur V3 Classes counsellor will contact you at ${visitorPhone} soon.`,
        options: ['Main Menu', 'Courses', 'Results'],
        createEnquiry: true,
        enquiryData,
      };
    }

    // ── MAIN MENU & GUIDED FLOW SELECTION ──

    // Flow: Courses
    if (textLower === 'courses' || textLower === '1. courses' || textLower === '1') {
      await this.updateSession(sessionId, { state: 'SELECTING_COURSE' });
      return {
        response: 'Which course are you interested in?',
        options: ['Classes 5–8', 'Classes 9–10', 'Classes 11–12', 'JEE', 'NEET', 'Main Menu'],
      };
    }

    // Flow: Course Selection & Details
    if (session.state === 'SELECTING_COURSE' || ['classes 5–8', 'classes 5-8', 'classes 9–10', 'classes 9-10', 'classes 11–12', 'classes 11-12', 'jee', 'neet'].includes(textLower)) {
      let info = '';
      if (textLower.includes('5') || textLower.includes('8')) {
        info = '📚 **Classes 5th to 8th (Junior Foundation)**\n- Subjects: Science, Maths, Mental Ability\n- Focus: Building strong conceptual base, Olympiad & scholarship preparation\n- Batch: Small batches with individual mentoring.';
      } else if (textLower.includes('9') || textLower.includes('10')) {
        info = '🎯 **Classes IX & X (Board Foundation)**\n- Subjects: Physics, Chemistry, Maths, Biology\n- Boards: CBSE & Bihar Board\n- Features: Complete NCERT mastery, weekly testing & doubt clearing.';
      } else if (textLower.includes('11') || textLower.includes('12')) {
        info = '🔬 **Classes XI & XII (Senior Secondary)**\n- Streams: Science (PCM / PCB)\n- Boards: CBSE & Bihar Board + Competitive Orientation\n- Led by expert faculty like Vikash Prakash Sir (Physics).';
      } else if (textLower.includes('jee')) {
        info = '🚀 **JEE (Main + Advanced) Preparation**\n- 2-Year Integrated Classroom Program for 11th/12th/Droppers\n- Subjects: Physics, Chemistry, Mathematics\n- Rigorous test series & rank-improvement problem sets.';
      } else if (textLower.includes('neet')) {
        info = '🩺 **NEET (UG) Medical Preparation**\n- 2-Year Integrated Program for Medical Aspirants\n- Subjects: Physics, Chemistry, Biology (Botany + Zoology)\n- Intensive NCERT-focused drills and previous 15-year paper solving.';
      } else {
        info = '🎓 V3 Classes offers comprehensive coaching for Classes 5th to 12th (CBSE & Bihar Board) along with specialized JEE & NEET entrance batches.';
      }

      await this.updateSession(sessionId, {
        visitorClass: text,
        state: 'AFTER_COURSE',
      });

      return {
        response: `${info}\n\nWould you like to know more or speak with our counsellor?`,
        options: ['Talk to Counsellor', 'Admission', 'Fees', 'Main Menu'],
      };
    }

    // Flow: Fees
    if (textLower === 'fees' || textLower === '2. fees' || textLower === '2' || textLower === 'fee details') {
      await this.updateSession(sessionId, { state: 'FEES_CONFIRM' });
      return {
        response: '💰 **V3 Classes Fee Structure**:\n- Quality education at highly affordable and competitive fees.\n- Merit-based scholarships and flexible installment plans available.\n\nWould you like our counsellor to contact you with the exact fee breakdown for your class?',
        options: ['Yes', 'No', 'Main Menu'],
      };
    }

    if (session.state === 'FEES_CONFIRM') {
      if (textLower === 'yes' || textLower.includes('yes')) {
        await this.updateSession(sessionId, { state: 'COLLECTING_NAME' });
        return {
          response: 'Great! Let\'s get your details.\n\nWhat is your name?',
          options: ['Main Menu'],
        };
      } else {
        await this.updateSession(sessionId, { state: 'MAIN_MENU' });
        return {
          response: 'No problem! You can explore our courses or ask any other questions:',
          options: this.MAIN_OPTIONS,
        };
      }
    }

    // Flow: Admission
    if (textLower === 'admission' || textLower === '3. admission' || textLower === '3' || textLower === 'enroll') {
      await this.updateSession(sessionId, { state: 'COLLECTING_NAME' });
      return {
        response: '🌟 **Admissions Open for Session 2026-27!**\n\nStep 1: What is your name?',
        options: ['Main Menu'],
      };
    }

    // Flow: Talk to Counsellor
    if (textLower === 'talk to counsellor' || textLower === '5. talk to counsellor' || textLower === '5' || textLower === 'counsellor') {
      await this.updateSession(sessionId, { state: 'COLLECTING_NAME' });
      return {
        response: 'Sure! I\'ll collect a few details so our academic counsellor can contact you directly.\n\nWhat is your name?',
        options: ['Main Menu'],
      };
    }

    // Flow: Results / Toppers
    if (textLower === 'results' || textLower === '4. results' || textLower === '4' || textLower === 'toppers') {
      return {
        response: '🏆 **V3 Classes Track Record**:\n- 95%+ Board Exam Pass Rate\n- Top Score: 92% in Physics, 437 Total Marks\n- 100+ JEE Selections & 80+ NEET Selections\n- Consistent Khagaul Board toppers since 2016!\n\nWould you like our counsellor to contact you?',
        options: ['Talk to Counsellor', 'Admission', 'Main Menu'],
      };
    }

    // Fallback confirmation from general prompts
    if (session.state === 'AFTER_COURSE') {
      if (textLower === 'more information' || textLower === 'more info') {
        return {
          response: '📍 V3 Classes provides smart classrooms, study materials, weekly test series, and dedicated 1-on-1 doubt sessions.\n\nWould you like our counsellor to call you for batch timings & admissions?',
          options: ['Talk to Counsellor', 'Fees', 'Main Menu'],
        };
      }
    }

    // ── FAQ INTELLIGENT MATCHING ENGINE ──
    const faqs = await this.getFaqs();
    const matchedFaq = this.findBestFaq(textLower, faqs);

    if (matchedFaq) {
      return {
        response: matchedFaq.answer,
        options: ['Talk to Counsellor', 'Admission', 'Main Menu'],
      };
    }

    // ── UNKNOWN QUESTION FALLBACK ──
    await this.updateSession(sessionId, { state: 'FEES_CONFIRM' });
    return {
      response: 'Sorry, I don\'t have the exact information for this question.\n\nWould you like our counsellor to contact you with details?',
      options: ['Yes', 'No', 'Main Menu'],
    };
  }

  /**
   * Search and score FAQ matches
   */
  findBestFaq(query, faqs) {
    if (!faqs || faqs.length === 0) return null;

    let bestMatch = null;
    let highestScore = 0;

    const queryWords = query
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length >= 3);

    for (const faq of faqs) {
      let score = 0;

      // 1. Keyword direct match (high weight)
      if (faq.keywords && Array.isArray(faq.keywords)) {
        for (const kw of faq.keywords) {
          const kwLower = kw.toLowerCase();
          if (query.includes(kwLower)) {
            score += 4;
          }
        }
      }

      // 2. Question phrase match
      const qLower = (faq.question || '').toLowerCase();
      if (qLower.includes(query) || query.includes(qLower)) {
        score += 6;
      }

      // 3. Word-by-word token matching
      for (const word of queryWords) {
        if (qLower.includes(word)) {
          score += 1.5;
        }
      }

      if (score > highestScore && score >= 3) {
        highestScore = score;
        bestMatch = faq;
      }
    }

    return bestMatch;
  }

  /**
   * Invalidate FAQ cache
   */
  invalidateCache() {
    this.faqCache = null;
    this.cacheExpiry = 0;
  }
}

module.exports = new ChatbotService();
