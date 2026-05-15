require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../db');
const User = require('../models/User');
const Course = require('../models/Course');

const INSTRUCTOR_EMAIL = 'instructor@studyhub.dev';

const sampleCourses = [
  {
    title: 'Artificial Intelligence',
    description:
      'Learn machine learning fundamentals, neural networks, and practical AI applications with hands-on projects.',
    category: 'Artificial Intelligence',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    tags: ['ai', 'ml', 'python'],
    modules: [
      {
        title: 'Introduction to AI',
        description: 'Core concepts and history of artificial intelligence.',
        order: 1,
        lessons: [
          {
            title: 'What is Artificial Intelligence?',
            type: 'video',
            order: 1,
            isPreviewable: true,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=ad79nYk2keg',
              durationSec: 600,
            },
          },
          {
            title: 'AI vs Machine Learning vs Deep Learning',
            type: 'note',
            order: 2,
            isPreviewable: true,
            content: {
              provider: 'inline',
              markdown:
                '**AI** is the broad field of building intelligent systems.\n\n**Machine Learning** learns patterns from data.\n\n**Deep Learning** uses neural networks with many layers.',
            },
          },
        ],
      },
    ],
  },
  {
    title: 'Web Development',
    description:
      'Master HTML, CSS, JavaScript, and modern frameworks to build responsive web applications.',
    category: 'Web Development',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800',
    tags: ['html', 'css', 'javascript', 'react'],
    modules: [
      {
        title: 'Web Foundations',
        order: 1,
        lessons: [
          {
            title: 'HTML Crash Course',
            type: 'video',
            order: 1,
            isPreviewable: true,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=qz0aGYrrlhU',
              durationSec: 4800,
            },
          },
        ],
      },
    ],
  },
  {
    title: 'Cyber Security',
    description:
      'Understand network security, common vulnerabilities, and ethical hacking fundamentals.',
    category: 'Cyber Security',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
    tags: ['security', 'networking'],
    modules: [
      {
        title: 'Security Basics',
        order: 1,
        lessons: [
          {
            title: 'Introduction to Cybersecurity',
            type: 'video',
            order: 1,
            isPreviewable: true,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=inWWhr5tnEA',
              durationSec: 900,
            },
          },
        ],
      },
    ],
  },
  {
    title: 'Data Science',
    description:
      'Analyze data and build predictive models using Python, pandas, and visualization tools.',
    category: 'Data Science',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    tags: ['data', 'python', 'analytics'],
    modules: [
      {
        title: 'Data Science Workflow',
        order: 1,
        lessons: [
          {
            title: 'What is Data Science?',
            type: 'video',
            order: 1,
            isPreviewable: true,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=ua-CiDNNj30',
              durationSec: 1200,
            },
          },
        ],
      },
    ],
  },
  {
    title: 'Cloud Computing',
    description:
      'Explore cloud services, deployment models, and infrastructure on major providers.',
    category: 'Cloud Computing',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1603732551658-5fabbafa84eb?w=800',
    tags: ['aws', 'cloud', 'devops'],
    modules: [
      {
        title: 'Cloud Fundamentals',
        order: 1,
        lessons: [
          {
            title: 'Cloud Computing Explained',
            type: 'video',
            order: 1,
            isPreviewable: true,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=mxT233EdY5o',
              durationSec: 900,
            },
          },
        ],
      },
    ],
  },
  {
    title: 'Game Development',
    description:
      'Create engaging games with core design principles and popular engines.',
    category: 'Game Development',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=800',
    tags: ['games', 'unity'],
    modules: [
      {
        title: 'Game Dev Intro',
        order: 1,
        lessons: [
          {
            title: 'How to Start Making Games',
            type: 'video',
            order: 1,
            isPreviewable: true,
            content: {
              provider: 'youtube',
              url: 'https://www.youtube.com/watch?v=z06QR-tz1-o',
              durationSec: 1500,
            },
          },
        ],
      },
    ],
  },
];

function youtubeIdFromUrl(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
}

async function seed() {
  await connectDB();

  let instructor = await User.findOne({ email: INSTRUCTOR_EMAIL });
  if (!instructor) {
    instructor = await User.create({
      name: 'StudyHub Instructor',
      email: INSTRUCTOR_EMAIL,
      password: 'studyhub123',
      role: 'instructor',
      emailVerified: true,
    });
    console.log(`Created instructor: ${INSTRUCTOR_EMAIL} / studyhub123`);
  }

  let created = 0;
  let skipped = 0;

  for (const data of sampleCourses) {
    const exists = await Course.findOne({ title: data.title });
    if (exists) {
      skipped += 1;
      continue;
    }

    const modules = (data.modules || []).map((mod) => ({
      ...mod,
      lessons: (mod.lessons || []).map((lesson) => {
        const content = { ...lesson.content };
        if (content.provider === 'youtube' && content.url && !content.url.includes('embed')) {
          const videoId = youtubeIdFromUrl(content.url);
          if (videoId) content.url = `https://www.youtube.com/embed/${videoId}`;
        }
        return { ...lesson, content };
      }),
    }));

    const course = await Course.create({
      ...data,
      modules,
      published: true,
      price: 0,
      instructor: instructor._id,
    });

    await User.findByIdAndUpdate(instructor._id, {
      $addToSet: { createdCourses: course._id },
    });

    created += 1;
    console.log(`Seeded: ${course.title} (${course.slug})`);
  }

  console.log(`Done. Created ${created}, skipped ${skipped}.`);
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
