// components/Section.tsx
import React, {useState} from 'react';
import Modal from 'react-modal';
import {FaCaretDown, FaCaretUp, FaEdit, FaTimes} from 'react-icons/fa';
import FigureCard from "@/app/(pages)/plan/components/Figure";
import ReferenceCard from "@/app/(pages)/plan/components/Reference";
import FeedbackComponent from "@/app/(pages)/plan/components/feedback";

interface SectionCardProps {
    section: Section;
    sources: Source[];
    parentId: string | undefined;
    index: number;
}

const SectionCard: React.FC<SectionCardProps> = ({
                                                     sources,
                                                     parentId,
                                                     index,
                                                     section
                                                 }) => {

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

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
        setIsFeedbackOpen(prev => ({...prev, [(type)]: !prev[type]}));
    };

    const truncatedFullText = (section.full_text?.length || 0) > 500 ? `${section.full_text?.substring(0, 500)}...` : section.full_text;
    const sectionId = parentId === undefined ? "" : parentId ? `${parentId}.${index + 1}` : `${index + 1}`;

    return (
        <div
            className={`p-4 bg-white shadow-md rounded-md mb-4 w-full ${!parentId ? 'border border-tertiary' : 'border-l-4 border-secondary'}`}>
            <div className="flex justify-between items-center">
                <h3 className={`text-xl font-semibold mb-2 ${!parentId ? 'text-primary' : 'text-primary-500'}`}>
                    {sectionId} {sectionId && ('-')} {section.title}
                    {isOpen &&
                        <FaEdit className="cursor-pointer inline ml-10" onClick={() => handleFeedbackToggle('title')}/>}
                </h3>

                <button onClick={toggleSection} className="text-primary">
                    {isOpen ? <FaCaretUp size={20}/> : <FaCaretDown size={20}/>}
                </button>
            </div>
            {isOpen && (
                <>
                    <FeedbackComponent field="title" isOpen={isFeedbackOpen.title} object={section}
                                       onToogleFeedback={handleFeedbackToggle}></FeedbackComponent>
                    {section.abstract && <div className="mb-2">
                        {section.abstract}
                        <FaEdit className="cursor-pointer inline ml-5"
                                onClick={() => handleFeedbackToggle('abstract')}/>
                    </div>}

                    <FeedbackComponent field="abstract" isOpen={isFeedbackOpen.abstract} object={section}
                                       onToogleFeedback={handleFeedbackToggle}></FeedbackComponent>

                    {section.themes.length > 0 && (
                        <div className="mb-2">
                            <strong>Themes: <FaEdit className="cursor-pointer inline ml-5"
                                                    onClick={() => handleFeedbackToggle('themes')}/></strong>
                            <ul className="ml-4 list-disc mb-2">
                                {section.themes.map((theme, index) => (
                                    <li key={index}>{theme}</li>
                                ))}
                            </ul>
                            <FeedbackComponent field="themes" isOpen={isFeedbackOpen.themes} object={section}
                                               onToogleFeedback={handleFeedbackToggle}></FeedbackComponent>
                        </div>
                    )}

                    {section.redaction_directives &&
                        <div className="mb-2"><strong>Redaction Directives:</strong> {section.redaction_directives}
                        </div>}

                    {section.full_text && (
                        <div className="mb-4">
                            <strong>Full Text:</strong>
                            <p>{truncatedFullText}</p>
                            {section.full_text.length > 500 && (
                                <button onClick={openModal} className="text-primary underline">
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
                        <div className="bg-white p-6 rounded-lg w-full max-w-2xl mx-auto relative">
                            <button className="absolute top-2 right-2 text-gray-600" onClick={closeModal}>
                                <FaTimes size={20}/>
                            </button>
                            <h4 className="text-xl font-semibold mb-2">Full Text</h4>
                            <p>{section.full_text}</p>
                        </div>
                    </Modal>

                    {section.figures.length > 0 && (
                        <div className="mb-4">
                            <strong>Figures:</strong>
                            <div className="flex flex-wrap">
                                {section.figures.map(fig => <FigureCard key={fig.title} figure={fig}/>)}
                            </div>
                        </div>
                    )}

                    {section.references.length > 0 && (
                        <div className="mb-4">
                            <strong>References: <FaEdit className="cursor-pointer inline ml-5"
                                                        onClick={() => handleFeedbackToggle('references')}/></strong>
                            <FeedbackComponent className="my-2" field="references" isOpen={isFeedbackOpen.references}
                                               object={section}
                                               onToogleFeedback={handleFeedbackToggle}></FeedbackComponent>

                            {section.references.map((ref, i) => (
                                <ReferenceCard key={ref.source_id.concat('_', i)} reference={ref} sources={sources}/>
                            ))}

                        </div>
                    )}

                </>
            )}

            <div className="mt-4 ml-6 border-l-4 border-tertiary pl-4">
                {isOpen && (
                    <>
                        <strong>
                            Subsections: {!section.subsections.length && ("(none)")}
                            <FaEdit className="cursor-pointer inline ml-5"
                                    onClick={() => handleFeedbackToggle('subsections')}/>
                        </strong>

                        <FeedbackComponent className="my-2" field="subsections" isOpen={isFeedbackOpen.subsections}
                                           object={section} onToogleFeedback={handleFeedbackToggle}></FeedbackComponent>
                    </>

                )}
                {section.subsections.map((sub, subIndex) => (
                    <SectionCard key={sub.title} section={sub} sources={sources} parentId={sectionId}
                                 index={subIndex}/>
                ))}

            </div>

        </div>
    );
};

export default SectionCard;
