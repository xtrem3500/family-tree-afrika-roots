
import React from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-earth-50 to-baobab-100 border-t border-whatsapp-200/30 shadow-top">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Colonne À propos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-whatsapp-800">À propos</h3>
            <div className="flex items-center gap-3">
              <img 
                src="/images/profile01.png" 
                alt="Logo Arbre Familial" 
                className="w-10 h-10 rounded-xl shadow-md"
              />
              <div>
                <h4 className="font-medium text-whatsapp-700">Arbre Familial</h4>
                <p className="text-xs text-whatsapp-600">Par Thierry Gogo</p>
              </div>
            </div>
            <p className="text-sm text-whatsapp-600 leading-relaxed">
              Une plateforme moderne pour connecter les familles africaines à travers 
              les générations et préserver notre héritage familial.
            </p>
          </div>

          {/* Colonne Liens rapides */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-whatsapp-800">Liens rapides</h3>
            <div className="space-y-2">
              <a 
                href="/dashboard" 
                className="block text-sm text-whatsapp-600 hover:text-whatsapp-700 transition-colors duration-300 hover:translate-x-1 transform"
              >
                Accueil
              </a>
              <a 
                href="/tree" 
                className="block text-sm text-whatsapp-600 hover:text-whatsapp-700 transition-colors duration-300 hover:translate-x-1 transform"
              >
                Arbre Familial
              </a>
              <a 
                href="/members" 
                className="block text-sm text-whatsapp-600 hover:text-whatsapp-700 transition-colors duration-300 hover:translate-x-1 transform"
              >
                Membres
              </a>
              <a 
                href="#" 
                className="block text-sm text-whatsapp-600 hover:text-whatsapp-700 transition-colors duration-300 hover:translate-x-1 transform"
              >
                Contact
              </a>
              <a 
                href="#" 
                className="block text-sm text-whatsapp-600 hover:text-whatsapp-700 transition-colors duration-300 hover:translate-x-1 transform"
              >
                Conditions
              </a>
              <a 
                href="#" 
                className="block text-sm text-whatsapp-600 hover:text-whatsapp-700 transition-colors duration-300 hover:translate-x-1 transform"
              >
                Politique de confidentialité
              </a>
            </div>
          </div>

          {/* Colonne Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-whatsapp-800">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-whatsapp-500" />
                <span className="text-sm text-whatsapp-600">contact@arbrefamilial.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-whatsapp-500" />
                <span className="text-sm text-whatsapp-600">+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-whatsapp-500" />
                <span className="text-sm text-whatsapp-600">Paris, France</span>
              </div>
            </div>

            {/* Icônes sociales */}
            <div className="pt-4">
              <h4 className="text-sm font-medium text-whatsapp-700 mb-3">Suivez-nous</h4>
              <div className="flex gap-4">
                <a 
                  href="#" 
                  className="text-whatsapp-600 hover:text-whatsapp-700 transition-all duration-300 hover:rotate-12 transform"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="text-whatsapp-600 hover:text-whatsapp-700 transition-all duration-300 hover:rotate-12 transform"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="text-whatsapp-600 hover:text-whatsapp-700 transition-all duration-300 hover:rotate-12 transform"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="text-whatsapp-600 hover:text-whatsapp-700 transition-all duration-300 hover:rotate-12 transform"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de copyright */}
        <div className="mt-8 pt-6 border-t border-whatsapp-200/50 bg-whatsapp-50/50 rounded-xl">
          <p className="text-center text-sm text-whatsapp-600">
            © 2024 Arbre Familial par Thierry Gogo. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
