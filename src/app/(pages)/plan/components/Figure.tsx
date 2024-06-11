// components/Figure.tsx
import { useState } from 'react';
import Modal from 'react-modal';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { usePlan } from '@/app/(pages)/plan/context/PlanContext';

interface FigureCardProps extends Figure {}

const FigureCard: React.FC<FigureCardProps> = ({
                                                   title,
                                                   comment,
                                                   source_id,
                                                   source_is_internal,
                                                   contents,
                                                   user_feedback,
                                               }) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isEditingFeedback, setIsEditingFeedback] = useState(false);
    const [feedback, setFeedback] = useState(user_feedback || '');
    const { updateFeedback } = usePlan();

    const imageUrl = (source_is_internal && contents) ?
        `data:image/jpeg;base64,${contents?.substring(11)}` : 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=500&h=500&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Placeholder image

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const toggleFeedbackEdit = () => {
        setIsEditingFeedback(!isEditingFeedback);
    };

    const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFeedback(e.target.value);
    };

    const saveFeedback = () => {
        setIsEditingFeedback(false);
        updateFeedback(source_id, feedback);
    };

    return (
        <div className="p-2 bg-gray-100 rounded-md mb-2 shadow-sm mr-4 w-40 flex flex-col items-center">
            <div className="cursor-pointer" onClick={openModal}>
                <img src={imageUrl} alt={title} className="w-9/12 h-auto object-cover rounded-md mx-auto"/>
                <h4 className="text-sm font-light text-center mt-2 truncate w-full">{title}</h4>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Figure Details"
                className="fixed inset-0 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <div className="bg-white p-6 rounded-lg w-full max-w-md mx-auto relative">
                    <button className="absolute top-2 right-2 text-gray-600" onClick={closeModal}>
                        <FaTimes size={20} />
                    </button>
                    <h4 className="text-xl font-semibold mb-2 text-center">{title}</h4>
                    <img src={imageUrl} alt={title} className="w-full h-auto mb-2 rounded-md"/>

                    <div className="flex items-center mb-2">
                        <strong className="mr-2">Comment:</strong>
                        <FaEdit className="cursor-pointer text-gray-600" onClick={toggleFeedbackEdit} />
                    </div>
                    <p>{comment}</p>

                    {isEditingFeedback && (
                        <div className="mt-2">
                            <textarea
                                value={feedback}
                                onChange={handleFeedbackChange}
                                className="w-full p-2 border rounded-md"
                                placeholder="Enter your feedback here"
                            />
                            <button onClick={saveFeedback} className="mt-2 bg-primary text-white py-1 px-2 rounded-md flex items-center">
                                <FaSave className="mr-1" /> Save
                            </button>
                        </div>
                    )}

                    {user_feedback && (
                        <p className="mt-2 text-secondary">{user_feedback}</p>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default FigureCard;
