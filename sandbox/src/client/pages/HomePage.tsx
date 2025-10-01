import logo from '@/client/assets/modelence.svg';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Modelence Logo" className="w-32 h-32" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Hello, World!</h1>
        <p className="mt-4 text-gray-600">Welcome to your new Modelence project</p>
        
        <div className="mt-12 p-4 bg-white rounded-lg shadow-sm">
          <p className="text-sm font-mono">
            Get started by editing{' '}
            <code className="font-bold py-1">
              src/client/pages/HomePage.tsx
            </code>
          </p>
        </div>

        <div className="mt-4">
          <a 
            href="https://docs.modelence.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-lg font-semibold"
          >
            Docs →
          </a>
        </div>
      </div>
    </div>
  );
}
