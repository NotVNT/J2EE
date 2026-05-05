const InfoCard = ({icon, label, value, color, onClick}) => {
    return(
        <div onClick={onClick} className="bg-white p-6 rounded-[1.5rem] shadow-[0_2px_10px_0_rgba(25,28,30,0.02)] border border-[#E5E7EB]/50 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer">
            <div className={`w-12 h-12 flex items-center justify-center ${color} rounded-[1rem]`}>
                {icon}
            </div>
            <div>
                <p className="text-[11px] text-[#191c1e]/50 font-medium uppercase tracking-widest mb-2">{label}</p>
                <div className="flex items-center justify-between">
                    <p className="text-[22px] text-[#191c1e] font-semibold tracking-tighter leading-none">{value}</p>
                </div>
            </div>
        </div>
    )
}

export default InfoCard;