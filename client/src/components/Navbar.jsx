import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X, Shield, CarFront, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo-blue.jpeg';
import ConsumerLoginModal from './ConsumerLoginModal';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleMyServicesClick = (e) => {
        if (!user) {
            e.preventDefault();
            setIsLoginModalOpen(true);
            setIsMobileMenuOpen(false); // Close mobile menu if open
        }
    };

    return (
        <>
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all supports-[backdrop-filter]:bg-white/60">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-20">

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <img src={logo} alt="VahanPe Logo" className="h-12 md:h-16 w-auto object-contain mix-blend-multiply" />
                        </Link>

                        {/* Desktop Navigation - Always Visible */}
                        <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
                            <Link to="/" className="hover:text-primary transition hover:-translate-y-0.5 transform duration-200">Home</Link>
                            <Link to="/vehicle-services" className="hover:text-primary transition hover:-translate-y-0.5 transform duration-200">Vehicle Services</Link>
                            <Link to="/dl-services" className="hover:text-primary transition hover:-translate-y-0.5 transform duration-200">DL Services</Link>

                            {/* NEW: My Services Link (Visible to All) */}
                            {(!user || user.role !== 'admin') && (
                                <Link
                                    to="/my-services"
                                    onClick={handleMyServicesClick}
                                    className="hover:text-primary transition hover:-translate-y-0.5 transform duration-200"
                                >
                                    My Services
                                </Link>
                            )}
                        </div>

                        {/* Desktop Action Buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <>
                                    <Link
                                        to={user.role === 'admin' || user.userType === 'admin' ? '/admin' : '/my-services'}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 hover:border-primary hover:text-primary hover:bg-blue-50 transition text-sm font-bold shadow-sm custom-shadow group"
                                    >
                                        <div className="flex flex-col items-end leading-none">
                                            <span className="text-xs font-normal text-gray-500">Hello, {user.name.split(' ')[0]}</span>
                                            <span className="text-primary">{user.id}</span>
                                        </div>
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                                            {user.role === 'admin' || user.userType === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                        </div>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className="px-6 py-2.5 bg-primary text-white rounded-full font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Admin Login
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-gray-600 hover:text-primary transition"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-xl animate-fade-in-down">
                        <div className="p-4 space-y-4">
                            {user && (
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-4">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-primary border border-gray-200">
                                        {user.userType === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{user.name}</div>
                                        <div className="text-xs text-primary font-medium">{user.id}</div>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <Link
                                    to="/"
                                    className="p-3 rounded-lg hover:bg-gray-50 font-medium text-gray-700 flex items-center gap-3"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <CarFront className="w-5 h-5 text-gray-400" /> Home
                                </Link>
                                <Link
                                    to="/vehicle-services"
                                    className="p-3 rounded-lg hover:bg-gray-50 font-medium text-gray-700 flex items-center gap-3"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <CarFront className="w-5 h-5 text-gray-400" /> Vehicle Services
                                </Link>
                                <Link
                                    to="/dl-services"
                                    className="p-3 rounded-lg hover:bg-gray-50 font-medium text-gray-700 flex items-center gap-3"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <User className="w-5 h-5 text-gray-400" /> DL Services
                                </Link>

                                {/* NEW: Mobile My Services Link */}
                                {(!user || user.role !== 'admin') && (
                                    <Link
                                        to="/my-services"
                                        onClick={handleMyServicesClick}
                                        className="p-3 rounded-lg hover:bg-gray-50 font-medium text-gray-700 flex items-center gap-3"
                                    >
                                        <FileText className="w-5 h-5 text-gray-400" /> My Services
                                    </Link>
                                )}

                                {user && (user.role === 'admin' || user.userType === 'admin') && (
                                    <Link
                                        to="/admin"
                                        className="p-3 rounded-lg hover:bg-gray-50 font-medium text-gray-700 flex items-center gap-3"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Shield className="w-5 h-5 text-gray-400" /> Admin Dashboard
                                    </Link>
                                )}
                            </div>

                            {user ? (
                                <button
                                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                    className="w-full mt-4 p-3 rounded-lg bg-red-50 text-red-600 font-bold flex items-center justify-center gap-2"
                                >
                                    <LogOut className="w-5 h-5" /> Logout
                                </button>
                            ) : (
                                <div className="space-y-3 mt-4">
                                    {/* Mobile Login Button removed to favor Admin Login only appearance, 
                                        users use My Services to login, but Admin link remains */}
                                    <Link
                                        to="/login"
                                        className="w-full p-3 rounded-lg bg-gray-900 text-white font-bold flex items-center justify-center gap-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Shield className="w-4 h-4" /> Admin Login
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <ConsumerLoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                redirectAfterLogin="/my-services"
            />
        </>
    );
};

export default Navbar;
