import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Truck, Car, CreditCard, Bike, Shield, FileText, Clock, MoreHorizontal, CheckCircle2, Smartphone, Copy, ChevronRight } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConsumerLogin from '../components/ConsumerLogin';
import statusCar from '../assets/Gemini_Generated_Image_i7i9tbi7i9tbi7i9.png';
import bikeImage from '../assets/mixed_vehicles.png';
import twoWheelerImage from '../assets/2 wheeler image.png';

// Icon Map
const ICON_MAP = {
    'Car': Car,
    'Shield': Shield,
    'FileText': FileText,
    'Smartphone': Smartphone,
    'Copy': Copy,
    'Clock': Clock,
    'Truck': Truck,
    'Bike': Bike
};

const VehicleServices = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [isProceeding, setIsProceeding] = useState(false);
    const [formData, setFormData] = useState({
        vehicleType: '', // 2W or 4W
        registrationType: '', // Karnataka or Other
        registrationNumber: '',
        serviceSelected: '',
        price: 0
    });
    const [servicesList, setServicesList] = useState([]);
    const [loadingServices, setLoadingServices] = useState(true);

    // Fetch Services on Mount
    useEffect(() => {
        const fetchServices = async () => {
            const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
            try {
                const res = await axios.get(`${apiUrl}/api/services`);
                // Filter only Vehicle category
                const vehicleServices = res.data.filter(s => s.category === 'Vehicle');
                setServicesList(vehicleServices);
            } catch (err) {
                console.error("Failed to fetch services", err);
                // Fallback to empty or toast error
            } finally {
                setLoadingServices(false);
            }
        };
        fetchServices();
    }, []);

    // Scroll to top when step changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

    const handleNext = () => setStep(prev => prev + 1);

    const handleProceedWithDelay = () => {
        setIsProceeding(true);
        setTimeout(() => {
            setStep(prev => prev + 1);
            setIsProceeding(false);
        }, 500);
    };
    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRegistrationInput = (e) => {
        const val = e.target.value.toUpperCase().replace(/\s/g, '');
        updateFormData('registrationNumber', val);
    };

    const handleServiceSelect = (service) => {
        updateFormData('serviceSelected', service.title);
        updateFormData('price', service.price);
    };

    const handleSubmit = async () => {
        // if (confirm("Proceed to Payment?")) { // Removed confirm for smoother flow or keep if needed
        // Ensure we have a valid phone number from the logged-in user
        const customerPhone = user?.phone || '9999999999';
        const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

        const bookingPayload = {
            serviceType: 'Vehicle',
            vehicleType: formData.vehicleType,
            registrationType: formData.registrationType,
            registrationNumber: formData.registrationNumber,
            serviceSelected: formData.serviceSelected,
            price: formData.price,
            customerPhone: customerPhone,
            customerName: user?.name || 'Guest'
        };

        try {
            // Try API First
            const res = await axios.post(`${apiUrl}/api/bookings`, bookingPayload);
            navigate('/booking-success', {
                state: {
                    bookingId: res.data.bookingId,
                    vehicleNo: formData.registrationNumber,
                    bookingData: { ...res.data, vehicleType: formData.vehicleType }
                }
            });
        } catch (error) {
            console.warn("API Booking Failed, using Demo Mode", error);

            // Fallback to Demo Mode
            try {
                const bookingId = `VH-${Date.now().toString().slice(-6)}`;

                // Create Mock Booking Object
                const newBooking = {
                    id: Date.now().toString(),
                    bookingId: bookingId,
                    serviceSelected: formData.serviceSelected,
                    vehicleType: formData.vehicleType,
                    registrationNumber: formData.registrationNumber,
                    registrationType: formData.registrationType,
                    price: formData.price,
                    status: 'Processing',
                    feasibilityStatus: 'Pending',
                    createdAt: new Date().toISOString(),
                    customerPhone: customerPhone,
                    customerName: user?.name || 'Guest'
                };

                // Save to LocalStorage for Demo persistence
                const existingBookings = JSON.parse(localStorage.getItem('demo_bookings') || '[]');
                existingBookings.push(newBooking);
                localStorage.setItem('demo_bookings', JSON.stringify(existingBookings));

                navigate('/booking-success', {
                    state: {
                        bookingId: bookingId,
                        vehicleNo: formData.registrationNumber,
                        bookingData: newBooking
                    }
                });
            } catch (err) {
                console.error("Demo Booking Error:", err);
                alert("Something went wrong with the demo booking.");
            }
        }
        // }
    };

    return (
        <div className="flex-grow flex items-center justify-center py-10">
            <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col min-h-[600px]">

                {/* Progress Indicator */}
                {(() => {
                    const totalSteps = 3;
                    return (
                        <div className="mb-8 flex justify-between items-center text-sm text-gray-500">
                            <span>Step {step} of {totalSteps}</span>
                            <div className="flex gap-1">
                                {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
                                    <div key={s} className={`h-2 w-8 rounded-full ${s <= step ? 'bg-primary' : 'bg-gray-200'}`} />
                                ))}
                            </div>
                        </div>
                    );
                })()}

                {step === 1 && (
                    <div className="flex flex-col flex-grow relative">
                        {/* Header */}
                        <div className="flex items-center justify-center relative mb-6 min-h-[40px]">
                            <button onClick={() => navigate('/')} className="absolute left-0 p-2 rounded-full hover:bg-gray-100 -ml-2">
                                <ArrowLeft className="w-6 h-6 text-gray-600" />
                            </button>
                            <span className="text-xl font-semibold text-gray-500">VahanPe</span>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-serif text-gray-800 leading-tight">Search with your<br />vehicle number</h2>
                        </div>

                        {/* Vehicle Type Toggle - Square Blue/White Animation */}
                        <div className="flex justify-center mb-8">
                            <div className="bg-white border border-black p-1 rounded-lg inline-flex relative shadow-sm">
                                {/* Sliding Blue Pill */}
                                <div
                                    className={`absolute top-1 bottom-1 left-1 w-32 bg-blue-600 rounded-md shadow-sm z-0 transition-all duration-300 ease-in-out ${!formData.vehicleType ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${formData.vehicleType === '4W' ? 'translate-x-[100%]' : 'translate-x-0'
                                        }`}
                                ></div>

                                {/* Buttons */}
                                <button
                                    onClick={() => updateFormData('vehicleType', '2W')}
                                    className={`w-32 py-2.5 rounded-md text-sm font-bold z-10 relative transition-colors duration-300 flex items-center justify-center gap-2 ${formData.vehicleType === '2W' ? 'text-white' : 'text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    2W 🏍️
                                </button>
                                <button
                                    onClick={() => updateFormData('vehicleType', '4W')}
                                    className={`w-32 py-2.5 rounded-md text-sm font-bold z-10 relative transition-colors duration-300 flex items-center justify-center gap-2 ${formData.vehicleType === '4W' ? 'text-white' : 'text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    4W 🚗
                                </button>
                            </div>
                        </div>

                        {/* Number Plate Input - Compact */}
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden mb-6 shadow-sm mx-6 h-12">
                            <div className="bg-blue-600 w-10 h-full flex flex-col items-center justify-center text-white shrink-0">
                                <div className="w-4 h-4 border-[1.5px] border-white rounded-full border-dashed animate-spin-slow mb-0.5 opacity-60"></div>
                                <span className="text-[8px] font-bold tracking-wider">IND</span>
                            </div>
                            <input
                                type="text"
                                placeholder="AB 12 CD 3456"
                                value={formData.registrationNumber}
                                onChange={handleRegistrationInput}
                                className="w-full h-full px-4 text-lg font-medium text-gray-700 bg-white placeholder-gray-300 uppercase outline-none font-mono tracking-wide"
                                maxLength={10}
                            />
                        </div>

                        {/* Proceed Button - Compact */}
                        <button
                            disabled={formData.registrationNumber.length < 6 || !formData.vehicleType}
                            onClick={handleProceedWithDelay}
                            className="mx-6 bg-gray-100 text-gray-400 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[active=true]:shadow-md"
                            data-active={formData.registrationNumber.length >= 6 && formData.vehicleType ? "true" : "false"}
                        >
                            Proceed <ArrowRight className="w-4 h-4" />
                        </button>

                        {/* Bottom Illustration */}
                        <div className="absolute right-[-32px] bottom-[-32px] pointer-events-none overflow-hidden rounded-br-2xl">
                            <img src={bikeImage} alt="Vehicles" className="w-[300px] md:w-[500px] object-contain" />
                        </div>
                    </div>
                )}

                {
                    step === 2 && (
                        <div className="flex flex-col flex-grow">
                            <div className="flex items-center justify-center relative mb-6 min-h-[40px]">
                                <button onClick={handleBack} className="absolute left-0 p-2 rounded-full hover:bg-gray-100 -ml-2">
                                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                                </button>
                                <span className="text-xl font-semibold text-gray-500">VahanPe</span>
                            </div>

                            {/* Car/Bike Image Step 2 with Overlapping Greeting */}
                            <div className="w-full flex flex-col items-center justify-center mb-8 mt-2 relative">
                                {user && (
                                    <div className="absolute top-0 left-4 animate-fade-in z-10 max-w-[45%]">
                                        <span className="text-gray-500 text-sm md:text-lg font-medium">Hello,</span>
                                        <span className="text-gray-800 text-lg md:text-xl font-bold block truncate" title={user.name}>{user.name || 'User'}</span>
                                    </div>
                                )}
                                <img
                                    src={formData.vehicleType === '2W' ? twoWheelerImage : statusCar}
                                    alt="Vehicle"
                                    className="w-full max-w-xs md:max-w-sm object-contain mb-6"
                                />

                                {/* HSRP Number Plate */}
                                <div className="flex items-stretch bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden w-64">
                                    <div className="bg-blue-600 w-16 flex flex-col items-center justify-center py-2 px-1 relative">
                                        <div className="w-4 h-4 rounded-full border border-blue-400 opacity-50 mb-1"></div>
                                        <span className="text-white text-[10px] font-bold tracking-widest leading-none">IND</span>
                                    </div>
                                    <div className="flex-grow flex items-center justify-center px-4 bg-white">
                                        <span className="text-2xl font-bold text-gray-900 font-mono tracking-widest uppercase">
                                            {formData.registrationNumber}
                                        </span>
                                    </div>
                                </div>
                            </div>


                            {/* Services List */}
                            <div className="space-y-4">
                                {loadingServices ? (
                                    <div className="text-center py-8 text-gray-500">Loading Services...</div>
                                ) : (
                                    servicesList.filter(service => {
                                        const isKA = formData.registrationNumber.toUpperCase().startsWith('KA');
                                        return isKA ? service.type === 'KA' : service.type === 'NON_KA';
                                    }).map((service) => {
                                        const Icon = ICON_MAP[service.iconName] || Car;
                                        return (
                                            <div
                                                key={service.id}
                                                onClick={() => { handleServiceSelect(service); handleNext(); }} // Auto advance on select
                                                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
                                            >
                                                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-2">
                                                    <div className="w-10 h-10 shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex flex-col text-left flex-1 min-w-0">
                                                        <span className="font-semibold text-gray-800 text-sm leading-tight mb-0.5">{service.title}</span>
                                                        <span className="text-xs text-gray-400 leading-snug">{service.description}</span>
                                                    </div>
                                                </div>

                                                {/* Price and Chevron */}
                                                <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0">
                                                    <span className="text-sm font-bold text-gray-900 whitespace-nowrap text-right">₹ {service.price}</span>
                                                    <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )
                }

                {
                    step === 3 && (
                        <div className="flex flex-col flex-grow">
                            {/* Header */}
                            <div className="flex items-center justify-center relative mb-6 min-h-[40px]">
                                <button onClick={handleBack} className="absolute left-0 p-2 rounded-full hover:bg-gray-100 -ml-2">
                                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                                </button>
                                <span className="text-xl font-semibold text-gray-500">VahanPe</span>
                            </div>

                            <h2 className="text-3xl font-serif text-gray-700 mb-8 pl-2">Payment</h2>

                            {/* Car Summary - New Design */}
                            <div className="flex flex-col md:flex-row items-center md:items-end md:justify-between mb-8 relative min-h-[150px] md:min-h-0">
                                {/* Large Vehicle Image - Top on Mobile */}
                                <img
                                    src={formData.vehicleType === '2W' ? twoWheelerImage : statusCar}
                                    alt="Vehicle"
                                    className="w-56 md:w-72 h-auto object-contain mb-4 md:mb-0 md:absolute md:right-[-20px] md:bottom-[-10px] self-end md:self-auto z-0"
                                />

                                {/* Number Plate Block */}
                                <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm h-12 z-10 w-full md:w-auto">
                                    <div className="bg-blue-600 w-10 h-full flex flex-col items-center justify-center text-white shrink-0">
                                        <div className="w-3 h-3 border-[1.5px] border-white rounded-full border-dashed animate-spin-slow mb-0.5 opacity-60"></div>
                                        <span className="text-[8px] font-bold tracking-wider">IND</span>
                                    </div>
                                    <div className="px-4 text-lg font-medium text-gray-700 font-mono tracking-wide uppercase flex-grow md:flex-grow-0">
                                        {formData.registrationNumber}
                                    </div>
                                </div>
                            </div>

                            {/* Order Item */}
                            <div className="bg-white rounded-xl mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Car className="w-5 h-5 text-gray-700" />
                                    <span className="font-semibold text-gray-800">{formData.serviceSelected}</span>
                                    <span className="ml-auto font-bold">₹ {formData.price}</span>
                                </div>
                                <p className="text-gray-400 text-sm ml-8">Total: ₹ {formData.price}</p>
                            </div>

                            {/* Order Breakdown */}
                            <div className="bg-gray-50 p-4 rounded-xl mb-8">
                                <h3 className="text-sm font-medium text-gray-500 mb-4">Order Summary</h3>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">Service Fee</span>
                                    <span className="font-medium">₹ {formData.price}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-2 border-b border-gray-200 pb-2">
                                    <span className="text-gray-600">Processing Fee</span>
                                    <span className="font-medium">₹ 50</span>
                                </div>
                                <div className="flex justify-between text-base pt-2">
                                    <span className="font-bold text-gray-800">Total Amount</span>
                                    <span className="font-bold text-gray-800">₹ {Number(formData.price) + 50}</span>
                                </div>
                                <p className="text-red-600 text-sm mt-3 font-semibold">
                                    Disclaimer : once our services moves to the processing stage , it may take approx 15-30 days to complete
                                </p>
                            </div>

                            {/* Payment Methods */}
                            <div className="mb-8">
                                <h3 className="text-sm font-medium text-gray-500 mb-4">Select Payment Method</h3>

                                <div className="space-y-3">
                                    <label className="flex items-center justify-between p-3 border border-primary bg-blue-50 rounded-xl cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold italic text-gray-800">UPI</span>
                                            <span className="text-xs bg-gray-200 px-1 rounded">UPI</span>
                                        </div>
                                        <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                        </div>
                                    </label>

                                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-xl opacity-60">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="w-5 h-5 text-gray-600" />
                                            <span className="font-medium text-gray-600">Debit Cards</span>
                                        </div>
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                                    </label>
                                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-xl opacity-60">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="w-5 h-5 text-gray-600" />
                                            <span className="font-medium text-gray-600">Credit Cards</span>
                                        </div>
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Pay Button */}
                            {!user ? (
                                <div className="mt-6 border-t pt-6">
                                    <ConsumerLogin onLoginSuccess={() => { }} />
                                </div>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg mb-4 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                >
                                    Pay ₹ {Number(formData.price) + 50}
                                </button>
                            )}
                        </div>
                    )
                }

            </div >
        </div >
    );
};

export default VehicleServices;
