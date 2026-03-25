import { apiSlice } from "../../store/apiSlice";
import type { Course, EnrolledCourse } from "../../api"; 

export const coursesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /courses -> provides "Course" tag
    getCourses: builder.query<{ courses: Course[] }, void>({
      query: () => "/courses",
      providesTags: ["Course"],
    }),
    
    // GET /enrolled/courses -> provides "Enrollment" tag
    getMyCourses: builder.query<{ courses: EnrolledCourse[] }, void>({
      query: () => "/enrolled/courses",
      providesTags: ["Enrollment"],
    }),
    
    // POST /enrolled -> invalidates "Enrollment"
    enrollInCourse: builder.mutation<{ message: string }, string>({
      query: (courseId) => ({
        url: "/enrolled",
        method: "POST",
        body: { course_id: courseId },
      }),
      invalidatesTags: ["Enrollment"],
    }),
    
    // DELETE /enrolled -> invalidates "Enrollment"
    dropCourse: builder.mutation<{ message: string }, string>({
      query: (courseId) => ({
        url: "/enrolled",
        method: "DELETE",
        body: { course_id: courseId },
      }),
      invalidatesTags: ["Enrollment"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCoursesQuery,
  useGetMyCoursesQuery,
  useEnrollInCourseMutation,
  useDropCourseMutation,
} = coursesApi;
