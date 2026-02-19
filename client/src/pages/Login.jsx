import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowRight, Lock, ArrowLeft, User, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // ADMIN STATE
    const [adminId, setAdminId] = useState('');
    const [password, setPassword] = useState('');

    const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Try API First
            const res = await axios.post(`${apiUrl}/api/auth/admin/login`, { username: adminId, password });
            if (res.data.user) {
                login(res.data.user, res.data.token);
                navigate('/admin');
            }
            setLoading(false);
        } catch (error) {
            console.error("Login Failed", error);

            // DEMO MODE FALLBACK
            if (adminId === 'admin' && password === 'admin123') {
                alert("Network Error: Backend not reachable.\nLogging in as Demo Admin.");
                login({ name: 'Demo Admin', role: 'admin', token: 'demo-token' }, 'demo-token');
                navigate('/admin');
                setLoading(false);
                return;
            }

            const errorMsg = error.response?.data?.error || "Login Failed. Check console.";
            alert(errorMsg);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-50 z-0"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>

            {/* Back to Home Button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-8 left-8 text-gray-600 hover:text-primary flex items-center gap-2 transition-colors z-20 font-medium"
            >
                <ArrowLeft className="w-5 h-5" /> Back to Home
            </button>

            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10">
                <div className="bg-primary p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-full blur-2xl opacity-50 -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner border border-gray-700">
                            <Shield className="w-8 h-8 text-blue-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-1">Admin Portal</h2>
                        <p className="text-gray-400">Restricted Access Only</p>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleAdminLogin} className="space-y-5 animate-fade-in">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={adminId}
                                    onChange={(e) => setAdminId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition"
                                    placeholder="Enter Admin ID"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {loading ? 'Authenticating...' : <>Login <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
