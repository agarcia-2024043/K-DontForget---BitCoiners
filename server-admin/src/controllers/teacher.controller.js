import Teacher from "../models/teacher.model.js";

// Obtener todos los profesores
export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ nombre: 1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener profesores", error: error.message });
  }
};

// Obtener un profesor por ID
export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Profesor no encontrado" });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener profesor", error: error.message });
  }
};

// Crear un nuevo profesor
export const createTeacher = async (req, res) => {
  try {
    const newTeacher = new Teacher(req.body);
    const savedTeacher = await newTeacher.save();
    res.status(201).json(savedTeacher);
  } catch (error) {
    res.status(500).json({ message: "Error al crear profesor", error: error.message });
  }
};

// Actualizar un profesor existente
export const updateTeacher = async (req, res) => {
  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTeacher) return res.status(404).json({ message: "Profesor no encontrado" });
    res.json(updatedTeacher);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar profesor", error: error.message });
  }
};

// Eliminar un profesor
export const deleteTeacher = async (req, res) => {
  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!deletedTeacher) return res.status(404).json({ message: "Profesor no encontrado" });
    res.json({ message: "Profesor eliminado con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar profesor", error: error.message });
  }
};
