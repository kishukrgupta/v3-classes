const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding V3 Classes database...\n');

  // ── 1. Admin (from environment variables) ──
  const adminName = process.env.ADMIN_NAME;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminName || !adminEmail || !adminPassword) {
    console.error('═══════════════════════════════════════════════════');
    console.error('  FATAL: Admin seed variables are not set.');
    console.error('  Set these environment variables before seeding:');
    console.error('    ADMIN_NAME     (e.g., "Vikash Prakash")');
    console.error('    ADMIN_EMAIL    (e.g., "admin@v3classes.in")');
    console.error('    ADMIN_PASSWORD (a strong password)');
    console.error('═══════════════════════════════════════════════════');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.admin.upsert({
    where: { email: adminEmail.toLowerCase().trim() },
    update: {
      name: adminName,
      passwordHash,
    },
    create: {
      name: adminName,
      email: adminEmail.toLowerCase().trim(),
      passwordHash,
      role: 'admin',
    },
  });
  console.log('✅ Admin created/updated:', admin.email);

  // ── 2. Courses (idempotent upsert by name) ──
  const courses = [
    {
      name: 'Class IX',
      description: 'Build strong fundamentals in Science and Mathematics for a solid academic foundation.',
      level: 'Foundation',
      classRange: 'IX',
      subjects: JSON.stringify(['Physics', 'Chemistry', 'Maths', 'Biology']),
      duration: '12 months · Full Academic Year',
      fee: 'Contact for Details',
      boards: JSON.stringify(['CBSE', 'Bihar Board']),
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Class X',
      description: 'Board exam preparation with focus on scoring maximum marks and building concepts.',
      level: 'Foundation',
      classRange: 'X',
      subjects: JSON.stringify(['Physics', 'Chemistry', 'Maths', 'Biology']),
      duration: '12 months · Full Academic Year',
      fee: 'Contact for Details',
      boards: JSON.stringify(['CBSE', 'Bihar Board']),
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'Class XI',
      description: 'Strong conceptual building with early competitive exam preparation integrated into coursework.',
      level: 'Intermediate',
      classRange: 'XI',
      subjects: JSON.stringify(['Physics', 'Chemistry', 'Maths / Biology']),
      duration: '12 months · Full Academic Year',
      fee: 'Contact for Details',
      boards: JSON.stringify(['CBSE', 'Bihar Board']),
      isActive: true,
      sortOrder: 3,
    },
    {
      name: 'Class XII',
      description: 'Intensive board preparation with mock tests, revision sessions, and previous year paper analysis.',
      level: 'Intermediate',
      classRange: 'XII',
      subjects: JSON.stringify(['Physics', 'Chemistry', 'Maths / Biology']),
      duration: '12 months · Full Academic Year',
      fee: 'Contact for Details',
      boards: JSON.stringify(['CBSE', 'Bihar Board']),
      isActive: true,
      sortOrder: 4,
    },
    {
      name: 'JEE Preparation',
      description: 'Rigorous JEE Main & Advanced preparation with problem-solving techniques and mock tests.',
      level: 'Competitive',
      classRange: 'XI-XII',
      subjects: JSON.stringify(['Physics', 'Chemistry', 'Mathematics']),
      duration: '24 months · 2 Year Integrated',
      fee: 'Contact for Details',
      boards: JSON.stringify(['JEE Main', 'JEE Adv']),
      isActive: true,
      sortOrder: 5,
    },
    {
      name: 'NEET Preparation',
      description: 'Focused medical entrance coaching with NCERT-based approach and extensive practice material.',
      level: 'Competitive',
      classRange: 'XI-XII',
      subjects: JSON.stringify(['Physics', 'Chemistry', 'Biology']),
      duration: '24 months · 2 Year Integrated',
      fee: 'Contact for Details',
      boards: JSON.stringify(['NEET UG']),
      isActive: true,
      sortOrder: 6,
    },
  ];

  for (const course of courses) {
    // Find existing course by name to make idempotent
    const existing = await prisma.course.findFirst({ where: { name: course.name } });
    if (existing) {
      await prisma.course.update({ where: { id: existing.id }, data: course });
    } else {
      await prisma.course.create({ data: course });
    }
  }
  console.log(`✅ ${courses.length} courses created/updated`);

  // ── 3. Faculty (idempotent upsert by name+subject) ──
  const faculty = [
    {
      name: 'Vikash Prakash',
      subject: 'Physics',
      qualification: 'M.Sc. (Physics) · Founder & Director',
      experience: '10+ Years Experience',
      photo: 'assets/images/faculty/founder-vikash-prakash.jpg',
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Chemistry Faculty',
      subject: 'Chemistry',
      qualification: 'M.Sc. (Chemistry)',
      experience: '8+ Years Experience',
      photo: null,
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'Mathematics Faculty',
      subject: 'Mathematics',
      qualification: 'M.Sc. (Mathematics)',
      experience: '7+ Years Experience',
      photo: null,
      isActive: true,
      sortOrder: 3,
    },
    {
      name: 'Biology Faculty',
      subject: 'Biology',
      qualification: 'M.Sc. (Zoology)',
      experience: '6+ Years Experience',
      photo: null,
      isActive: true,
      sortOrder: 4,
    },
  ];

  for (const member of faculty) {
    const existing = await prisma.faculty.findFirst({
      where: { name: member.name, subject: member.subject },
    });
    if (existing) {
      await prisma.faculty.update({ where: { id: existing.id }, data: member });
    } else {
      await prisma.faculty.create({ data: member });
    }
  }
  console.log(`✅ ${faculty.length} faculty members created/updated`);

  // ── 4. Results / Toppers (idempotent upsert by studentName+year) ──
  const results = [
    { studentName: 'Tanvi Gosal', category: 'board', marks: JSON.stringify({ physics: '92%', total: '436' }), sortOrder: 1, isFeatured: true },
    { studentName: 'Ayush Raj', category: 'board', marks: JSON.stringify({ physics: '84%', total: '437' }), sortOrder: 2, isFeatured: true },
    { studentName: 'Ankir Raj', category: 'board', marks: JSON.stringify({ physics: '83%', total: '429' }), sortOrder: 3, isFeatured: true },
    { studentName: 'Ritik Kumar', category: 'board', marks: JSON.stringify({ physics: '86%', total: '425' }), sortOrder: 4, isFeatured: true },
    { studentName: 'Bhawni Gosal', category: 'board', marks: JSON.stringify({ physics: '87%', total: '415' }), sortOrder: 5, isFeatured: true },
    { studentName: 'Riva Raj', category: 'board', marks: JSON.stringify({ physics: '81%', total: '413' }), sortOrder: 6 },
    { studentName: 'Mohit Kumar', category: 'board', marks: JSON.stringify({ physics: '89%', total: '412' }), sortOrder: 7 },
    { studentName: 'Rohit Kumar', category: 'board', marks: JSON.stringify({ physics: '75%', total: '411' }), sortOrder: 8 },
    { studentName: 'Prabhat Rk. Sharma', category: 'board', marks: JSON.stringify({ physics: '75%', total: '409' }), sortOrder: 9 },
    { studentName: 'Abhishek Kumar', category: 'board', marks: JSON.stringify({ physics: '80%', total: '408' }), sortOrder: 10 },
    { studentName: 'Supriya Bharti', category: 'board', marks: JSON.stringify({ physics: '86%', total: '398' }), sortOrder: 11 },
    { studentName: 'Mukesh Kumar', category: 'board', marks: JSON.stringify({ physics: '72%', total: '403' }), sortOrder: 12 },
  ];

  for (const result of results) {
    const data = {
      studentName: result.studentName,
      category: result.category,
      marks: result.marks,
      exam: 'Board Exam',
      class: 'XII',
      score: JSON.parse(result.marks).total,
      year: '2025',
      isFeatured: result.isFeatured || false,
      sortOrder: result.sortOrder,
    };
    const existing = await prisma.result.findFirst({
      where: { studentName: result.studentName, year: '2025' },
    });
    if (existing) {
      await prisma.result.update({ where: { id: existing.id }, data });
    } else {
      await prisma.result.create({ data });
    }
  }
  console.log(`✅ ${results.length} results created/updated`);

  // ── 5. Gallery (idempotent upsert by imageUrl) ──
  const gallery = [
    { title: 'Celebration on Stage', imageUrl: 'assets/images/hero/hero-slide-1.jpg', category: 'events', sortOrder: 1 },
    { title: 'Classroom & Students', imageUrl: 'assets/images/hero/hero-slide-2.jpg', category: 'classroom', sortOrder: 2 },
    { title: 'Toppers Felicitation', imageUrl: 'assets/images/hero/hero-slide-3.jpg', category: 'achievements', sortOrder: 3 },
    { title: 'Award Ceremony', imageUrl: 'assets/images/events/award-ceremony.jpg', category: 'events', sortOrder: 4 },
    { title: 'Group Photo', imageUrl: 'assets/images/events/group-photo.jpg', category: 'events', sortOrder: 5 },
    { title: 'Director', imageUrl: 'assets/images/faculty/founder-vikash-prakash.jpg', category: 'classroom', sortOrder: 6 },
  ];

  for (const item of gallery) {
    const existing = await prisma.gallery.findFirst({ where: { imageUrl: item.imageUrl } });
    if (existing) {
      await prisma.gallery.update({ where: { id: existing.id }, data: item });
    } else {
      await prisma.gallery.create({ data: item });
    }
  }
  console.log(`✅ ${gallery.length} gallery items created/updated`);

  // ── 6. FAQs (idempotent upsert by question text) ──
  const faqs = [
    {
      question: 'What courses does V3 Classes offer?',
      answer: 'V3 Classes offers comprehensive coaching for Classes IX, X, XI, XII (CBSE & Bihar Board), as well as specialized preparation for JEE (Main & Advanced) and NEET UG entrance exams. All major science subjects — Physics, Chemistry, Mathematics, and Biology — are covered.',
      category: 'courses',
      keywords: JSON.stringify(['courses', 'offer', 'class', 'subjects', 'programs']),
      sortOrder: 1,
    },
    {
      question: 'Who is the founder of V3 Classes?',
      answer: 'V3 Classes was founded by Vikash Prakash, who holds an M.Sc. in Physics. He established the institute on 13th March 2016 with the vision of providing quality education to students in Khagaul and surrounding areas of Bihar.',
      category: 'general',
      keywords: JSON.stringify(['founder', 'vikash', 'started', 'who', 'director']),
      sortOrder: 2,
    },
    {
      question: 'What does V3 stand for?',
      answer: 'V3 stands for "Value of Your Vision and Visibility" — a philosophy that encourages every student to discover their potential, develop a clear vision for their future, and achieve visibility through academic excellence.',
      category: 'general',
      keywords: JSON.stringify(['v3', 'stand', 'meaning', 'name']),
      sortOrder: 3,
    },
    {
      question: 'Where is V3 Classes located?',
      answer: 'V3 Classes is located on the 2nd Floor, Beside Indian Overseas Bank, Near JNL College Road, Khagaul, Bihar. The institute is easily accessible and well-connected by public transport.',
      category: 'contact',
      keywords: JSON.stringify(['location', 'address', 'where', 'located', 'directions', 'map']),
      sortOrder: 4,
    },
    {
      question: 'What is the batch size at V3 Classes?',
      answer: 'We maintain small batch sizes to ensure each student receives personalized attention. This allows our faculty to focus on individual learning needs and track the progress of every student closely.',
      category: 'general',
      keywords: JSON.stringify(['batch', 'size', 'students', 'small']),
      sortOrder: 5,
    },
    {
      question: 'Are there any scholarship programs available?',
      answer: 'Yes, V3 Classes offers scholarships to meritorious students. Scholarships are awarded based on academic performance in entrance tests conducted by the institute. Contact us for detailed information about our scholarship criteria.',
      category: 'admission',
      keywords: JSON.stringify(['scholarship', 'merit', 'discount', 'financial']),
      sortOrder: 6,
    },
    {
      question: 'Does V3 Classes provide study material?',
      answer: 'Yes, we provide comprehensive study material including printed notes, chapter-wise practice sets, previous year question papers, and mock test papers. All materials are specially designed by our experienced faculty members.',
      category: 'general',
      keywords: JSON.stringify(['study', 'material', 'notes', 'books', 'practice']),
      sortOrder: 7,
    },
    {
      question: 'How often are tests conducted?',
      answer: 'Regular assessments are conducted weekly, including chapter-wise tests, unit tests, and full-length mock exams. Performance reports are shared with parents periodically to keep them updated on their child\'s progress.',
      category: 'general',
      keywords: JSON.stringify(['test', 'exam', 'assessment', 'weekly', 'mock']),
      sortOrder: 8,
    },
    {
      question: 'Are doubt-clearing sessions available?',
      answer: 'Absolutely! We have dedicated doubt-clearing sessions after regular classes. Students are encouraged to ask questions freely, and our faculty takes extra time to ensure every concept is thoroughly understood.',
      category: 'general',
      keywords: JSON.stringify(['doubt', 'clearing', 'session', 'help', 'question']),
      sortOrder: 9,
    },
    {
      question: 'Can I attend a demo class before enrolling?',
      answer: 'Yes, we encourage prospective students to attend a free demo class before making their enrollment decision. This gives students and parents a firsthand experience of our teaching methodology and classroom environment.',
      category: 'admission',
      keywords: JSON.stringify(['demo', 'trial', 'free', 'attend', 'class']),
      sortOrder: 10,
    },
    {
      question: 'What boards do you prepare students for?',
      answer: 'We prepare students for both CBSE and Bihar Board examinations. Our curriculum is designed to cover the syllabus of both boards comprehensively, ensuring students are well-prepared regardless of their board.',
      category: 'courses',
      keywords: JSON.stringify(['board', 'cbse', 'bihar', 'prepare', 'syllabus']),
      sortOrder: 11,
    },
    {
      question: 'What is the success rate of V3 Classes?',
      answer: 'V3 Classes maintains a remarkable 95%+ success rate in board examinations. Numerous students have scored above 90% in Physics, and many have successfully cracked JEE and NEET entrance exams.',
      category: 'results',
      keywords: JSON.stringify(['success', 'rate', 'results', 'pass', 'percentage']),
      sortOrder: 12,
    },
    {
      question: 'Do you offer separate JEE and NEET batches?',
      answer: 'Yes, we have dedicated batches for JEE and NEET preparation that run alongside board preparation. The integrated approach ensures students are well-prepared for both competitive exams and board examinations.',
      category: 'courses',
      keywords: JSON.stringify(['jee', 'neet', 'batch', 'separate', 'competitive']),
      sortOrder: 13,
    },
    {
      question: 'What are the class timings?',
      answer: 'Class timings vary by batch and course. We offer flexible scheduling with morning and evening batches to accommodate school-going students. Please contact us at 9386851441 for the current batch schedule.',
      category: 'general',
      keywords: JSON.stringify(['timing', 'time', 'schedule', 'morning', 'evening', 'hours']),
      sortOrder: 14,
    },
    {
      question: 'How can I contact V3 Classes?',
      answer: 'You can reach us by calling 9386851441, emailing vikashprakashv3class@gmail.com, or visiting our institute at 2nd Floor, Beside Indian Overseas Bank, Near JNL College Road, Khagaul, Bihar. You can also send us a message via WhatsApp.',
      category: 'contact',
      keywords: JSON.stringify(['contact', 'call', 'phone', 'email', 'reach']),
      sortOrder: 15,
    },
    {
      question: 'Is there any fee installment facility?',
      answer: 'Yes, we understand the financial needs of families and offer flexible fee payment options including installment plans. Speak with our administrative team for customized payment arrangements that suit your budget.',
      category: 'fees',
      keywords: JSON.stringify(['fee', 'installment', 'payment', 'cost', 'price', 'fees']),
      sortOrder: 16,
    },
    {
      question: 'Do you provide career counselling?',
      answer: 'Yes, we provide personalized career counselling to help students choose between science streams, understand JEE vs NEET pathways, and make informed decisions about their academic future. Our experienced mentors guide students at every step.',
      category: 'general',
      keywords: JSON.stringify(['career', 'counselling', 'guidance', 'stream', 'advice']),
      sortOrder: 17,
    },
    {
      question: 'Are parents updated about their child\'s progress?',
      answer: 'Yes, we maintain regular communication with parents through periodic progress reports, parent-teacher meetings, and WhatsApp updates. Parents can also call or visit any time to discuss their child\'s performance.',
      category: 'general',
      keywords: JSON.stringify(['parent', 'progress', 'report', 'update', 'ptm']),
      sortOrder: 18,
    },
    {
      question: 'What makes V3 Classes different from other coaching institutes?',
      answer: 'V3 Classes stands out with its small batch sizes, personalized teaching approach, affordable fees, dedicated doubt sessions, and a strong track record of results. Founded by a passionate educator, the institute prioritizes every student\'s individual growth over mere numbers.',
      category: 'general',
      keywords: JSON.stringify(['different', 'why', 'choose', 'best', 'special', 'unique']),
      sortOrder: 19,
    },
    {
      question: 'When does the new academic session start?',
      answer: 'New academic sessions typically begin in April and July each year. However, mid-session admissions are also available subject to seat availability. Contact us at 9386851441 to know about the upcoming batch dates.',
      category: 'admission',
      keywords: JSON.stringify(['session', 'start', 'admission', 'when', 'new', 'date', 'begin']),
      sortOrder: 20,
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.fAQ.findFirst({ where: { question: faq.question } });
    if (existing) {
      await prisma.fAQ.update({ where: { id: existing.id }, data: faq });
    } else {
      await prisma.fAQ.create({ data: faq });
    }
  }
  console.log(`✅ ${faqs.length} FAQs created/updated`);

  // ── 7. Website Settings (idempotent — upsert) ──
  const existingSettings = await prisma.websiteSettings.findFirst();
  const settingsData = {
    instituteName: 'V3 Classes',
    tagline: 'Value of Your Vision and Visibility',
    phone: '9386851441',
    email: 'vikashprakashv3class@gmail.com',
    address: '2nd Floor, Beside Indian Overseas Bank, Near JNL College Road, Khagaul, Bihar',
    whatsapp: '919386851441',
    instagram: 'https://www.instagram.com/v3classes',
    youtube: 'https://www.youtube.com/@v3classes',
    facebook: 'https://www.facebook.com/v3classes',
    workingHours: 'Mon – Sat: 7:00 AM – 8:00 PM',
  };

  if (existingSettings) {
    await prisma.websiteSettings.update({ where: { id: existingSettings.id }, data: settingsData });
  } else {
    await prisma.websiteSettings.create({ data: settingsData });
  }
  console.log('✅ Website settings created/updated');

  console.log('\n🎉 Database seeding completed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin Login:');
  console.log(`  Email: ${adminEmail}`);
  console.log('  Password: (the value you set in ADMIN_PASSWORD)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
