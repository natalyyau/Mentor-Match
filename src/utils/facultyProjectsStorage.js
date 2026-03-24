const KEY = "facultyProjects";

export function getFacultyProjects() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setFacultyProjects(projects) {
  localStorage.setItem(KEY, JSON.stringify(projects));
}

export function addFacultyProject({ title, description, skills }) {
  const projects = getFacultyProjects();
  const next = [
    ...projects,
    {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `proj-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title,
      description,
      skills,
      createdAt: new Date().toISOString(),
    },
  ];
  setFacultyProjects(next);
  return next;
}

export function updateFacultyProject(id, { title, description, skills }) {
  const projects = getFacultyProjects();
  const next = projects.map((p) =>
    p.id === id ? { ...p, title, description, skills } : p
  );
  setFacultyProjects(next);
  return next;
}

export function deleteFacultyProject(id) {
  const next = getFacultyProjects().filter((p) => p.id !== id);
  setFacultyProjects(next);
  return next;
}

export function getFacultyProjectById(id) {
  return getFacultyProjects().find((p) => p.id === id) ?? null;
}
