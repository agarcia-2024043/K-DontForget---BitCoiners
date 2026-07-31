import { useState, useCallback } from 'react'

const MOCK_STUDENTS = [
  { id: 1, nombre: 'Jean Pinos',     grado: '4to Bachillerato', tutor: 'Nury Pérez', tipoCita: 'Individual', ultimaCita: '2025-06-11' },
  { id: 2, nombre: 'Jeacite Plases', grado: '3ro Básico',       tutor: 'Cillma',     tipoCita: 'Grupal',     ultimaCita: '2025-06-11' },
  { id: 3, nombre: 'Jeonia Phaes',   grado: '5to Bachillerato', tutor: 'Cillma',     tipoCita: 'Individual', ultimaCita: '2023-06-11' },
  { id: 4, nombre: 'Jocan Plues',    grado: '2do Básico',       tutor: 'Cillma',     tipoCita: 'Individual', ultimaCita: '2025-06-11' },
  { id: 5, nombre: 'Jeoff W. Korget',grado: '4to Bachillerato', tutor: 'Nury Pérez', tipoCita: 'Grupal',     ultimaCita: '2023-06-11' },
]

/**
 * Local-state hook for students.
 * Swap function bodies for calls to a `studentsApi` once the backend
 * endpoint exists — pages consuming this hook won't need to change.
 */
export function useStudents() {
  const [students, setStudents] = useState(MOCK_STUDENTS)

  const addStudent = useCallback((data) => {
    setStudents(prev => [...prev, { ...data, id: Date.now() }])
  }, [])

  const updateStudent = useCallback((id, data) => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)))
  }, [])

  const removeStudent = useCallback((id) => {
    setStudents(prev => prev.filter(s => s.id !== id))
  }, [])

  return { students, addStudent, updateStudent, removeStudent }
}
