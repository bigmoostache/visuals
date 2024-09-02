import React, { useState, useEffect, useRef } from "react";
import { FaCog } from "react-icons/fa";
import { fetchProjects } from "../data-api/DataApi";

interface Project {
  project_id: number;
  name: string;
  theme: string;
}

interface SettingsIconProps {
  onProjectSelect: (projectId: string) => void;
  onFileUploaded: (file: File) => void;
}

const SettingsIcon: React.FC<SettingsIconProps> = ({
  onProjectSelect,
  onFileUploaded,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [file, setFile] = useState<File>();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchProjects()
      .then((projects) => {
        setProjects(projects || []);
      })
      .catch((e) => setProjects([]));
  }, []);

  const handleProjectSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = event.target.value;
    setSelectedProject(projectId);
    onProjectSelect(projectId); // Transmet l'ID du projet au composant parent
  };

  const togglePopin = () => {
    setIsOpen(!isOpen);
  };

  // FILE UPLOADER:
  const handleFileChange = (e: any) => {
    const selectedFile = Array.from(e.target.files)[0] as File;
    setFile(selectedFile);
    onFileUploaded(selectedFile);
    setIsOpen(false);
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: any) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    const droppedFile = Array.from(e.dataTransfer.files)[0] as File;
    setFile(droppedFile);
    onFileUploaded(droppedFile);
    setIsDragging(false);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-0 right-0 p-4 no-print">
      <FaCog onClick={togglePopin} className="cursor-pointer text-2xl" />

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded-lg relative min-w-[300px]">
            <button
              onClick={togglePopin}
              className="absolute top-2 right-2 text-xl"
            >
              X
            </button>
            <div>
              <label
                htmlFor="project-select"
                className="block text-sm font-medium text-gray-700"
              >
                Choisir un projet :
              </label>
              <select
                id="project-select"
                value={selectedProject}
                onChange={handleProjectSelect}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">-- Sélectionner un projet --</option>
                {projects.map((project) => (
                  <option key={project.project_id} value={project.project_id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedProject && (
              <div>
                <h3>Upload File</h3>
                <input
                  type="file"
                  placeholder="Choose a file"
                  onChange={handleFileChange}
                />
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`mt-2 border-2 border-dashed border-gray-300 p-5 text-center cursor-pointer ${
                    isDragging ? "bg-blue-100" : "bg-white"
                  }`}
                >
                  <p>ou glissez-déposez des fichiers ici</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsIcon;
