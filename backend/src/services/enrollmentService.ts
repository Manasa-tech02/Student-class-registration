import { prisma } from "../lib/prisma";
import { withPrismaRetry } from "../lib/prismaRetry";
import { HttpError } from "../lib/httpError";
import { Prisma } from "../../generated/prisma/client";

export async function enroll(studentId: string, courseId: string) {
  const course = await withPrismaRetry(() =>
    prisma.course.findUnique({ where: { id: courseId } }),
  );
  if (!course) throw new HttpError(404, "Course not found");

  try {
    const enrollment = await withPrismaRetry(() =>
      prisma.enrollment.create({
        data: { student_id: studentId, course_id: courseId },
        select: { id: true, course_id: true, created_at: true },
      }),
    );
    return enrollment;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new HttpError(409, "Already enrolled in this course");
    }
    throw err;
  }
}

export async function dropCourse(studentId: string, courseId: string) {
  const enrollment = await withPrismaRetry(() =>
    prisma.enrollment.findUnique({
      where: { student_id_course_id: { student_id: studentId, course_id: courseId } },
    }),
  );

  if (!enrollment) throw new HttpError(404, "Enrollment not found");

  await withPrismaRetry(() => prisma.enrollment.delete({ where: { id: enrollment.id } }));
}

export async function getMyCourses(studentId: string) {
  const enrollments = await withPrismaRetry(() =>
    prisma.enrollment.findMany({
      where: { student_id: studentId },
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
            description: true,
            capacity: true,
          },
        },
      },
    }),
  );

  return enrollments.map((e) => ({
    enrollment_id: e.id,
    enrolled_at: e.created_at,
    ...e.course,
  }));
}
