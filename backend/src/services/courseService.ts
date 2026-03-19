import { prisma } from "../lib/prisma";

export async function getAllCourses() {
  return prisma.course.findMany({
    orderBy: { created_at: "desc" },
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
  });
}
