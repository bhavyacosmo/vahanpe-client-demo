import { CheckCircle } from 'lucide-react';

const ServiceCard = ({ title, description, isSelected, onClick, price }) => {
    return (
        <div
            onClick={onClick}
            className={`relative cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 group ${isSelected
                ? 'border-primary bg-blue-50/50 shadow-lg scale-[1.02]'
                : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-xl hover:-translate-y-1'
                } backdrop-blur-sm`}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className={`font-bold text-lg ${isSelected ? 'text-primary' : 'text-gray-800 group-hover:text-primary transition-colors'}`}>
                    {title}
                </h3>
                {isSelected && <CheckCircle className="text-primary w-6 h-6 animate-bounce" />}
            </div>

            {description && <p className="text-sm text-gray-500 leading-relaxed">{description}</p>}

            {price && (
                <div className="mt-4 pt-4 border-t border-gray-100/50 flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Estimate</span>
                    <span className="font-extrabold text-xl text-gray-800 group-hover:text-primary transition-colors">₹{price}</span>
                </div>
            )}
        </div>
    );
};

export default ServiceCard;
