'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlayCircle, CheckCircle2, Lock, Award, FileText, HelpCircle, ChevronRight } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function InteractivePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [playerData, setPlayerData] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function loadPlayerData() {
      try {
        const data = await fetchApi<any>(`/learning/courses/${courseId}/player`);
        setPlayerData(data);
        // Select first lesson
        if (data.sections && data.sections[0]?.lessons[0]) {
          setActiveLesson(data.sections[0].lessons[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load course player');
      } finally {
        setLoading(false);
      }
    }
    if (courseId) loadPlayerData();
  }, [courseId]);

  // Periodic video progress sync handler
  const handleTimeUpdate = async () => {
    if (!videoRef.current || !activeLesson) return;
    const currentTime = Math.floor(videoRef.current.currentTime);
    const duration = Math.floor(videoRef.current.duration) || 1;

    // Send progress every 15s or when near completion
    if (currentTime % 15 === 0 || currentTime >= duration - 2) {
      const isCompleted = currentTime >= duration * 0.9;
      try {
        await fetchApi(`/learning/lessons/${activeLesson.id}/progress`, {
          method: 'POST',
          body: JSON.stringify({
            progress_seconds: currentTime,
            completed: isCompleted,
          }),
        });
      } catch (_) {}
    }
  };

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    try {
      await fetchApi(`/learning/lessons/${activeLesson.id}/progress`, {
        method: 'POST',
        body: JSON.stringify({
          progress_seconds: activeLesson.video_duration_seconds || 100,
          completed: true,
        }),
      });
      // Refresh player state
      const updated = await fetchApi<any>(`/learning/courses/${courseId}/player`);
      setPlayerData(updated);
    } catch (err: any) {
      alert('Failed updating lesson progress');
    }
  };

  const handleQuizSubmit = async () => {
    if (!activeQuiz) return;
    try {
      const payload = {
        quiz_id: activeQuiz.id,
        answers: Object.entries(selectedAnswers).map(([qId, optId]) => ({
          question_id: qId,
          selected_option_id: optId,
        })),
      };
      const res = await fetchApi<any>('/learning/quizzes/submit', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setQuizResult(res);
    } catch (err: any) {
      alert(err.message || 'Quiz submission failed');
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Loading interactive player...</div>;
  if (error || !playerData) return <div className="p-12 text-center text-red-400">{error || 'Course access restricted'}</div>;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-white">
      {/* Main Video / Content Area */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Course Player</span>
            <h1 className="text-2xl font-bold text-white">{playerData.course_title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 text-right">
              <span className="block font-bold text-white">{playerData.progress_percentage.toFixed(0)}% Completed</span>
              <span>Overall Progress</span>
            </div>
            {playerData.is_completed && (
              <button
                onClick={() => router.push('/certificates/verify/EDU-DEMO-CERT')}
                className="gradient-button px-4 py-2 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Award className="w-4 h-4" /> Download Certificate
              </button>
            )}
          </div>
        </div>

        {/* Video Player Box */}
        {activeLesson ? (
          <div className="space-y-4">
            <div className="glass-card rounded-3xl overflow-hidden border border-slate-800 bg-black aspect-video relative">
              {activeLesson.video_url ? (
                <video
                  ref={videoRef}
                  src={activeLesson.video_url}
                  controls
                  onTimeUpdate={handleTimeUpdate}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-3 bg-slate-900">
                  <FileText className="w-12 h-12 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">{activeLesson.title}</h3>
                  <p className="text-xs text-slate-400 max-w-md">{activeLesson.content_text || 'Reading lesson content.'}</p>
                </div>
              )}
            </div>

            {/* Lesson Control Footer */}
            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-lg">{activeLesson.title}</h3>
                <p className="text-xs text-slate-400">{activeLesson.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleMarkComplete}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark as Completed
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-12 rounded-3xl text-center text-slate-400">Select a lesson from curriculum sidebar</div>
        )}
      </div>

      {/* Curriculum Sidebar */}
      <div className="w-full md:w-96 glass-card border-l border-slate-800 p-6 space-y-6 flex flex-col h-auto md:h-screen overflow-y-auto">
        <h2 className="text-lg font-bold text-white pb-3 border-b border-slate-800">Course Curriculum</h2>

        <div className="space-y-4">
          {playerData.sections.map((section: any, idx: number) => (
            <div key={section.id} className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Section {idx + 1}: {section.title}
              </h3>
              <div className="space-y-1">
                {section.lessons.map((lesson: any) => {
                  const isActive = activeLesson?.id === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between text-xs ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-md'
                          : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {lesson.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <PlayCircle className="w-4 h-4 text-blue-400 shrink-0" />
                        )}
                        <span className="line-clamp-1">{lesson.title}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
