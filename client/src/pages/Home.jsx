import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import carImage from '../assets/Gemini_Generated_Image_i7i9tbi7i9tbi7i9.png'; // Updated Image
import dlImage from '../assets/home_dl.png';

const Home = () => {
    return (
        <div className="flex flex-col items-center pt-10 px-4 pb-24">

            <div className="w-full max-w-xl">
                {/* Header */}
                <div className="flex items-center mb-8 relative">
                    <h1 className="w-full text-center text-xl font-semibold text-gray-500">VahanPe</h1>
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif text-gray-800">Select a service</h2>
                </div>

                <div className="flex flex-col md:flex-row justify-center gap-6">
                    {/* Vehicle Service Card */}
                    <Link to="/vehicle-services" className="flex-1 aspect-square bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-all group cursor-pointer text-decoration-none">
                        <div className="w-full h-24 flex items-center justify-center">
                            <img src={carImage} alt="Vehicle" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-gray-700 font-medium text-lg">Vehicle</span>
                    </Link>

                    {/* DL Service Card */}
                    <Link to="/dl-services" className="flex-1 aspect-square bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-all group cursor-pointer text-decoration-none">
                        <div className="w-full h-24 flex items-center justify-center">
                            <img src={dlImage} alt="Driving Licence" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-gray-700 font-medium text-lg">Driving licence</span>
                    </Link>
                </div>

                {/* Disclaimer */}
                <div className="mt-8 text-center px-4">
                    <p className="text-[#e53935] text-sm leading-relaxed max-w-4xl mx-auto">
                        VahanPe is an independent facilitator and not a government authority. We assist with documentation and submission through official channels. Processing timelines (15-30 working days) begin post RTO submission and are subject to RTO approval.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
