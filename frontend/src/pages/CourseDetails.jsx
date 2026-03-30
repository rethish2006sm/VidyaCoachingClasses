import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiClient } from '../lib/apiClient'

const CourseDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const handleJoinCourse = useCallback(() => {
    if (!course) return
    navigate("/admission", {
      state: {
        course: {
          id: course._id ?? course.id,
          title: course.title,
          grade: course.grade,
          fee: course.fee,
        },
      },
    })
  }, [course, navigate])

  useEffect(() => {
    const controller = new AbortController()
    const fetchCourse = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await apiClient.get(`/courses/${id}`, {}, { signal: controller.signal })
        setCourse(response)
        if (!response) {
          setCourse(null)
          setError('Course not found')
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        setCourse(null)
        setError(err.message || 'Unable to load course details.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCourse()
    } else {
      setLoading(false)
      setError('Course not specified')
    }

    return () => controller.abort()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading course details…</p>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="rounded-2xl border border-red-200 bg-white/90 p-10 text-center shadow-xl">
          <p className="text-xl font-semibold text-red-600">
            {error || 'Course not found'}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Please go back and choose one of the batches we offer.
          </p>
          <Link
            to="/courses"
            className="mt-4 inline-block rounded-full bg-[#c62c3a] px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-[#a20d1d]"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] bg-[#fdf2ef] py-12 px-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 rounded-3xl border border-[#f1c5bf] bg-white/90 p-8 shadow-[0_20px_60px_rgba(198,44,58,0.3)]">
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold uppercase tracking-[0.5em] text-[#c62c3a]">Detailed course</p>
      <h1 className="text-4xl font-[Cinzel] text-[#a10c12]">{course.title}</h1>
      {(() => {
        const gradeLabel = Array.isArray(course.grades) && course.grades.length
          ? course.grades.join(" / ")
          : course.grade;

        return gradeLabel ? (
          <p className="text-lg font-bold uppercase tracking-[0.3em] text-[#c62c3a]">
            Grade: {gradeLabel}
          </p>
        ) : null;
      })()}
      <p className="text-slate-500">{course.description}</p>
    </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-[#fde3de] bg-gradient-to-br from-[#fff1ed] to-white p-5">
            <p className="text-sm uppercase tracking-[0.4em] text-[#c62c3a]">Timings</p>
            <p className="text-lg font-semibold text-slate-800">{course.timings}</p>
            <p className="text-sm text-slate-500">Mon · Tue · Wed · Thu · Fri · Sat</p>
          </div>
          <div className="space-y-3 rounded-2xl border border-[#fde3de] bg-gradient-to-br from-[#fff1ed] to-white p-5">
            <p className="text-sm uppercase tracking-[0.4em] text-[#c62c3a]">Fee</p>
            <p className="text-3xl font-bold text-[#d31a22]">{course.fee}</p>
            <p className="text-sm text-slate-500">Installment-friendly, scholarships available on request.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-[#c62c3a]">Assigned Faculty</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {(course.subjects || []).map((subject) => (
                <div
                  key={subject.name}
                  className="rounded-2xl border border-[#f4e1de] bg-white/90 p-3 text-sm text-slate-700 shadow-sm"
                >
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{subject.name}</p>
                  <p className="text-sm font-semibold text-slate-900">{subject.faculty}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-[#c62c3a]">Subjects</p>
            <div className="mt-3 grid gap-3 rounded-2xl border border-dashed border-[#c62c3a] bg-white p-4 text-sm text-slate-700 md:grid-cols-2">
              {(course.subjects || []).map((subject) => (
                <span
                  key={`subject-pill-${subject.name}`}
                  className="rounded-full border border-dashed border-[#c62c3a] px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em]"
                >
                  {subject.name}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-[#c62c3a]">Highlights</p>
            <ul className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
              {(course.highlights || []).map((highlight) => (
                <li key={highlight} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#d31a22]" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-[#c62c3a]">Additional Details</p>
            <div className="mt-3 space-y-2 rounded-2xl border border-[#f4e1de] bg-[#fff7f5] p-4 text-sm text-slate-600">
              {(course.additionalDetails || []).map((detail) => (
                <p key={detail} className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-[#a10c12]" />
                  {detail}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            to="/courses"
            className="inline-flex items-center justify-center rounded-full border border-[#a10c12] bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-[#a10c12] transition hover:bg-[#a10c12] hover:text-white"
          >
            Back to Course Listings
          </Link>
          <button
            type="button"
            onClick={handleJoinCourse}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff4b3e] to-[#d6302c] px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white shadow-lg transition hover:scale-[1.02]"
          >
            Join the Batch
          </button>
        </div>
      </div>
    </div>
  )
}

export default CourseDetails
