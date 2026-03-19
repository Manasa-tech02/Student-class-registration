-- Seed sample Computer Science courses
INSERT INTO "courses" ("id", "class_name", "professor", "duration", "rating", "description", "capacity")
VALUES
  ('cs101-intro-programming', 'CS101: Introduction to Programming', 'Dr. Alan Brooks', '12 weeks', 4.6, 'Learn programming fundamentals using Python, including variables, conditionals, loops, and functions.', 80),
  ('cs201-data-structures', 'CS201: Data Structures', 'Prof. Meera Shah', '14 weeks', 4.8, 'Study arrays, linked lists, stacks, queues, trees, and hash maps with practical implementation exercises.', 70),
  ('cs202-algorithms', 'CS202: Design and Analysis of Algorithms', 'Dr. Ravi Kumar', '14 weeks', 4.7, 'Explore algorithmic paradigms including divide and conquer, dynamic programming, and greedy methods.', 65),
  ('cs210-database-systems', 'CS210: Database Systems', 'Prof. Laura Chen', '12 weeks', 4.5, 'Understand relational modeling, SQL, normalization, transactions, and indexing for scalable applications.', 75),
  ('cs220-operating-systems', 'CS220: Operating Systems', 'Dr. Joseph Lin', '13 weeks', 4.4, 'Cover processes, threads, synchronization, memory management, and file systems with hands-on labs.', 60),
  ('cs230-computer-networks', 'CS230: Computer Networks', 'Prof. Nikhil Menon', '12 weeks', 4.5, 'Learn networking fundamentals, TCP/IP, routing, congestion control, and application-layer protocols.', 68),
  ('cs240-software-engineering', 'CS240: Software Engineering', 'Dr. Priya Nair', '12 weeks', 4.7, 'Practice requirements gathering, system design, testing, version control, and agile team workflows.', 90),
  ('cs310-machine-learning', 'CS310: Machine Learning Fundamentals', 'Prof. Elena Garcia', '14 weeks', 4.9, 'Introduction to supervised and unsupervised learning, model evaluation, and feature engineering.', 55)
ON CONFLICT ("id") DO NOTHING;
