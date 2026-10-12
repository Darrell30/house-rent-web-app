import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-extrabold text-3xl">
          404
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Page Not Found</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          The page or rental property you are trying to reach does not exist or has been moved to a new address.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
          <Link to="/">
            <Button icon={Home}>Back to Home</Button>
          </Link>
          <Link to="/properties">
            <Button variant="outline" icon={Compass}>
              Browse Properties
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
