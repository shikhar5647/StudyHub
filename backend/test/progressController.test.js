const { buildProgressPayload } = require('../controllers/progressController');

describe('buildProgressPayload', () => {
  it('falls back to module lesson count when metadata.totalLessons is NaN', () => {
    const course = {
      _id: 'course-1',
      slug: 'course-1',
      metadata: { totalLessons: NaN },
      modules: [{ lessons: [{ _id: 'l1' }, { _id: 'l2' }] }],
    };
    const entry = { completedLessonIds: ['l1'] };

    const payload = buildProgressPayload(course, entry);

    expect(payload.totalLessons).toBe(2);
    expect(payload.percentComplete).toBe(50);
  });

  it('uses metadata.totalLessons when it is finite and non-negative', () => {
    const course = {
      _id: 'course-2',
      slug: 'course-2',
      metadata: { totalLessons: 10 },
      modules: [{ lessons: [{ _id: 'l1' }] }],
    };
    const entry = { completedLessonIds: ['l1', 'l2', 'l3'] };

    const payload = buildProgressPayload(course, entry);

    expect(payload.totalLessons).toBe(10);
    expect(payload.percentComplete).toBe(30);
  });
});
