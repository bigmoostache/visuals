import React, {useState} from 'react';
import {usePlan} from "@/app/(pages)/plan/context/PlanContext";
import {FaSave, FaTimes} from "react-icons/fa";


interface FeedbackComponentProps {
    field: string,
    isOpen: boolean,
    object: any,
    onToogleFeedback: (a: string) => void,
    className?: string
}

const FeedbackComponent: React.FC<FeedbackComponentProps> = ({field, isOpen, onToogleFeedback, object, className}) => {
    const {updateFeedback} = usePlan();
    const [feedback, setFeedback] = useState(object[`${field}_feedback`] || '');
    const [initialFeedback, setInitialFeedback] = useState(object[`${field}_feedback`] || '');
    const [isDisabled, setIsDisabled] = useState(true);
    const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const theFeedback = e.target.value
        setFeedback(theFeedback);
        setIsDisabled(initialFeedback === theFeedback || (!theFeedback && !initialFeedback))
    };

    const saveFeedback = () => {
        onToogleFeedback(field);
        object[`${field}_feedback`] = feedback
        setInitialFeedback(feedback)
        updateFeedback();
    };

    const removeFeedback = () => {
        object[`${field}_feedback`] = undefined
        setInitialFeedback('')
        setFeedback('')
        updateFeedback();
    };


    return (
        <div className={`${className} mb-2`}>

            {isOpen ? (
                <div>
                    <strong className="capitalize">{field} Feedback:</strong>
                    <div className="flex">
                    <textarea
                        value={feedback}
                        onChange={handleFeedbackChange}
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter your feedback here"
                    />

                        <FaSave
                            onClick={!isDisabled ? saveFeedback : undefined}
                            className={`text-3xl mx-5 cursor-pointer ${isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-primary'}`}
                        />
                    </div>
                </div>
            ) : (initialFeedback && !isOpen) ?
                (<div className="text-sm text-secondary mb-2">
                    <span className="capitalize">{field} Feedback: </span>
                    {initialFeedback}
                    <FaTimes className="ml-3 inline text-xs cursor-pointer" onClick={removeFeedback}></FaTimes>
                </div>) : null
            }
        </div>
    );
};

export default FeedbackComponent;
