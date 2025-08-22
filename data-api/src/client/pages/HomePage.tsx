import logo from '@/client/assets/modelence.svg';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Modelence Logo" className="w-32 h-32" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">MongoDB Atlas Data API</h1>
        <p className="mt-4 text-gray-600">A copy of the MongoDB Atlas Data API built with Modelence</p>

        <div className="flex gap-4 mt-8 justify-center">
          <a 
            href="https://docs.modelence.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-lg font-semibold"
          >
            Modelence Docs →
          </a>
          <a 
            href="https://docs.modelence.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-lg font-semibold"
          >
            MongoDB Atlas Data API Docs →
          </a>
        </div>
      </div>
    </div>
  );
}
