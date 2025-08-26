import logo from '@/client/assets/modelence.svg';
import ApiExplorer from './ApiExplorer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo and Info */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <img src={logo} alt="Modelence Logo" className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MongoDB Atlas Data API</h1>
                <p className="text-sm text-gray-600">Built with Modelence</p>
              </div>
            </div>
            
            {/* Quick Info */}
            <div className="text-right text-sm text-gray-600">
              <div>Demo Application</div>
            </div>
          </div>
        </div>
      </div>

      {/* API Explorer */}
      <ApiExplorer />
    </div>
  );
}
