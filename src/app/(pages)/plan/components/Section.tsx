import React, { useState } from 'react';
import Modal from 'react-modal';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import FigureCard from "@/app/(pages)/plan/components/Figure";
import ReferenceCard from "@/app/(pages)/plan/components/Reference";

interface SectionCardProps extends Section {
    sources: Source[];
    parentId: string;
    index: number;
}

const SectionCard: React.FC<SectionCardProps> = ({
                                                     title,
                                                     title_feedback,
                                                     abstract,
                                                     abstract_feedback,
                                                     themes,
                                                     themes_feedback,
                                                     references,
                                                     references_feedback,
                                                     redaction_directives,
                                                     full_text,
                                                     figures,
                                                     subsections_feedback,
                                                     subsections,
                                                     sources,
                                                     parentId,
                                                     index,
                                                 }) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [isFeedbackOpen, setIsFeedbackOpen] = useState({
        title: false,
        abstract: false,
        themes: false,
        references: false,
        subsections: false,
    });

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const toggleSection = () => {
        setIsOpen(!isOpen);
    };

    const handleFeedbackToggle = (type: string) => {
        setIsFeedbackOpen(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFeedback(e.target.value);
    };

    const handleFeedbackSubmit = (type: string) => {
        // Handle feedback submission logic here
        console.log(`Feedback for ${type}:`, feedback);
        setFeedback('');
        setIsFeedbackOpen(prev => ({ ...prev, [type]: false }));
    };

    const truncatedFullText = (full_text?.length || 0) > 500 ? `${full_text?.substring(0, 500)}...` : full_text;
    const sectionId = parentId ? `${parentId}.${index + 1}` : `${index + 1}`;

    return (
        <div className={`p-4 bg-white shadow-md rounded-md mb-4 w-full ${!parentId ? 'border border-gray-300' : 'border-l-4 border-blue-500'}`}>
            <div className="flex justify-between items-center">
                <h3 className={`text-xl font-semibold mb-2 ${!parentId ? 'text-blue-800' : 'text-blue-600'}`}>{sectionId} - {title}</h3>
                <button onClick={toggleSection} className="text-blue-500">
                    {isOpen ? <FaCaretUp size={20} /> : <FaCaretDown size={20} />}
                </button>
            </div>
            {isOpen && (
                <>
                    {abstract && <div className="mb-2">{abstract}</div>}

                    <div className="mb-2">
                        <strong>Title Feedback:</strong>
                        {isFeedbackOpen.title ? (
                            <div>
                                <textarea
                                    value={feedback}
                                    onChange={handleFeedbackChange}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Enter your feedback here"
                                />
                                <button onClick={() => handleFeedbackSubmit('title')} className="mt-2 bg-blue-500 text-white py-1 px-2 rounded-md">Save</button>
                            </div>
                        ) : (
                            <button onClick={() => handleFeedbackToggle('title')} className="text-blue-500 underline">Add Feedback</button>
                        )}
                    </div>

                    {abstract_feedback && (
                        <div className="text-sm text-red-600 mb-2">Abstract Feedback: {abstract_feedback}</div>
                    )}

                    {themes.length > 0 && (
                        <div className="mb-2">
                            <strong>Themes:</strong>
                            <ul className="ml-4 list-disc">
                                {themes.map((theme, index) => (
                                    <li key={index}>{theme}</li>
                                ))}
                            </ul>
                            {isFeedbackOpen.themes ? (
                                <div>
                                    <textarea
                                        value={feedback}
                                        onChange={handleFeedbackChange}
                                        className="w-full p-2 border rounded-md"
                                        placeholder="Enter your feedback here"
                                    />
                                    <button onClick={() => handleFeedbackSubmit('themes')} className="mt-2 bg-blue-500 text-white py-1 px-2 rounded-md">Save</button>
                                </div>
                            ) : (
                                <button onClick={() => handleFeedbackToggle('themes')} className="text-blue-500 underline">Add Feedback</button>
                            )}
                        </div>
                    )}

                    {themes_feedback && (
                        <div className="text-sm text-red-600 mb-2">Themes Feedback: {themes_feedback}</div>
                    )}

                    {redaction_directives && <div className="mb-2"><strong>Redaction Directives:</strong> {redaction_directives}</div>}

                    {full_text && (
                        <div className="mb-4">
                            <strong>Full Text:</strong>
                            <p>{truncatedFullText}</p>
                            {full_text.length > 500 && (
                                <button onClick={openModal} className="text-blue-500 underline">
                                    Read More
                                </button>
                            )}
                        </div>
                    )}

                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal}
                        contentLabel="Full Text"
                        className="fixed inset-0 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75"
                        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
                    >
                        <div className="bg-white p-6 rounded-lg w-full max-w-2xl mx-auto">
                            <button className="text-right mb-4" onClick={closeModal}>Close</button>
                            <h4 className="text-xl font-semibold mb-2">Full Text</h4>
                            <p>{full_text}</p>
                        </div>
                    </Modal>

                    {figures.length > 0 && (
                        <div className="mb-4">
                            <strong>Figures:</strong>
                            <div className="flex flex-wrap">
                                {figures.map(fig => <FigureCard key={fig.title} {...fig} />)}
                            </div>
                        </div>
                    )}

                    {references.length > 0 && (
                        <div className="mb-4">
                            <strong>References:</strong>
                            {references.map(ref => (
                                <ReferenceCard key={ref.source_id} reference={ref} sources={sources} />
                            ))}
                            {isFeedbackOpen.references ? (
                                <div>
                                    <textarea
                                        value={feedback}
                                        onChange={handleFeedbackChange}
                                        className="w-full p-2 border rounded-md"
                                        placeholder="Enter your feedback here"
                                    />
                                    <button onClick={() => handleFeedbackSubmit('references')} className="mt-2 bg-blue-500 text-white py-1 px-2 rounded-md">Save</button>
                                </div>
                            ) : (
                                <button onClick={() => handleFeedbackToggle('references')} className="text-blue-500 underline">Add Feedback</button>
                            )}
                        </div>
                    )}

                    {references_feedback && (
                        <div className="text-sm text-red-600 mb-2">References Feedback: {references_feedback}</div>
                    )}

                    {subsections_feedback && (
                        <div className="text-sm text-red-600 mb-2">Subsections Feedback: {subsections_feedback}</div>
                    )}
                </>
            )}
            {subsections.length > 0 && (
                <div className="mt-4 ml-6 border-l-4 border-gray-300 pl-4">
                    <strong>Subsections:</strong>
                    {subsections.map((sub, subIndex) => (
                        <SectionCard key={sub.title} {...sub} sources={sources} parentId={sectionId} index={subIndex} />
                    ))}
                    {isFeedbackOpen.subsections ? (
                        <div>
                            <textarea
                                value={feedback}
                                onChange={handleFeedbackChange}
                                className="w-full p-2 border rounded-md"
                                placeholder="Enter your feedback here"
                            />
                            <button onClick={() => handleFeedbackSubmit('subsections')} className="mt-2 bg-blue-500 text-white py-1 px-2 rounded-md">Save</button>
                        </div>
                    ) : (
                        <button onClick={() => handleFeedbackToggle('subsections')} className="text-blue-500 underline">Add Feedback</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SectionCard;
