import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Check, AlertTriangle, RefreshCcw } from 'lucide-react';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filterDate, setFilterDate] = useState('');
    const [filterServiceType, setFilterServiceType] = useState('All');

    // Modal State
    const [tempStatus, setTempStatus] = useState('');
    const [tempFeasibility, setTempFeasibility] = useState('');
    const [adminComment, setAdminComment] = useState('');

    // Init Modal State
    useEffect(() => {
        if (selectedBooking) {
            setTempStatus(selectedBooking.status || 'Processing');
            setTempFeasibility(selectedBooking.feasibilityStatus || 'Pending');
            setAdminComment(selectedBooking.adminComment || '');
        }
    }, [selectedBooking]);

    // Redirect if not admin
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
        } else {
            fetchBookings();
        }
    }, [user, navigate]);

    const fetchBookings = async () => {
        const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
        setLoading(true);
        setError(null);

        const token = user?.token || localStorage.getItem('vahanpe_token');

        // DEMO MODE CHECK
        if (token === 'demo-token') {
            const demoData = JSON.parse(localStorage.getItem('demo_bookings') || '[]');
            setBookings(demoData.reverse()); // Show newest first
            setLoading(false);
            return;
        }

        try {
            if (!token) {
                setError("Authentication Token Missing. Please Logout and Login.");
                setLoading(false);
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const res = await axios.get(`${apiUrl}/api/bookings`, config);

            if (Array.isArray(res.data)) {
                // Determine if we need to sort manually or if server returns sorted
                const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setBookings(sorted);
            } else {
                setBookings([]);
                console.warn("API returned non-array:", res.data);
            }
        } catch (err) {
            console.error("Admin API Fetch Error", err);
            // Fallback to demo data if API fails completely
            const demoData = JSON.parse(localStorage.getItem('demo_bookings') || '[]');
            if (demoData.length > 0) {
                setBookings(demoData.reverse());
                setError("Network Error: Showing Demo Data.");
            } else {
                if (err.response) {
                    if (err.response.status === 401 || err.response.status === 403) {
                        setError("Session Expired (401/403). Please Re-Login.");
                    } else {
                        setError(`Server Error: ${err.response.status}`);
                    }
                } else {
                    setError("Network Error: Could not connect to server.");
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBooking = async () => {
        if (!selectedBooking) return;
        const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
        const token = user?.token || localStorage.getItem('vahanpe_token');

        // DEMO MODE
        if (token === 'demo-token') {
            const updatedBooking = {
                ...selectedBooking,
                status: tempStatus,
                feasibilityStatus: tempFeasibility,
                adminComment: adminComment
            };

            // Update in local storage
            const demoBookings = JSON.parse(localStorage.getItem('demo_bookings') || '[]');
            const updatedList = demoBookings.map(b => b.id === selectedBooking.id ? updatedBooking : b);
            localStorage.setItem('demo_bookings', JSON.stringify(updatedList));

            // Update State
            setBookings(prev => prev.map(b => b.id === selectedBooking.id ? updatedBooking : b));
            setSelectedBooking(null); // Close modal

            // WhatsApp Redirection (Demo Mode)
            if (adminComment && adminComment.trim() !== '') {
                const phone = selectedBooking.customerPhone || '';
                const cleanPhone = phone.replace(/\D/g, '').slice(-10);
                if (cleanPhone) {
                    const message = encodeURIComponent(
                        `Hello ${selectedBooking.customerName || 'User'}, Update for your ${selectedBooking.serviceSelected}:\n\n` +
                        `Status: ${tempStatus}\n` +
                        `Remarks: ${adminComment}\n\n` +
                        `- Team VahanPe`
                    );
                    window.open(`https://wa.me/91${cleanPhone}?text=${message}`, '_blank');
                }
            }

            alert('Booking Updated (Demo Mode)!');
            return;
        }

        try {
            const res = await axios.patch(`${apiUrl}/api/bookings/${selectedBooking.id}/status`, {
                status: tempStatus,
                feasibilityStatus: tempFeasibility,
                adminComment: adminComment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            setBookings(prev => prev.map(b =>
                b.id === selectedBooking.id ? { ...b, ...res.data } : b
            ));

            // Close modal
            setSelectedBooking(null);

            // WhatsApp Redirection
            if (adminComment && adminComment.trim() !== '') {
                const phone = selectedBooking.customerPhone || '';
                // Remove non-digits and ensure 91 prefix if missing (assuming India)
                const cleanPhone = phone.replace(/\D/g, '').slice(-10);

                if (cleanPhone) {
                    const message = encodeURIComponent(
                        `Hello ${selectedBooking.customerName || 'User'}, Update for your ${selectedBooking.serviceSelected}:\n\n` +
                        `Status: ${tempStatus}\n` +
                        `Remarks: ${adminComment}\n\n` +
                        `- Team VahanPe`
                    );
                    window.open(`https://wa.me/91${cleanPhone}?text=${message}`, '_blank');
                }
            }

            alert('Booking Updated Successfully!');

        } catch (err) {
            console.error(err);
            alert(`Update Failed: ${err.response?.data?.error || err.message}`);
        }
    };


    const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'services'
    const [services, setServices] = useState([]);
    const [editingService, setEditingService] = useState(null);
    const [newPrice, setNewPrice] = useState('');

    // Fetch Services
    const fetchServices = async () => {
        const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
        try {
            const res = await axios.get(`${apiUrl}/api/services`);
            setServices(res.data);
        } catch (err) {
            console.error("Error fetching services", err);
        }
    };

    useEffect(() => {
        if (activeTab === 'services') {
            fetchServices();
        }
    }, [activeTab]);

    const handleUpdatePrice = async () => {
        if (!editingService || !newPrice) return;
        const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
        const token = user?.token || localStorage.getItem('vahanpe_token');

        // DEMO Check
        if (token === 'demo-token') {
            alert("Price update is disabled in Demo Mode");
            setEditingService(null);
            return;
        }

        try {
            await axios.patch(`${apiUrl}/api/services/${editingService.id}`, { price: newPrice }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Price updated successfully!");
            setEditingService(null);
            fetchServices(); // Refresh list
        } catch (err) {
            console.error(err);
            alert("Failed to update price");
        }
    };


    // Filter Logic
    const filteredBookings = bookings.filter(booking => {
        // Date Filter
        if (filterDate) {
            const bookingDate = new Date(booking.createdAt).toISOString().split('T')[0];
            if (bookingDate !== filterDate) return false;
        }

        // Service Type Filter
        if (filterServiceType !== 'All') {
            const type = booking.serviceType || (booking.licenceClass ? 'Driving Licence' : 'Vehicle');
            if (filterServiceType === 'Driving Licence' && type !== 'Driving Licence') return false;
            // 'Vehicle Service' matches 'Vehicle'
            if (filterServiceType === 'Vehicle Service' && type !== 'Vehicle') return false;
        }

        return true;
    });

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                    <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'bookings' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Bookings
                    </button>
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'services' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Manage Services
                    </button>
                </div>

                {activeTab === 'bookings' && (
                    <div className="flex flex-col md:flex-row md:items-center gap-3 w-full xl:w-auto">

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="bg-white border text-sm rounded px-2 py-1 outline-none focus:border-blue-500 text-gray-600"
                            />
                            <select
                                value={filterServiceType}
                                onChange={(e) => setFilterServiceType(e.target.value)}
                                className="bg-white border text-sm rounded px-2 py-1.5 outline-none focus:border-blue-500 text-gray-600"
                            >
                                <option value="All">All Services</option>
                                <option value="Vehicle Service">Vehicle Service</option>
                                <option value="Driving Licence">Driving Licence</option>
                            </select>
                            {(filterDate || filterServiceType !== 'All') && (
                                <button
                                    onClick={() => { setFilterDate(''); setFilterServiceType('All'); }}
                                    className="text-xs text-red-500 hover:text-red-700 px-2 font-medium"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Loading State */}
            {loading && activeTab === 'bookings' && (
                <div className="text-center py-12">
                    <RefreshCcw className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                    <p className="text-gray-500">Loading bookings from database...</p>
                </div>
            )}

            {/* SERVICES TAB */}
            {activeTab === 'services' && (
                <>
                    {/* Desktop View */}
                    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Service Name</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Price (₹)</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {services.map(service => (
                                    <tr key={service.id} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-800">{service.title}</div>
                                            <div className="text-xs text-gray-500">{service.description}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${service.category === 'Vehicle' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                                                {service.category}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono font-medium whitespace-nowrap">₹ {service.price}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => { setEditingService(service); setNewPrice(service.price); }}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
                                            >
                                                Edit Price
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-4">
                        {services.map(service => (
                            <div key={service.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-3">
                                <div>
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-800 flex-1 leading-tight">{service.title}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${service.category === 'Vehicle' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                                            {service.category}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">{service.description}</p>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                    <span className="font-mono font-bold text-gray-900">₹ {service.price}</span>
                                    <button
                                        onClick={() => { setEditingService(service); setNewPrice(service.price); }}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Bookings View - Responsive */}
            {!loading && activeTab === 'bookings' && (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Service</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Feasibility</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {Array.isArray(filteredBookings) && filteredBookings.length > 0 ? (
                                    filteredBookings.map(booking => (
                                        <tr key={booking.id} className="hover:bg-gray-50">
                                            <td className="p-4 text-sm text-gray-600">
                                                {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="p-4 font-mono text-sm">{booking.bookingId}</td>
                                            <td className="p-4">
                                                <div className="font-medium">{booking.serviceSelected}</div>
                                                <div className="text-xs text-gray-400">{booking.vehicleType || booking.licenceClass}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-800">{booking.customerName || 'N/A'}</div>
                                                <div className="text-xs text-gray-500">{booking.customerPhone}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${booking.status === 'Cancelled' || booking.status === 'Not Serviceable' ? 'bg-red-100 text-red-700' :
                                                    booking.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                        'bg-blue-50 text-blue-700'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${booking.feasibilityStatus === 'Doable' ? 'bg-green-100 text-green-700' :
                                                    booking.feasibilityStatus === 'Not Doable' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {booking.feasibilityStatus}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => setSelectedBooking(booking)}
                                                    className="text-secondary hover:underline font-medium text-sm"
                                                >
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-gray-500">
                                            No bookings found matching filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {Array.isArray(filteredBookings) && filteredBookings.length > 0 ? (
                            filteredBookings.map(booking => (
                                <div key={booking.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="font-mono text-xs text-gray-500 block mb-1">{booking.bookingId}</span>
                                            <h3 className="font-semibold text-gray-800">{booking.serviceSelected}</h3>
                                            <p className="text-xs text-gray-500">{booking.vehicleType || booking.licenceClass}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${booking.status === 'Cancelled' || booking.status === 'Not Serviceable' ? 'bg-red-100 text-red-700' :
                                            booking.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                'bg-blue-50 text-blue-700'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-800">{booking.customerName || 'N/A'}</span>
                                            <span className="text-xs">{booking.customerPhone}</span>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${booking.feasibilityStatus === 'Doable' ? 'bg-green-100 text-green-700' :
                                            booking.feasibilityStatus === 'Not Doable' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                            {booking.feasibilityStatus}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => setSelectedBooking(booking)}
                                        className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-secondary font-medium rounded-lg text-sm border border-gray-100 transition"
                                    >
                                        Manage Booking
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                                <p className="text-gray-500">No bookings found.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Price Edit Modal */}
            {editingService && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl relative">
                        <button
                            onClick={() => setEditingService(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-bold mb-4">Edit Service Price</h3>
                        <p className="text-sm text-gray-600 mb-4">{editingService.title}</p>

                        <div className="mb-6">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">New Price (₹)</label>
                            <input
                                type="number"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                className="w-full border rounded-lg p-2 text-lg font-mono outline-none focus:border-primary"
                                placeholder="Enter Price"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditingService(null)}
                                className="flex-1 py-2 bg-gray-100 rounded-lg text-gray-600 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdatePrice}
                                className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal (Bookings) */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setSelectedBooking(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-xl font-bold mb-1">Manage Booking</h2>
                        <p className="text-sm text-gray-500 mb-6 font-mono">{selectedBooking.bookingId}</p>

                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                <p><strong>Service:</strong> {selectedBooking.serviceSelected}</p>
                                <p><strong>Type:</strong> {selectedBooking.vehicleType || selectedBooking.licenceClass}</p>
                                <p><strong>Reg/Issue:</strong> {selectedBooking.registrationNumber || selectedBooking.licenceIssuedFrom}</p>
                                {selectedBooking.serviceDescription && <p className="mt-2 text-gray-600 italic">"{selectedBooking.serviceDescription}"</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Feasibility Check</label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setTempFeasibility('Doable')}
                                        className={`flex-1 py-2 rounded-lg border-2 font-medium ${tempFeasibility === 'Doable' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-200'
                                            }`}
                                    >
                                        Doable
                                    </button>
                                    <button
                                        onClick={() => setTempFeasibility('Not Doable')}
                                        className={`flex-1 py-2 rounded-lg border-2 font-medium ${tempFeasibility === 'Not Doable' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-red-200'
                                            }`}
                                    >
                                        Not Doable (Refund)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Update Stage</label>
                                <select
                                    className="w-full p-3 border rounded-lg"
                                    value={tempStatus}
                                    onChange={(e) => setTempStatus(e.target.value)}
                                    disabled={tempFeasibility === 'Not Doable'}
                                >
                                    <option value="Confirmation Fee Paid">Confirmation Fee Paid</option>
                                    <option value="Service Booked">Service Booked</option>
                                    <option value="Documents Picked Up">Documents Picked Up</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Remarks Field */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Remarks / Comments (Free Text)</label>
                                <textarea
                                    className="w-full p-3 border rounded-lg h-24 text-sm focus:ring-2 focus:ring-blue-100 outline-none border-gray-200 resize-none"
                                    placeholder="Add notes... (Saving with notes redirects to WhatsApp)"
                                    value={adminComment}
                                    onChange={(e) => setAdminComment(e.target.value)}
                                />
                            </div>

                            {selectedBooking.refundStatus === 'Processed' && (
                                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> Refund of ₹{selectedBooking.price} has been processed.
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveBooking}
                                className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;
