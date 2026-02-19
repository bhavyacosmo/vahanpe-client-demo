import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, CheckCircle2 } from 'lucide-react';
import statusCar from '../assets/Gemini_Generated_Image_i7i9tbi7i9tbi7i9.png';
import bikeImage from '../assets/mixed_vehicles.png';
import twoWheelerImage from '../assets/2 wheeler image.png';

const BookingSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { bookingId, vehicleNo, bookingData } = location.state || {}; // Expecting data passed via state

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleViewStatus = () => {
        // Navigate to details page (to be created) or my-services
        if (bookingId) {
            navigate(`/booking-status/${bookingId}`, {
                state: {
                    vehicleNo,
                    bookingData
                }
            });
        } else {
            navigate('/my-services');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 px-6 pb-20">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Successful!</h1>
            <p className="text-center text-gray-500 mb-8 max-w-xs">
                Your <span className="font-semibold">{bookingData?.serviceSelected || 'Service'}</span> booking for <span className="text-gray-800 font-medium">{vehicleNo}</span> has been created successfully.
            </p>

            {/* Car/Bike Image Area */}
            <div className="w-full max-w-sm mb-6 flex justify-center">
                <img
                    src={bookingData?.vehicleType === '2W' || bookingData?.licenceClass === '2W' ? twoWheelerImage : statusCar}
                    alt="Vehicle"
                    className="w-full object-contain h-40"
                />
            </div>

            {/* Booking ID */}
            <div className="bg-gray-100 px-6 py-3 rounded-xl mb-10">
                <span className="text-gray-500 text-sm">Booking ID</span>
                <div className="text-xl font-bold text-gray-800">{bookingId || 'VHNP3655KYA'}</div>
            </div>

            {/* What's Next Timeline */}
            <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">What's next?</h3>

                <div className="relative pl-6 border-l-2 border-gray-100 space-y-8">
                    {/* Step 1 */}
                    <div className="relative">
                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-green-600 border-4 border-white shadow-sm"></div>
                        <h4 className="font-bold text-gray-800">Booking Initiated</h4>
                        <p className="text-gray-500 text-sm mt-1">Your booking has been successfully placed.</p>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-white border-4 border-gray-200"></div>
                        <h4 className="font-bold text-gray-400">Documents Uploaded</h4>
                        <p className="text-gray-400 text-sm mt-1">We are awaiting document upload from your end.</p>
                    </div>
                </div>
            </div>

            {/* View Status Button */}
            <button
                onClick={handleViewStatus}
                className="w-full max-w-md bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-colors"
            >
                View Status
            </button>

        </div>
    );
};

export default BookingSuccess;
