import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Heart, MapPin, Mail, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-md">
                <Home className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                House<span className="text-teal-400">Hunt</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Modern property rental marketplace simplifying discovery, rental requests,
              and housing management across Indonesian cities.
            </p>
            <div className="text-xs text-slate-500">
              SkillWallet Full-Stack Capstone Project
            </div>
          </div>

          {/* Popular Cities */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Explore Cities
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/properties?city=Jakarta" className="hover:text-teal-400 transition-colors">
                  Jakarta Selatan & Pusat
                </Link>
              </li>
              <li>
                <Link to="/properties?city=BSD City" className="hover:text-teal-400 transition-colors">
                  BSD City & Tangerang
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Alam Sutera" className="hover:text-teal-400 transition-colors">
                  Alam Sutera
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Bandung" className="hover:text-teal-400 transition-colors">
                  Bandung (Dago & Setiabudi)
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Surabaya" className="hover:text-teal-400 transition-colors">
                  Surabaya Barat
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Yogyakarta" className="hover:text-teal-400 transition-colors">
                  Yogyakarta
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/properties" className="hover:text-teal-400 transition-colors">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-teal-400 transition-colors">
                  Join as Owner
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-teal-400 transition-colors">
                  Tenant Login
                </Link>
              </li>
              <li>
                <Link to="/properties?propertyType=Apartment" className="hover:text-teal-400 transition-colors">
                  Apartments
                </Link>
              </li>
              <li>
                <Link to="/properties?propertyType=Villa" className="hover:text-teal-400 transition-colors">
                  Villas & Vacation Homes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Contact & Support
            </h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>Jakarta Selatan, DKI Jakarta, Indonesia</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>support@househunt.id</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>+62 (21) 500-HUNT</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} HouseHunt. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">
            Crafted for SkillWallet Full-Stack Web Development Course.
          </p>
        </div>
      </div>
    </footer>
  );
};
