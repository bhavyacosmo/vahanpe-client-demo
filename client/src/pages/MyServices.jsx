import { useEffect, useState } from 'react';
import axios from 'axios';

import { RefreshCw, Info, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { useNavigate } from 'react-router-dom';

const MyServices = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

        let allBookings = [];

        // 1. Fetch from LocalStorage (Demo Mode Data)
        try {
            const demoBookings = JSON.parse(localStorage.getItem('demo_bookings') || '[]');
            const myDemoBookings = demoBookings.filter(b => b.customerPhone === user?.phone);
            allBookings = [...myDemoBookings];
        } catch (e) {
            console.error("Error reading generic demo bookings", e);
        }

        // 2. Fetch from API
        try {
            if (user?.phone) {
                const response = await axios.get(`${apiUrl}/api/bookings/user/${user.phone}`);
                const apiBookings = response.data;
                allBookings = [...allBookings, ...apiBookings];
            }
        } catch (error) {
            console.warn("API Fetch Failed - showing only local bookings", error);
        }

        // 3. Set State
        if (allBookings.length > 0) {
            // Sort by Date DESC
            allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setBookings(allBookings);
        } else {
            // Fallback Mock data ONLY if strictly nothing else exists
            // (removing the forced mock data to avoid confusion, showing empty state is better if truly empty)
            setBookings([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        // Use setTimeout to override browser default scroll restoration on mobile
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
        fetchBookings();
    }, []);

    return (
        <div className="w-full max-w-lg md:max-w-3xl mx-auto px-4 pb-24 pt-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Services</h1>
                <button onClick={fetchBookings} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full transition-colors">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4 opacity-50" />
                    Loading your services...
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 px-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No services yet</h3>
                    <p className="mt-2 text-sm text-gray-500">Book a service to see it here.</p>
                </div>
            ) : (
                <div className="space-y-6 md:space-y-8">
                    {bookings.map((booking) => {
                        // Logic for Mobile View Badges
                        const isCompleted = booking.status === 'Completed';
                        const isCancelled = booking.status === 'Cancelled' || booking.status === 'Not Doable';

                        let statusColor = 'bg-blue-50 text-blue-700 border-blue-100';
                        if (isCompleted) statusColor = 'bg-green-50 text-green-700 border-green-100';
                        if (isCancelled) statusColor = 'bg-red-50 text-red-700 border-red-100';

                        return (
                            <div key={booking.id}>
                                {/* --- MOBILE VIEW (New Design) --- */}
                                <div
                                    onClick={() => navigate(`/booking-status/${booking.bookingId}`, { state: { bookingData: booking } })}
                                    className="md:hidden bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all relative overflow-hidden group"
                                >
                                    {/* Status and ID Row */}
                                    <div className="flex justify-between items-start mb-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${statusColor}`}>
                                            {booking.status || 'Active'}
                                        </span>
                                        <div className="text-right">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">BOOKING ID</span>
                                            <span className="text-sm font-bold text-gray-900 font-mono tracking-wide">{booking.bookingId}</span>
                                        </div>
                                    </div>

                                    {/* Service Details */}
                                    <div className="mb-8">
                                        <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2 pr-4">{booking.serviceSelected}</h2>
                                        <p className="text-sm text-gray-500 font-medium">
                                            {booking.vehicleType ? `${booking.vehicleType} • ${booking.registrationNumber}` : `Licence • ${booking.licenceClass}`}
                                        </p>
                                    </div>

                                    {/* Date and Price */}
                                    <div className="flex justify-between items-end border-t border-gray-50 pt-6">
                                        <div>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">DATE OF REGISTRATION</span>
                                            <span className="text-base font-bold text-gray-900 block">
                                                {new Date(booking.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="text-4xl font-black text-blue-600 tracking-tighter">
                                            ₹{booking.price}
                                        </div>
                                    </div>

                                    {/* Disclaimer Box (RED for Mobile) */}
                                    <div className="mt-6 bg-red-50 p-4 rounded-2xl flex items-start gap-3 border border-red-100">
                                        <Info className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                        <p className="text-xs text-red-600 italic leading-relaxed">
                                            Disclaimer: Once our services move to the processing stage, it may take approx 15-30 days to complete.
                                        </p>
                                    </div>

                                    {/* WhatsApp Log */}
                                    {booking.last_whatsapp_status_sent && (
                                        <div className="mt-4 flex items-center gap-2 text-[10px] text-green-600 bg-green-50 px-3 py-2 rounded-lg justify-center font-bold uppercase tracking-wide">
                                            <CheckCircle2 className="w-3 h-3" /> WhatsApp Update Sent
                                        </div>
                                    )}
                                </div>

                                {/* --- DESKTOP VIEW (Reverted to Old Design) --- */}
                                <div
                                    onClick={() => navigate(`/booking-status/${booking.bookingId}`, { state: { bookingData: booking } })}
                                    className="hidden md:block bg-white p-8 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    {/* Header */}
                                    <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-gray-100 pb-4 mb-6">
                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">Booking ID: <span className="font-mono text-gray-800 font-bold">{booking.bookingId}</span></div>
                                            <h2 className="text-2xl font-bold text-gray-800">{booking.serviceSelected}</h2>
                                            <p className="text-sm text-gray-500">
                                                {booking.vehicleType ? `${booking.vehicleType} • ${booking.registrationNumber}` : `Licence • ${booking.licenceClass}`}
                                            </p>
                                        </div>
                                        <div className="mt-4 md:mt-0 text-right">
                                            <div className="text-3xl font-bold text-blue-600">₹{booking.price}</div>
                                            <div className="text-xs text-gray-400">{new Date(booking.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>

                                    {/* Status: Not Doable / Refund */}
                                    {booking.feasibilityStatus === 'Not Doable' && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4 flex items-start gap-3">
                                            <div className="w-5 h-5 shrink-0 mt-0.5 flex items-center justify-center rounded-full bg-red-100">!</div>
                                            <div>
                                                <h3 className="font-bold text-sm">Service Not Doable & Refund Initiated</h3>
                                                <p className="text-xs mt-1">Our team checked feasibility and found this service cannot be processed. A full refund has been initiated.</p>
                                                {booking.adminComment && (
                                                    <p className="text-xs mt-2 italic border-t border-red-200 pt-2 text-red-800">
                                                        <span className="font-semibold">Team Note:</span> {booking.adminComment}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Disclaimer (Red for Desktop as requested) */}
                                    <p className="text-red-600 text-sm mt-4 font-semibold">
                                        Disclaimer : once our services moves to the processing stage , it may take approx 15-30 days to complete
                                    </p>

                                    {/* WhatsApp Log */}
                                    {booking.last_whatsapp_status_sent && (
                                        <div className="mt-6 bg-green-50 p-3 rounded-lg border border-green-100 text-sm text-green-800 flex items-center gap-2">
                                            <span>📱 Latest WhatsApp Update Sent: <b>{booking.last_whatsapp_status_sent}</b></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default MyServices;
