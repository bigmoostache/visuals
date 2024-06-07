
const SourceCard: React.FC<Source> = ({ id, title, citation }) => (
    <div id={`source-${id}`} className="p-4 bg-gray-100 rounded-md mb-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p>{citation}</p>
    </div>
);

export default SourceCard;
