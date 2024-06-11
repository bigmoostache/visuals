import React, {useState} from 'react';
import {usePlan} from "@/app/(pages)/plan/context/PlanContext";
import {FaSave} from "react-icons/fa";


interface FeedbackComponentProps {
    field: string,
    isOpen: boolean,
    object: any,
    onToogleFeedback: (a: string) => void,
    className?:string
}

const FeedbackComponent: React.FC<FeedbackComponentProps> = ({field, isOpen, onToogleFeedback, object, className}) => {
    const {updateFeedback} = usePlan();
    const [feedback, setFeedback] = useState(object[`${field}_feedback`]||'');
    const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFeedback(e.target.value);
    };

    let feedbackValue = object[`${field}_feedback`]

    const saveFeedback = () => {
        onToogleFeedback(field);

        object[`${field}_feedback`] = feedback
        feedbackValue = feedback

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

                        <FaSave onClick={() => saveFeedback()} className="text-primary cursor-pointer  mx-5 text-3xl"/>
                    </div>
                </div>
            ) : (feedbackValue && !isOpen) ?
                (<div className="text-sm text-red-600 mb-2">
                    <span className="capitalize">{field} Feedback: </span>
                    {feedbackValue}</div>) : null
            }
        </div>
    );
};

export default FeedbackComponent;
