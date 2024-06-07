import { useState } from 'react';
import Modal from 'react-modal';

const FigureCard: React.FC<Figure> = ({
                                          title,
                                          comment,
                                          source_id,
                                          source_is_internal,
                                          contents,
                                          user_feedback,
                                      }) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const imageUrl = (source_is_internal && contents) ?
        `data:image/jpeg;base64,${contents?.substring(11)}` : 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=500&h=500&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' //source_id;

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    return (
        <div className="p-2 bg-gray-100 rounded-md mb-2">
            <div className="cursor-pointer" onClick={openModal}>
                <h4 className="font-semibold">{title}</h4>
                <img src={imageUrl} alt={title} className="w-24 h-24 object-cover"/>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Figure Details"
                className="fixed inset-0 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <div className="bg-white p-6 rounded-lg w-full max-w-md mx-auto">
                    <button className="text-right mb-4" onClick={closeModal}>Close</button>
                    <h4 className="text-xl font-semibold mb-2">{title}</h4>
                    <img src={imageUrl} alt={title} className="w-full h-auto mb-2"/>
                    <p><strong>Comment:</strong> {comment}</p>
                    {user_feedback && <p><strong>User Feedback:</strong> {user_feedback}</p>}
                </div>
            </Modal>
        </div>
    );
};

export default FigureCard;
