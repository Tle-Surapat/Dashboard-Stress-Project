const SubjectCard = ({ subject, color, onMoreClick }) => (
    <div className={`p-4 mb-4 rounded-lg flex justify-between items-center ${color}`}>
      <div>
        <h3 className="font-bold text-lg text-black">{subject.name}</h3>
        <p className="text-black">Age: {subject.age}</p>
        <p className="text-black">Height: {subject.height}</p>
      </div>
      <div className="flex flex-col items-center">
        <span className={`text-lg font-bold px-2 py-2 rounded-lg w-24 h-8 flex items-center justify-center ${color}`}>
          {subject.stressLevel}
        </span>
        <button
          onClick={() => onMoreClick(subject)}
          className="mt-2 bg-white text-navy font-bold px-8 py-1 rounded-lg hover:bg-yellow transition-all duration-200 text-sm"
        >
          More
        </button>
      </div>
    </div>
  );
  
  export default SubjectCard;
  