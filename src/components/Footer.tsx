
import React from 'react';
import { Heart, Code, Coffee } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-whatsapp-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🌳</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">Arbre Familial</h3>
              <p className="text-sm text-gray-300">Connecter les familles africaines</p>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-sm text-gray-300">Développé avec</span>
              <Heart className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-sm text-gray-300">par</span>
            </div>
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-whatsapp-400" />
              <span className="font-semibold text-whatsapp-300">Thierry Gogo</span>
              <Coffee className="w-4 h-4 text-african-400" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Développeur Full-Stack</p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-gray-300 mb-1">© 2024 Arbre Familial</p>
            <p className="text-xs text-gray-400">Tous droits réservés</p>
            <div className="flex items-center justify-center md:justify-end space-x-4 mt-2">
              <button className="text-xs text-gray-400 hover:text-whatsapp-300 transition-colors">
                Confidentialité
              </button>
              <button className="text-xs text-gray-400 hover:text-whatsapp-300 transition-colors">
                Conditions
              </button>
              <button className="text-xs text-gray-400 hover:text-whatsapp-300 transition-colors">
                Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
