const SubjectCard = ({ subject, color = "bg-gray-300", onMoreClick, imageSrc }) => {
  return (
    <div className="w-full max-w-full sm:max-w-xs md:max-w-sm lg:max-w-md mx-auto rounded-xl shadow-md overflow-hidden border">
      {/* Header */}
      <div className={`flex items-center justify-between p-4 ${color}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white overflow-hidden">
            <img
              src={imageSrc}
              onError={(e) => { e.target.src = "/profiles/default.png"; }}
              alt={`${subject.name} avatar`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-base font-bold text-black text-center leading-5">
            {subject.name || "Name"}
          </p>
          <p className="text-base font-bold text-black text-center leading-5">
            {subject.surname || "Surname"}
          </p>
        </div>
        <span className="text-base font-semibold text-white">
          {subject.stressLevel ?? "Stress Level"}
        </span>
      </div>

      {/* Info Grid */}
      <div className="bg-gray-100 p-4 grid grid-cols-2 gap-y-3 text-sm text-gray-900">
        <InfoItem label="HR" value={`${subject.hr ?? "-"} BPM`} />
        <InfoItem label="Skintemp" value={`${subject.skintemp?.toFixed(1) ?? "-"} ℃`} className="pl-8" />
        <InfoItem label="Age" value={`${subject.age ?? "-"} year`} />
        <InfoItem label="Weight" value={`${subject.weight ?? "-"} kg`} className="pl-8" />

        <div className="col-span-2 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-xs">Device ID</p>
            <p className="font-medium text-base">{subject.device_id ?? "-"}</p>
          </div>
          <button
            onClick={() => onMoreClick(subject)}
            className="flex gap-1 items-center p-1 bg-green-600 rounded-full hover:bg-green-700 transition"
            aria-label="More Options"
          >
            <span className="w-2 h-2 bg-navy rounded-full"></span>
            <span className="w-2 h-2 bg-navy rounded-full"></span>
            <span className="w-2 h-2 bg-navy rounded-full"></span>
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, className = "" }) => (
  <div className={className}>
    <p className="text-gray-500 text-xs">{label}</p>
    <p className="font-medium text-base">{value}</p>
  </div>
);

export default SubjectCard;