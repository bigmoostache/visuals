import React, { useState } from 'react';
import Modal from 'react-modal';
import FigureCard from "@/app/(pages)/plan/components/Figure";
import {FaTimes} from "react-icons/fa";

const SourceCard: React.FC<Source> = ({ id, title, citation, figures, full_text }) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    return (
        <div id={`source-${id}`} >
            <div onClick={openModal} className="p-4 border-2 border-secondary rounded-md mb-4 cursor-pointer">
                <h3 className="text-xl font-semibold mb-2 text-primary">{title}</h3>
                <p>{citation}</p>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Source Details"
                className="fixed inset-0 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <div className="bg-white p-6 rounded-lg w-full max-w-2xl mx-auto relative">
                    <button className="absolute top-2 right-2 text-gray-600" onClick={closeModal}>
                        <FaTimes size={20}/>
                    </button>
                    <h4 className="text-xl font-semibold mb-2">{title}</h4>
                    <div className="mb-4">
                        <strong>Figures:</strong>

                        <div className="flex flex-wrap">
                            {figures.map(fig => <FigureCard key={fig.title} figure={fig}/>)}
                        </div>

                    </div>
                    <div className="mb-4">
                        <strong>Full Text:</strong>
                        <p>{full_text}</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SourceCard;
