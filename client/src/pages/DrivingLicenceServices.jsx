import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import axios from 'axios';
import { ArrowLeft, ArrowRight, FileText, Smartphone, RefreshCw, Copy, Download, Globe, MapPin, CheckCircle2, CreditCard, RotateCw, Map, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ConsumerLogin from '../components/ConsumerLogin';
import fourWheelerImage from '../assets/Gemini_Generated_Image_i7i9tbi7i9tbi7i9.png'; // Reusing as 4W image
import dlImage from '../assets/home_dl.png';
import twoWheelerImage from '../assets/2 wheeler image.png';
import mixedVehiclesImage from '../assets/mixed_vehicles.png';

// Icon Map
const ICON_MAP = {
    'RotateCw': RotateCw,
    'MapPin': MapPin,
    'Smartphone': Smartphone,
    'Copy': Copy,
    'Download': Download,
    'Globe': Globe,
    'Map': Map
};

const DrivingLicenceServices = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [isProceeding, setIsProceeding] = useState(false);
    const [formData, setFormData] = useState({
        dlNumber: '',
        licenceIssuedFrom: '',
        licenceClass: '', // 2W, 4W, or Both
        serviceSelected: '',
        serviceDescription: '',
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
                // Filter only Driving Licence category
                const dlServices = res.data.filter(s => s.category === 'Driving Licence');
                setServicesList(dlServices);
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
    const handleBack = () => setStep(prev => prev - 1);

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleClassSelect = (selectedClass) => {
        updateFormData('licenceClass', selectedClass);
        handleNext();
    };

    const handleServiceSelect = (service) => {
        updateFormData('serviceSelected', service.title);
        updateFormData('price', service.price);
        handleNext();
    };

    const handleSubmit = async () => {
        // if (confirm("Proceed to Payment?")) {
        // Ensure we have a valid phone number
        const customerPhone = user?.phone || '9999999999';
        const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

        const bookingPayload = {
            serviceType: 'Driving Licence',
            licenceClass: formData.licenceClass,
            licenceIssuedFrom: formData.licenceIssuedFrom,
            serviceSelected: formData.serviceSelected,
            serviceDescription: formData.serviceDescription,
            price: formData.price,
            customerPhone: customerPhone,
            customerName: user?.name || 'Guest'
        };

        try {
            // Try API First
            const res = await axios.post(`${apiUrl}/api/bookings`, bookingPayload);
            // alert(`Payment Successful! Booking ID: ${res.data.bookingId}`);
            navigate('/booking-success', {
                state: {
                    bookingId: res.data.bookingId,
                    vehicleNo: formData.licenceClass, // Using Class as proxy for vehicle no in success screen
                    bookingData: { ...res.data, licenceClass: formData.licenceClass, serviceSelected: 'Driving Licence' }
                }
            });
        } catch (error) {
            console.warn("API Booking Failed, using Demo Mode", error);

            // Fallback to Demo Mode
            try {
                const bookingId = `DL-${Date.now().toString().slice(-6)}`;

                // Create Mock Booking Object
                const newBooking = {
                    id: Date.now().toString(),
                    bookingId: bookingId,
                    serviceSelected: formData.serviceSelected,
                    licenceClass: formData.licenceClass,
                    licenceIssuedFrom: formData.licenceIssuedFrom,
                    serviceDescription: formData.serviceDescription,
                    price: formData.price,
                    status: 'Confirmation Fee Paid',
                    feasibilityStatus: 'Pending',
                    createdAt: new Date().toISOString(),
                    customerPhone: customerPhone,
                    customerName: user?.name || 'Guest'
                };

                // Save to LocalStorage for Demo persistence
                const existingBookings = JSON.parse(localStorage.getItem('demo_bookings') || '[]');
                existingBookings.push(newBooking);
                localStorage.setItem('demo_bookings', JSON.stringify(existingBookings));

                // alert(`Payment Successful (Demo)! Booking ID: ${bookingId}`);
                navigate('/booking-success', {
                    state: {
                        bookingId: bookingId,
                        vehicleNo: formData.licenceClass,
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
                    const totalSteps = 4;
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

                {/* Step 1: Licence Class Selection */}
                {step === 1 && (
                    <div className="flex flex-col flex-grow relative animate-fade-in">
                        {/* Header */}
                        <div className="flex items-center justify-center relative mb-6 min-h-[40px]">
                            <button onClick={() => navigate('/')} className="absolute left-0 p-2 rounded-full hover:bg-gray-100 -ml-2">
                                <ArrowLeft className="w-6 h-6 text-gray-600" />
                            </button>
                            <span className="text-xl font-semibold text-gray-500">VahanPe</span>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-serif text-gray-800 leading-tight">Select your<br />Licence Class</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* 2 Wheeler */}
                            <div
                                onClick={() => handleClassSelect('2W')}
                                className="border border-gray-200 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:border-primary hover:shadow-md transition-all h-[180px]"
                            >
                                <img src={twoWheelerImage} alt="2 Wheeler" className="h-24 object-contain mb-4" />
                                <span className="font-semibold text-gray-700">2 Wheeler</span>
                            </div>

                            {/* 4 Wheeler */}
                            <div
                                onClick={() => handleClassSelect('4W')}
                                className="border border-gray-200 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:border-primary hover:shadow-md transition-all h-[180px]"
                            >
                                <img src={fourWheelerImage} alt="4 Wheeler" className="h-24 object-contain mb-4" />
                                <span className="font-semibold text-gray-700">4 Wheeler</span>
                            </div>

                            {/* 2W + 4W */}
                            <div
                                onClick={() => handleClassSelect('2W + 4W')}
                                className="border border-gray-200 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:border-primary hover:shadow-md transition-all h-[180px]"
                            >
                                <img src={mixedVehiclesImage} alt="Both" className="h-24 object-contain mb-4" />
                                <span className="font-semibold text-gray-700">2W + 4W</span>
                            </div>
                        </div>
                    </div>
                )}


                {/* Step 2: DL Number Input (Previously Step 1) */}
                {step === 2 && (
                    <div className="flex flex-col flex-grow relative animate-fade-in">
                        {/* Header */}
                        <div className="flex items-center justify-center relative mb-6 min-h-[40px]">
                            <button onClick={handleBack} className="absolute left-0 p-2 rounded-full hover:bg-gray-100 -ml-2">
                                <ArrowLeft className="w-6 h-6 text-gray-600" />
                            </button>
                            <span className="text-xl font-semibold text-gray-500">VahanPe</span>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-serif text-gray-800 leading-tight">Search with your<br />Driving Licence number</h2>
                        </div>

                        {/* DL Number Input - Compact */}
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden mb-6 shadow-sm mx-6 h-12">
                            <div className="bg-blue-600 w-10 h-full flex flex-col items-center justify-center text-white shrink-0">
                                <div className="w-4 h-4 border-[1.5px] border-white rounded-full border-dashed animate-spin-slow mb-0.5 opacity-60"></div>
                                <span className="text-[8px] font-bold tracking-wider">IND</span>
                            </div>
                            <input
                                type="text"
                                placeholder="KA01 20240001234"
                                value={formData.dlNumber}
                                onChange={(e) => updateFormData('dlNumber', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                className="w-full h-full px-4 text-lg font-medium text-gray-700 bg-white placeholder-gray-300 uppercase outline-none font-mono tracking-wide"
                                maxLength={16}
                            />
                        </div>

                        {/* Proceed Button - Compact */}
                        <button
                            disabled={!formData.dlNumber || formData.dlNumber.length < 6 || isProceeding}
                            onClick={() => {
                                setIsProceeding(true);
                                // Simulate API call or processing time
                                setTimeout(() => {
                                    // Determine licenceIssuedFrom based on DL number prefix
                                    const dlPrefix = formData.dlNumber.substring(0, 2);
                                    if (dlPrefix === 'KA') {
                                        updateFormData('licenceIssuedFrom', 'Bangalore / Karnataka');
                                    } else {
                                        updateFormData('licenceIssuedFrom', `Other State - ${dlPrefix}`);
                                    }
                                    setStep(3); // Go to Step 3
                                    setIsProceeding(false);
                                }, 500);
                            }}
                            className="mx-6 bg-gray-100 text-gray-400 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[active=true]:shadow-md"
                            data-active={formData.dlNumber && formData.dlNumber.length >= 6 ? "true" : "false"}
                        >
                            {isProceeding ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                                </>
                            ) : (
                                <>
                                    Proceed <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        {/* Bottom Illustration - Centered */}
                        <div className="mt-8 flex justify-center pb-6">
                            <img src={dlImage} alt="DL Services" className="w-64 object-contain opacity-100" />
                        </div>
                    </div>
                )}

                {/* Step 3: Service Selection (Previously Step 2) */}
                {
                    step === 3 && (
                        <div className="flex flex-col flex-grow animate-fade-in">
                            <div className="flex items-center justify-center relative mb-6 min-h-[40px]">
                                <button onClick={handleBack} className="absolute left-0 p-2 rounded-full hover:bg-gray-100 -ml-2">
                                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                                </button>
                                <span className="text-xl font-semibold text-gray-500">VahanPe</span>
                            </div>

                            {/* DL Image Step 3 with Overlapping Greeting */}
                            <div className="w-full flex flex-col items-center justify-center mb-8 mt-2 relative">
                                {user && (
                                    <div className="absolute top-0 left-4 animate-fade-in z-10 max-w-[45%]">
                                        <span className="text-gray-500 text-sm md:text-lg font-medium">Hello,</span>
                                        <span className="text-gray-800 text-lg md:text-xl font-bold block truncate" title={user.name}>{user.name || 'User'}</span>
                                    </div>
                                )}
                                <img
                                    src={dlImage}
                                    alt="DL"
                                    className="w-64 md:w-72 object-contain mb-6"
                                />

                                {/* DL Number Card */}
                                <div className="flex items-stretch bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden w-64">
                                    <div className="bg-orange-500 w-16 flex flex-col items-center justify-center py-2 px-1 relative">
                                        <span className="text-white text-[10px] font-bold tracking-widest leading-none">DL</span>
                                    </div>
                                    <div className="flex-grow flex items-center justify-center px-4 bg-white">
                                        <span className="text-lg font-bold text-gray-900 font-mono tracking-widest uppercase">
                                            {formData.dlNumber}
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
                                        const isKA = formData.licenceIssuedFrom.includes('Bangalore') || formData.dlNumber.startsWith('KA');
                                        return isKA ? service.type === 'KA' : service.type === 'NON_KA';
                                    }).map((service) => {
                                        const Icon = ICON_MAP[service.iconName] || FileText;
                                        return (
                                            <div
                                                key={service.id}
                                                onClick={() => { handleServiceSelect(service); }}
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

                {/* Step 4: Payment (Previously Step 3) */}
                {
                    step === 4 && (
                        <div className="flex flex-col flex-grow animate-fade-in">
                            {/* Header */}
                            <div className="flex items-center justify-center relative mb-6 min-h-[40px]">
                                <button onClick={handleBack} className="absolute left-0 p-2 rounded-full hover:bg-gray-100 -ml-2">
                                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                                </button>
                                <span className="text-xl font-semibold text-gray-500">VahanPe</span>
                            </div>

                            <h2 className="text-3xl font-serif text-gray-700 mb-8 pl-2">Payment</h2>

                            {/* DL Summary */}
                            <div className="flex flex-col md:flex-row items-center md:items-end md:justify-between mb-8 relative min-h-[150px] md:min-h-0">
                                {/* Large DL Image */}
                                <img
                                    src={dlImage}
                                    alt="DL"
                                    className="w-40 md:w-56 h-auto object-contain mb-4 md:mb-0 md:absolute md:right-[-20px] md:bottom-[-10px] self-end md:self-auto z-0 opacity-80"
                                />

                                {/* DL Number Card */}
                                <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm h-12 z-10 w-full md:w-auto">
                                    <div className="bg-orange-500 w-10 h-full flex flex-col items-center justify-center text-white shrink-0">
                                        <span className="text-[8px] font-bold tracking-wider">DL</span>
                                    </div>
                                    <div className="px-4 text-lg font-medium text-gray-700 font-mono tracking-wide uppercase flex-grow md:flex-grow-0">
                                        {formData.dlNumber}
                                    </div>
                                </div>
                            </div>

                            {/* Order Item */}
                            <div className="bg-white rounded-xl mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <FileText className="w-5 h-5 text-gray-700" />
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

export default DrivingLicenceServices;
