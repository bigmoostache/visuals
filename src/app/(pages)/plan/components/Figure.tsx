import React, { useState } from 'react';
import Modal from 'react-modal';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import FeedbackComponent from "@/app/(pages)/plan/components/Feedback";


interface FigureCardProps {
    figure:Figure
}

const FigureCard: React.FC<FigureCardProps> = ({
                                                   figure,
                                               }) => {

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isEditingFeedback, setIsEditingFeedback] = useState(false);
    const imageUrl = (figure.source_is_internal && figure.contents) ?
        `data:image/jpeg;base64,${figure.contents?.substring(11)}` : 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=500&h=500&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Placeholder image

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const toggleFeedbackEdit = () => {
        setIsEditingFeedback(!isEditingFeedback);
    };


    return (
        <div className="p-2 bg-gray-100 rounded-md mb-2 shadow-sm mr-4 w-40 flex flex-col items-center">
            <div className="cursor-pointer contents" onClick={openModal}>
                <img src={imageUrl} alt={figure.title} className="w-9/12 h-auto object-cover rounded-md mx-auto"/>
                <h4 className="text-sm font-light text-center mt-2 truncate w-full overflow-hidden whitespace-nowrap text-overflow-ellipsis">{figure.title}</h4>
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
                    <h4 className="text-xl font-semibold mb-2 text-center">{figure.title}</h4>
                    <img src={imageUrl} alt={figure.title} className="w-full h-auto mb-2 rounded-md"/>

                    <div className="flex items-center mb-2">
                        <strong className="mr-2">Comment:</strong>
                        <FaEdit className="cursor-pointer text-gray-600" onClick={toggleFeedbackEdit} />
                    </div>
                    <p>{figure.comment}</p>

                    <FeedbackComponent className="my-2" field="user" isOpen={isEditingFeedback}
                                       object={figure} onToogleFeedback={toggleFeedbackEdit}></FeedbackComponent>
                </div>
            </Modal>
        </div>
    );
};

export default FigureCard;
