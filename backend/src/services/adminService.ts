import { prisma } from "../lib/prisma";
import { withPrismaRetry } from "../lib/prismaRetry";
import { HttpError } from "../lib/httpError";

export async function getDashboardStats() {
  const [studentCount, courseCount, enrollmentCount] = await Promise.all([
    withPrismaRetry(() => prisma.user.count({ where: { role: "student" } })),
    withPrismaRetry(() => prisma.course.count()),
    withPrismaRetry(() => prisma.enrollment.count()),
  ]);

  return { studentCount, courseCount, enrollmentCount };
}

export async function getAllStudents(search?: string) {
  const where = search
    ? {
        role: "student" as const,
        OR: [
          { first_name: { contains: search, mode: "insensitive" as const } },
          { last_name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { student_id: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : { role: "student" as const };

  const students = await withPrismaRetry(() =>
    prisma.user.findMany({
      where,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        student_id: true,
        created_at: true,
        _count: { select: { enrollments: true } },
      },
    }),
  );

  return students.map((s) => ({
    id: s.id,
    first_name: s.first_name,
    last_name: s.last_name,
    email: s.email,
    student_id: s.student_id,
    created_at: s.created_at,
    enrollment_count: s._count.enrollments,
  }));
}

export async function getStudentDetail(studentId: string) {
  const student = await withPrismaRetry(() =>
    prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        student_id: true,
        role: true,
        created_at: true,
        enrollments: {
          orderBy: { created_at: "desc" },
          select: {
            id: true,
            created_at: true,
            course: {
              select: {
                id: true,
                class_name: true,
                professor: true,
                duration: true,
                rating: true,
              },
            },
          },
        },
      },
    }),
  );

  if (!student) throw new HttpError(404, "Student not found");
  if (student.role !== "student") throw new HttpError(400, "User is not a student");

  return {
    ...student,
    enrollments: student.enrollments.map((e) => ({
      enrollment_id: e.id,
      enrolled_at: e.created_at,
      ...e.course,
    })),
  };
}

export async function createCourse(input: {
  class_name: string;
  professor: string;
  duration: string;
  rating: number;
  description: string;
  capacity: number;
}) {
  return withPrismaRetry(() =>
    prisma.course.create({
      data: input,
      select: {
        id: true,
        class_name: true,
        professor: true,
        duration: true,
        rating: true,
        description: true,
        capacity: true,
        created_at: true,
      },
    }),
  );
}

export async function updateCourse(
  courseId: string,
  input: {
    class_name?: string;
    professor?: string;
    duration?: string;
    rating?: number;
    description?: string;
    capacity?: number;
  },
) {
  const course = await withPrismaRetry(() => prisma.course.findUnique({ where: { id: courseId } }));
  if (!course) throw new HttpError(404, "Course not found");

  return withPrismaRetry(() =>
    prisma.course.update({
      where: { id: courseId },
      data: input,
      select: {
        id: true,
        class_name: true,
        professor: true,
        duration: true,
        rating: true,
        description: true,
        capacity: true,
        created_at: true,
      },
    }),
  );
}

export async function deleteCourse(courseId: string) {
  const course = await withPrismaRetry(() => prisma.course.findUnique({ where: { id: courseId } }));
  if (!course) throw new HttpError(404, "Course not found");

  await withPrismaRetry(() => prisma.enrollment.deleteMany({ where: { course_id: courseId } }));
  await withPrismaRetry(() => prisma.course.delete({ where: { id: courseId } }));
}

export async function getCourseEnrollments(courseId: string) {
  const course = await withPrismaRetry(() => prisma.course.findUnique({ where: { id: courseId } }));
  if (!course) throw new HttpError(404, "Course not found");

  const enrollments = await withPrismaRetry(() =>
    prisma.enrollment.findMany({
      where: { course_id: courseId },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        created_at: true,
        student: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            student_id: true,
          },
        },
      },
    }),
  );

  return {
    course_id: course.id,
    course_name: course.class_name,
    capacity: course.capacity,
    enrolled_count: enrollments.length,
    students: enrollments.map((e) => ({
      enrollment_id: e.id,
      enrolled_at: e.created_at,
      ...e.student,
    })),
  };
}

export async function removeEnrollment(enrollmentId: string) {
  const enrollment = await withPrismaRetry(() =>
    prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    }),
  );

  if (!enrollment) throw new HttpError(404, "Enrollment not found");

  await withPrismaRetry(() => prisma.enrollment.delete({ where: { id: enrollmentId } }));
}
