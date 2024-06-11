import React, { useState } from 'react';
import Modal from 'react-modal';
import FigureCard from "@/app/(pages)/plan/components/Figure";

const SourceCard: React.FC<Source> = ({ id, title, citation, figures, full_text }) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    return (
        <div id={`source-${id}`} className="p-4 border-2 border-secondary rounded-md mb-4 cursor-pointer" onClick={openModal}>
            <h3 className="text-xl font-semibold mb-2 text-primary">{title}</h3>
            <p>{citation}</p>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Source Details"
                className="fixed inset-0 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <div className="bg-white p-6 rounded-lg w-full max-w-2xl mx-auto">
                    <button className="text-right mb-4 text-primary" onClick={closeModal}>Close</button>
                    <h4 className="text-xl font-semibold mb-2">{title}</h4>
                    <div className="mb-4">
                        <strong>Figures:</strong>
                        <div className="flex flex-wrap">
                            {figures.map(fig => <FigureCard key={fig.title} {...fig} />)}
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
