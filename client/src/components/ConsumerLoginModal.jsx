import { useState } from 'react';
import { User, Phone, ArrowRight, MessageCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ConsumerLoginModal = ({ isOpen, onClose, redirectAfterLogin }) => {
    if (!isOpen) return null;

    const { login } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Input, 2: OTP
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!name || name.trim().length < 2) return alert("Please enter your full name");
        if (phone.length < 10) return alert("Please enter a valid phone number");

        setLoading(true);

        try {
            await axios.post(`${apiUrl}/api/auth/send-otp`, { phone });
            // alert(`OTP Sent to ${phone}`); // Optional clutter
            setStep(2);
            setLoading(false);
        } catch (error) {
            console.warn("API Failed, falling back to Demo Mode", error);
            setTimeout(() => {
                alert(`DEMO OTP: 1234 (Sent to ${phone})`);
                setStep(2);
                setLoading(false);
            }, 1000);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(`${apiUrl}/api/auth/verify-otp`, { phone, otp, name });
            if (res.data.user) {
                login(res.data.user, res.data.token);
                onClose();
                if (redirectAfterLogin) navigate(redirectAfterLogin);
            }
            setLoading(false);
        } catch (error) {
            console.warn("API Failed, checking Demo OTP", error);
            if (otp.trim() === '1234') {
                setTimeout(() => {
                    const demoUser = { id: `VH-USER-${Date.now()}`, name: name, phone: phone, role: 'user' };
                    login(demoUser);
                    onClose();
                    if (redirectAfterLogin) navigate(redirectAfterLogin);
                    setLoading(false);
                }, 1000);
            } else {
                alert('Invalid OTP. Use 1234 for Demo.');
                setLoading(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                >
                    <X className="w-6 h-6" />
                </button>

                <h3 className="text-2xl font-bold mb-1 text-center">Check Status</h3>
                <p className="text-gray-500 text-center mb-6 text-sm">Login with your mobile number to view bookings.</p>

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    required
                                    placeholder="9876543210"
                                    maxLength={10}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-70 text-lg shadow-lg shadow-blue-100"
                        >
                            {loading ? 'Sending...' : <>Get OTP <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce-short">
                                <MessageCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-sm text-gray-500">OTP has been sent to</p>
                            <p className="font-bold text-lg text-gray-800">+91 {phone}</p>
                        </div>
                        <div className="flex justify-center my-6">
                            <input
                                type="text"
                                autoFocus
                                maxLength={4}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-40 text-center text-3xl tracking-[0.5em] font-bold py-2 border-b-2 border-gray-300 focus:border-primary outline-none bg-transparent"
                                placeholder="••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition disabled:opacity-70 text-lg shadow-lg shadow-blue-100"
                        >
                            {loading ? 'Verifying...' : 'Verify & Continue'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-xs text-center text-gray-500 hover:text-gray-800 underline mt-2"
                        >
                            Entered wrong number?
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ConsumerLoginModal;
