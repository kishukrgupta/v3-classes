const prisma = require('../utils/prisma');
const catchAsync = require('../utils/catchAsync');

/** GET /api/admin/dashboard — Dashboard statistics */
const getDashboard = catchAsync(async (req, res) => {
  const [
    totalEnquiries,
    newEnquiries,
    contactedEnquiries,
    followUpEnquiries,
    convertedEnquiries,
    closedEnquiries,
    totalStudents,
    totalCourses,
    totalFaculty,
    recentEnquiries,
    recentStudents,
  ] = await Promise.all([
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { status: 'NEW' } }),
    prisma.enquiry.count({ where: { status: 'CONTACTED' } }),
    prisma.enquiry.count({ where: { status: 'FOLLOW_UP' } }),
    prisma.enquiry.count({ where: { status: 'CONVERTED' } }),
    prisma.enquiry.count({ where: { status: 'CLOSED' } }),
    prisma.student.count(),
    prisma.course.count({ where: { isActive: true } }),
    prisma.faculty.count({ where: { isActive: true } }),
    prisma.enquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  // Enquiries by source
  const enquiriesBySource = await prisma.enquiry.groupBy({
    by: ['source'],
    _count: { id: true },
  });

  // Enquiries this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const enquiriesThisMonth = await prisma.enquiry.count({
    where: { createdAt: { gte: startOfMonth } },
  });

  res.json({
    status: 'success',
    data: {
      stats: {
        totalEnquiries,
        newEnquiries,
        contactedEnquiries,
        followUpEnquiries,
        convertedEnquiries,
        closedEnquiries,
        totalStudents,
        totalCourses,
        totalFaculty,
        enquiriesThisMonth,
      },
      enquiriesBySource: enquiriesBySource.map(s => ({
        source: s.source,
        count: s._count.id,
      })),
      recentEnquiries,
      recentStudents,
    },
  });
});

module.exports = { getDashboard };
