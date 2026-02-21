import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import geminiVehicles from '../assets/Gemini_Generated_Image_i7i9tbi7i9tbi7i9.png';
import twoWheelerImage from '../assets/2 wheeler image.png';

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [booking, setBooking] = useState(null);
    const [timeline, setTimeline] = useState([]);

    const getTimelineForService = (serviceName, currentStatus) => {
        // Status Order mapping
        const statusOrder = [
            'Confirmation Fee Paid',
            'Service Booked',
            'Documents Picked Up',
            'Processing',
            'Delivered' // or 'Service Completed' logic
        ];

        // Determine current step index (0-based)
        // If status is not in list (e.g. Cancelled), handle gracefully
        let stepIndex = statusOrder.indexOf(currentStatus);
        if (stepIndex === -1) stepIndex = 0; // Default to first step if unknown

        // Define the steps dynamically
        // We can map Admin Status to explicit Timeline Titles if needed
        const steps = [
            {
                title: 'Confirmation Fees Paid',
                desc: 'Your booking has been confirmed',
                time: 'Today • 10:45 AM', // Ideally dynamic
                active: stepIndex >= 0,
                completed: stepIndex > 0
            },
            {
                title: 'Documents Picked Up',
                desc: 'Agent has collected your documents',
                time: 'TBD',
                active: stepIndex >= 2, // 'Documents Picked Up' is index 2
                completed: stepIndex > 2
            },
            {
                title: 'Processing',
                desc: 'Your application is being processed at RTO',
                time: 'Expected by Apr 25',
                active: stepIndex >= 3,
                completed: stepIndex > 3
            },
            {
                title: serviceName?.includes('Transfer') ? 'Ownership Transferred' :
                    serviceName?.includes('Hypothecation') ? 'Hypothecation Removed' :
                        serviceName?.includes('Renewal') ? 'DL Renewed' :
                            'Service Completed',
                desc: 'Process completed successfully',
                time: 'TBD',
                active: stepIndex >= 4,
                completed: stepIndex >= 4
            }
        ];

        return steps;
    };

    useEffect(() => {
        // Fetch booking details
        // Prioritize passed state, else mock/fetch
        let currentService = 'Service';
        if (location.state?.bookingData) {
            setBooking({
                id: location.state.bookingData.bookingId || id,
                vehicleNo: location.state.vehicleNo || location.state.bookingData.registrationNumber,
                serviceSelected: location.state.bookingData.serviceSelected,
                vehicleType: location.state.bookingData.vehicleType || (location.state.bookingData.licenceClass === '2W' ? '2W' : '4W'),
                licenceClass: location.state.bookingData.licenceClass
            });
            currentService = location.state.bookingData.serviceSelected;
        } else if (location.state?.vehicleNo) {
            setBooking({ id: id, vehicleNo: location.state.vehicleNo });
        } else {
            // Fallback (or fetch from API using ID)
            setBooking({ id: id || 'VHNP3655KYA', vehicleNo: '' });
        }

        // Determine status from location state or default
        const status = location.state?.bookingData?.status || 'Confirmation Fee Paid';
        setTimeline(getTimelineForService(currentService, status));

    }, [id, location.state]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-8 px-6 pb-20">
            {/* Header */}
            <div className="w-full max-w-md flex items-center mb-8 relative">
                <button onClick={() => navigate(-1)} className="absolute left-0 p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            <div className="w-full max-w-md">
                <h1 className="text-3xl font-serif text-gray-800 mb-4 pl-2">Booking Status</h1>

                {/* DL Category Display */}
                {booking?.licenceClass && (
                    <div className="text-blue-600 font-bold text-xl mb-6 pl-2 mt-4">
                        {booking.licenceClass}
                    </div>
                )}

                {/* Vehicle & Status Summary */}
                <div className="flex items-end justify-between mb-4 relative h-48">
                    <div className="flex flex-col z-10 self-center mb-4">
                        {/* Number Plate Block - Only for Vehicle Services */}
                        {!booking?.licenceClass && (
                            <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm h-12">
                                <div className="bg-blue-600 w-10 h-full flex flex-col items-center justify-center text-white shrink-0">
                                    <div className="w-3 h-3 border-[1.5px] border-white rounded-full border-dashed animate-spin-slow mb-0.5 opacity-60"></div>
                                    <span className="text-[8px] font-bold tracking-wider">IND</span>
                                </div>
                                <div className="px-4 text-lg font-medium text-gray-700 font-mono tracking-wide uppercase">
                                    {booking?.vehicleNo || 'AB 12 CD 3456'}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Large Vehicle Image */}
                    <img
                        src={booking?.vehicleType === '2W' ? twoWheelerImage : geminiVehicles}
                        alt="Vehicle"
                        className={`absolute bottom-0 h-auto object-contain transition-all duration-300
                            ${booking?.licenceClass
                                ? 'w-72 md:w-96 right-[-40px] md:right-[-30px]' // DL Service: Larger, more aggressive
                                : 'w-48 md:w-80 right-[-10px] md:right-[-20px]' // Vehicle Service: Smaller to avoid overlap
                            }
                        `}
                    />
                </div>

                {/* Booking ID */}
                <div className="bg-white px-6 py-4 rounded-xl mb-8 border border-gray-100 shadow-sm flex items-center justify-between">
                    <span className="text-gray-400 text-sm font-medium">Booking ID</span>
                    <span className="font-bold text-gray-800 tracking-wide">{booking?.id}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-4">Track your status</h3>

                {/* Detailed Timeline */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                    <div className="relative pl-6 border-l-2 border-gray-100 space-y-10">
                        {timeline.map((step, index) => (
                            <div key={index} className="relative">
                                {/* Dot */}
                                <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${step.completed ? 'bg-green-500' : (step.active ? 'bg-yellow-400' : 'bg-gray-100 border-gray-50')}`}></div>

                                <h4 className={`font-bold ${step.completed || step.active ? 'text-gray-800' : 'text-gray-400'}`}>{step.title}</h4>
                                <p className={`text-sm mt-1 ${step.completed || step.active ? 'text-gray-500' : 'text-gray-300'}`}>{step.desc}</p>
                                <p className={`text-xs mt-1 ${step.completed || step.active ? 'text-gray-400' : 'text-gray-200'}`}>{step.time}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BookingDetails;
