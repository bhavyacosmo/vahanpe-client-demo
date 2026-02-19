import { useState } from 'react';
import { User, Phone, ArrowRight, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ConsumerLogin = ({ onLoginSuccess }) => {
    const { login } = useAuth();
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
            alert(`OTP Sent to ${phone}`);
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
                onLoginSuccess(res.data.user);
            }
            setLoading(false);
        } catch (error) {
            console.warn("API Failed, checking Demo OTP", error);
            if (otp.trim() === '1234') {
                setTimeout(() => {
                    const demoUser = { id: `VH-USER-${Date.now()}`, name: name, phone: phone, role: 'user' };
                    login(demoUser);
                    onLoginSuccess(demoUser);
                    setLoading(false);
                }, 1000);
            } else {
                alert('Invalid OTP. Use 1234 for Demo.');
                setLoading(false);
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-center">Login to Continue</h3>

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
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
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
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? 'Sending...' : <>Get OTP <ArrowRight className="w-4 h-4" /></>}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="text-center mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <MessageCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-sm text-gray-500">OTP sent to +91 {phone}</p>
                    </div>
                    <div className="flex justify-center">
                        <input
                            type="text"
                            autoFocus
                            maxLength={4}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-32 text-center text-2xl tracking-[0.5em] font-bold py-2 border-b-2 border-gray-300 focus:border-primary outline-none"
                            placeholder="••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-lg font-bold transition disabled:opacity-70"
                    >
                        {loading ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full text-xs text-center text-gray-500 hover:text-gray-800 underline"
                    >
                        Change Number
                    </button>
                </form>
            )}
        </div>
    );
};

export default ConsumerLogin;
