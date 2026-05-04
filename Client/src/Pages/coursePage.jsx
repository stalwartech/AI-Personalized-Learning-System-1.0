import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Pages/coursePage.css";
import axiosInstance from "../../services/axiosConfig";


// ─── Inline Markdown → HTML renderer (no external library needed) ─────────────
function renderMarkdown(md = "") {
  if (!md) return "";
  let html = md
    // Headings
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Code blocks
    .replace(/```[\w]*\n([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    // Unordered list items
    .replace(/^\s*[-*]\s+(.+)$/gm, "<li>$1</li>")
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    // Blockquote
    .replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>")
    // Paragraphs (blank line separated)
    .replace(/\n\n(?!<[uoh])/g, "</p><p>")
    // Line breaks
    .replace(/\n(?!<)/g, "<br/>");

  return `<p>${html}</p>`;
}

// ─── Progress Ring SVG ─────────────────────────────────────────────────────────
function ProgressRing({ percentage, size = 48, stroke = 4 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="var(--track)" strokeWidth={stroke}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="var(--accent)" strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 0.5s ease" }}
      />
      <text x="50%" y="54%" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="600">
        {percentage}%
      </text>
    </svg>
  );
}

// ─── Check Icon ────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Main CoursePage Component ────────────────────────────────────────────────
export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedSet, setCompletedSet] = useState(new Set());
  const [activeTab, setActiveTab] = useState("notes"); // "notes" | "overview"
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const notesRef = useRef(null);

  // ── Fetch course on mount ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axiosInstance.get(`/api/courses/${courseId}`);
        const data = response.data;
        const courseData = data.data?.course || data.course || data;
        setCourse(courseData);

        // Restore completed lessons from DB progress
        if (courseData.progress?.completedLessons) {
          const savedSet = new Set(
            Array.from({ length: courseData.progress.completedLessons }, (_, i) => i)
          );
          setCompletedSet(savedSet);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  // ── Scroll notes to top on lesson change ───────────────────────────────────
  useEffect(() => {
    if (notesRef.current) notesRef.current.scrollTop = 0;
  }, [currentIndex]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onBack={() => navigate(-1)} />;
  if (!course) return null;

  const lessons = course.lessons || [];
  const lesson = lessons[currentIndex];
  const totalLessons = lessons.length;
  const completedCount = completedSet.size;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isCompleted = completedSet.has(currentIndex);
  const isLast = currentIndex === totalLessons - 1;

  // ── Mark lesson complete ────────────────────────────────────────────────────
  const handleMarkComplete = async () => {
    if (isCompleted || markingComplete) return;
    setMarkingComplete(true);
    try {
      await axiosInstance.patch(
        `/api/courses/${courseId}/lessons/${lesson._id}/complete`,
        { timeSpent: lesson.estimatedDuration || 15 }
      );
      const next = new Set([...completedSet, currentIndex]);
      setCompletedSet(next);
      if (next.size === totalLessons) {
        setAllDone(true);
      } else if (!isLast) {
        // Auto-advance to next lesson after short delay
        setTimeout(() => setCurrentIndex(currentIndex + 1), 600);
      }
    } catch (err) {
      console.error("Failed to mark complete:", err);
    } finally {
      setMarkingComplete(false);
    }
  };

  if (allDone) return <CompletionScreen course={course} onBack={() => navigate("/")} />;

  return (
    <div className="cp-root">
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <header className="cp-topbar">
        <button className="cp-back-btn" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Back</span>
        </button>

        <div className="cp-topbar-center">
          <h1 className="cp-course-title">{course.title}</h1>
          <span className="cp-difficulty-badge" data-level={course.difficulty}>
            {course.difficulty}
          </span>
        </div>

        <div className="cp-topbar-right">
          <div className="cp-progress-label">
            <span>{completedCount}/{totalLessons} complete</span>
          </div>
          <ProgressRing percentage={progressPct} />
        </div>
      </header>

      {/* ── Progress Bar ─────────────────────────────────────────────────── */}
      <div className="cp-progress-track">
        <div className="cp-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* ── Main Layout ──────────────────────────────────────────────────── */}
      <div className={`cp-body ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>

        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <aside className="cp-sidebar">
          <div className="cp-sidebar-header">
            <span className="cp-sidebar-label">Course Lessons</span>
            <button className="cp-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <ul className="cp-lesson-list">
            {lessons.map((l, idx) => {
              const done = completedSet.has(idx);
              const active = idx === currentIndex;
              return (
                <li
                  key={idx}
                  className={`cp-lesson-item ${active ? "active" : ""} ${done ? "done" : ""}`}
                  onClick={() => setCurrentIndex(idx)}
                >
                  <div className={`cp-lesson-bullet ${done ? "done" : active ? "active" : ""}`}>
                    {done ? <CheckIcon /> : <span>{idx + 1}</span>}
                  </div>
                  <div className="cp-lesson-meta">
                    <span className="cp-lesson-name">{l.title}</span>
                    {l.estimatedDuration && (
                      <span className="cp-lesson-duration">{l.estimatedDuration} min</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ── Collapsed sidebar toggle ──────────────────────────────────── */}
        {!sidebarOpen && (
          <button className="cp-sidebar-reopen" onClick={() => setSidebarOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}

        {/* ── Content Area ────────────────────────────────────────────────── */}
        <main className="cp-main">
          {/* Lesson header */}
          <div className="cp-lesson-header">
            <div className="cp-lesson-number">Lesson {currentIndex + 1} of {totalLessons}</div>
            <h2 className="cp-lesson-title">{lesson.title}</h2>
          </div>

          {/* Video Player */}
          {lesson.selectedVideo ? (
            <div className="cp-video-wrapper">
              <iframe
                className="cp-video-frame"
                src={`https://www.youtube.com/embed/${lesson.selectedVideo}?rel=0&modestbranding=1`}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="cp-video-placeholder">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="var(--border)" strokeWidth="2"/>
                <path d="M19 16L34 24L19 32V16Z" fill="var(--text-muted)"/>
              </svg>
              <p>No video available for this lesson</p>
            </div>
          )}

          {/* Video options row */}
          {lesson.videoOptions?.length > 1 && (
            <div className="cp-video-options">
              <span className="cp-video-options-label">Switch video:</span>
              {lesson.videoOptions.map((v, vi) => (
                <button
                  key={vi}
                  className={`cp-vid-chip ${lesson.selectedVideo === v.videoId ? "selected" : ""}`}
                  onClick={() => {
                    const updated = [...lessons];
                    updated[currentIndex] = { ...lesson, selectedVideo: v.videoId };
                    setCourse({ ...course, lessons: updated });
                  }}
                >
                  Option {vi + 1}
                </button>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="cp-tabs">
            <button
              className={`cp-tab ${activeTab === "notes" ? "active" : ""}`}
              onClick={() => setActiveTab("notes")}
            >
              Study Notes
            </button>
            <button
              className={`cp-tab ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
          </div>

          {/* Tab Content */}
          <div className="cp-tab-content" ref={notesRef}>
            {activeTab === "notes" ? (
              <div className="cp-notes">
                {lesson.notes?.pdfUrl && (
                  <a
                    href={lesson.notes.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cp-pdf-download"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M3 13H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Download PDF Notes
                  </a>
                )}
                {lesson.notes?.markdown ? (
                  <div
                    className="cp-markdown"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.notes.markdown) }}
                  />
                ) : (
                  <p className="cp-empty-notes">No notes generated for this lesson.</p>
                )}
              </div>
            ) : (
              <div className="cp-overview">
                <p className="cp-lesson-content">{lesson.content}</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Bottom Navigation Bar ─────────────────────────────────────────── */}
      <nav className="cp-bottom-nav">
        <button
          className="cp-nav-btn prev"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Previous
        </button>

        <button
          className={`cp-complete-btn ${isCompleted ? "completed" : ""}`}
          onClick={handleMarkComplete}
          disabled={isCompleted || markingComplete}
        >
          {markingComplete ? (
            <span className="cp-spinner" />
          ) : isCompleted ? (
            <>
              <CheckIcon />
              Completed
            </>
          ) : (
            "Mark as Complete"
          )}
        </button>

        <button
          className="cp-nav-btn next"
          onClick={() => setCurrentIndex(Math.min(totalLessons - 1, currentIndex + 1))}
          disabled={isLast}
        >
          Next
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </nav>
    </div>
  );
}

// ─── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="cp-fullscreen-state">
      <div className="cp-loading-ring" />
      <p>Loading your course…</p>
    </div>
  );
}

// ─── Error Screen ──────────────────────────────────────────────────────────────
function ErrorScreen({ message, onBack }) {
  return (
    <div className="cp-fullscreen-state">
      <p className="cp-error-text">⚠ {message}</p>
      <button className="cp-complete-btn" onClick={onBack}>Go Back</button>
    </div>
  );
}

// ─── Course Completion Screen ──────────────────────────────────────────────────
function CompletionScreen({ course, onBack }) {
  return (
    <div className="cp-fullscreen-state completion">
      <div className="cp-completion-icon">🎓</div>
      <h2>Course Complete!</h2>
      <p>You've finished <strong>{course.title}</strong>.</p>
      <p className="cp-completion-sub">All {course.lessons?.length} lessons completed.</p>
      <button className="cp-complete-btn" onClick={onBack} style={{ marginTop: "2rem" }}>
        Back to Dashboard
      </button>
    </div>
  );
}
