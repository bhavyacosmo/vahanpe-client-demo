import { Check, Clock, XCircle, AlertCircle } from 'lucide-react';

const steps = [
    'Confirmation Fee Paid',
    'Service Booked',
    'Documents Picked Up',
    'Processing',
    'Delivered'
];

const StatusTimeline = ({ currentStatus, feasibilityStatus, refundStatus, refundAmount }) => {

    if (currentStatus === 'Cancelled' || currentStatus === 'Not Serviceable') {
        return (
            <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-red-700">Booking Cancelled</h3>
                <p className="text-red-600 mt-2">
                    {feasibilityStatus === 'Not Doable' ? 'Service is not feasible.' : 'Booking was cancelled.'}
                </p>
                {refundStatus === 'Processed' && (
                    <div className="mt-4 inline-block bg-white px-4 py-2 rounded-full border border-red-100 text-sm font-medium text-red-600">
                        Refund of ₹{refundAmount || 49} Processed
                    </div>
                )}
            </div>
        );
    }

    const currentIndex = steps.indexOf(currentStatus);
    const activeIndex = currentIndex === -1 ? 0 : currentIndex; // Default/Fallback

    return (
        <div className="w-full py-6">
            <div className="relative flex flex-col md:grid md:grid-cols-5 items-start md:items-center w-full">
                {/* Connector Line (Desktop) */}
                <div className="hidden md:block absolute top-5 left-[10%] w-[80%] h-1 bg-gray-200 -z-10"></div>
                <div
                    className="hidden md:block absolute top-5 left-[10%] h-1 bg-primary -z-10 transition-all duration-500"
                    style={{ width: `${(activeIndex / (steps.length - 1)) * 80}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isCompleted = index <= activeIndex;
                    const isCurrent = index === activeIndex;

                    return (
                        <div key={step} className="flex md:flex-col items-center gap-4 md:gap-2 mb-6 md:mb-0 w-full md:w-auto z-10 md:justify-self-center">
                            {/* Circle Indicator */}
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-4 transition-all shrink-0 ${isCompleted
                                ? 'bg-primary border-primary text-white'
                                : 'bg-white border-gray-200 text-gray-300'
                                }`}>
                                {index < activeIndex ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : (
                                    isCompleted ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                )}
                            </div>

                            {/* Label */}
                            <div className={`text-sm md:text-sm text-center font-medium leading-tight ${isCurrent ? 'text-primary' : 'text-gray-500'}`}>
                                {step}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default StatusTimeline;
