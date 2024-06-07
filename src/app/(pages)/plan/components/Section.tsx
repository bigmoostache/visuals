import React, {useState} from 'react';
import Modal from 'react-modal';
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

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const toggleSection = () => {
        setIsOpen(!isOpen);
    };

    const truncatedFullText = (full_text?.length || 0) > 500 ? `${full_text?.substring(0, 500)}...` : full_text;
    const sectionId = parentId ? `${parentId}.${index + 1}` : `${index + 1}`;

    return (
        <div className="p-4 bg-white shadow-md rounded-md mb-4 w-full">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold mb-2">{sectionId} - {title}</h3>
                <button onClick={toggleSection} className="text-blue-500 underline">
                    {isOpen ? 'Close' : 'Open'}
                </button>
            </div>
            {isOpen && (
                <>
                    {abstract && <div className="mb-2">{abstract}</div>}
                    {title_feedback &&
                        <div className="text-sm text-red-600 mb-2">Title Feedback: {title_feedback}</div>}
                    {abstract_feedback &&
                        <div className="text-sm text-red-600 mb-2">Abstract Feedback: {abstract_feedback}</div>}
                    {themes.length > 0 && (
                        <div className="mb-2">
                            <strong>Themes:</strong>
                            <ul className="ml-12 list-disc">
                                {themes.map((theme, index) => (
                                    <li key={index}>{theme}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {themes_feedback &&
                        <div className="text-sm text-red-600 mb-2">Themes Feedback: {themes_feedback}</div>}
                    {redaction_directives &&
                        <div className="mb-2"><strong>Redaction Directives:</strong> {redaction_directives}</div>}
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
                                <ReferenceCard key={ref.source_id} reference={ref} sources={sources}/>
                            ))}
                        </div>
                    )}
                    {references_feedback &&
                        <div className="text-sm text-red-600 mb-2">References Feedback: {references_feedback}</div>}
                    {subsections_feedback &&
                        <div className="text-sm text-red-600 mb-2">Subsections Feedback: {subsections_feedback}</div>}
                </>
            )}
            {subsections.length > 0 && (
                <div className="mt-4">
                    <strong>Subsections:</strong>
                    {subsections.map((sub, subIndex) => (
                        <SectionCard key={sub.title} {...sub} sources={sources} parentId={sectionId} index={subIndex}/>
                    ))}
                </div>
            )}

        </div>
    );
};

export default SectionCard;

