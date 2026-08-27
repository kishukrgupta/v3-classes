const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prisma');
const catchAsync = require('../utils/catchAsync');
const chatbotService = require('../services/chatbot.service');
const ApiError = require('../utils/ApiError');

/** POST /api/chat/message — Process chat message */
const sendMessage = catchAsync(async (req, res) => {
  const { sessionId: clientSessionId, message } = req.body;
  const sessionId = clientSessionId || uuidv4();
  const userText = (message || '').trim();

  // If initial trigger without message, send greeting
  if (!userText) {
    const greeting = chatbotService.getGreeting();
    try {
      await prisma.chatMessage.create({
        data: {
          sessionId,
          message: greeting.response,
          sender: 'BOT',
          options: greeting.options ? JSON.stringify(greeting.options) : null,
        },
      });
    } catch (e) { /* ignore fallback */ }

    return res.json({
      status: 'success',
      data: {
        sessionId,
        response: greeting.response,
        options: greeting.options,
        typingDelayMs: 600,
      },
    });
  }

  // 1. Save user message to database
  try {
    await prisma.chatMessage.create({
      data: {
        sessionId,
        message: userText,
        sender: 'USER',
      },
    });
  } catch (err) {
    console.warn('[ChatController] Error saving user message:', err.message);
  }

  // 2. Process with rule-based state machine
  const botResult = await chatbotService.processMessage(sessionId, userText);

  // 3. Save bot response to database
  try {
    await prisma.chatMessage.create({
      data: {
        sessionId,
        message: botResult.response,
        sender: 'BOT',
        options: botResult.options ? JSON.stringify(botResult.options) : null,
      },
    });
  } catch (err) {
    console.warn('[ChatController] Error saving bot message:', err.message);
  }

  // 4. Save Lead Enquiry if lead collection step completed
  if (botResult.createEnquiry && botResult.enquiryData) {
    try {
      await prisma.enquiry.create({
        data: {
          sessionId,
          name: botResult.enquiryData.name,
          phone: botResult.enquiryData.phone,
          course: botResult.enquiryData.course || null,
          message: botResult.enquiryData.message || null,
          source: 'CHATBOT',
          status: 'NEW',
        },
      });
    } catch (err) {
      console.error('[ChatController] Error creating enquiry from chatbot:', err.message);
    }
  }

  res.json({
    status: 'success',
    data: {
      sessionId,
      response: botResult.response,
      options: botResult.options || [],
      typingDelayMs: Math.floor(Math.random() * 400) + 500, // 500-900ms realistic delay
    },
  });
});

/** GET /api/chat/history/:sessionId — Public chat history for a session */
const getChatHistory = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) throw ApiError.badRequest('Session ID is required');

  const messages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });

  res.json({
    status: 'success',
    data: messages,
  });
});

/** GET /api/admin/chat/:sessionId — Admin endpoint to view full chat history */
const getAdminChatSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) throw ApiError.badRequest('Session ID is required');

  const [messages, session, enquiry] = await Promise.all([
    prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.chatSession.findUnique({
      where: { sessionId },
    }).catch(() => null),
    prisma.enquiry.findFirst({
      where: { sessionId },
    }).catch(() => null),
  ]);

  res.json({
    status: 'success',
    data: {
      sessionId,
      session,
      enquiry,
      messages,
    },
  });
});

module.exports = {
  sendMessage,
  getChatHistory,
  getAdminChatSession,
};
