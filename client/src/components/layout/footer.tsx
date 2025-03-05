import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Youtube, MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8 px-4 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Help Section */}
          <div>
            <h4 className="uppercase text-sm mb-4">PRECISA DE AJUDA?</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a href="tel:+5522997788649" className="hover:text-white">Fale conosco pelo telefone +55 22 99778-8649</a>
              </li>
              <li>
                <a href="https://wa.me/5522997788649" className="hover:text-white">Fale conosco pelo WhatsApp</a>
              </li>
              <li>
                <a href="mailto:leo@fastlane.com" className="hover:text-white">Contatos</a> 
              </li>
            </ul>
          </div>

          {/* Services Section */}
          <div>
            <h4 className="uppercase text-sm mb-4">SERVIÇOS EXCLUSIVOS</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a href="https://wa.me/5522997788649" className="hover:text-white">Shaper Consulting</a>
              </li>
              <li>
                <a href="https://wa.me/5522997788649" className="hover:text-white">Devoluções</a>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h4 className="uppercase text-sm mb-4">EMPRESA</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a className="hover:text-white">LEO NEVES SURFBOARDS</a>
              </li>
              <li>
                <a href="mailto:leo@fastlane.com" className="hover:text-white">Trabalhe conosco</a>
              </li>
              <li>
                <Link href="/store" className="hover:text-white">Store Management</Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="uppercase text-sm mb-4">TERMOS E CONDIÇÕES LEGAIS</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a href="https://docs.google.com/document/d/191sC3qrFrV3c-dHWRWnK_poqGPEN34f9YP5LcQFCTyk/edit?usp=sharing" className="hover:text-white">Aviso legal</a>
              </li>
              <li>
                <a href="https://docs.google.com/document/d/1abvYkovWjNSOC2JpORKg3CAde68qx1u0xME1dpEF_8o/edit?usp=sharing" className="hover:text-white">Política de Privacidade</a>
              </li>
              <li>
                <a href="https://docs.google.com/document/d/1722BFmGUZQq4eSonRMUOjPi9E4A6oeLDj3QfukXiQ4o/edit?usp=sharing" className="hover:text-white">Termos de venda</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media */}
        <div className="flex gap-6 mb-12">
          <a href="https://www.facebook.com/leonevessurfboards" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
            <Facebook className="h-5 w-5" />
          </a>
          <a href="https://www.instagram.com/leonevessurfboards/" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
            <Instagram className="h-5 w-5" />
          </a>
          <a href="https://www.youtube.com/@leonevessurfboards3289" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
            <Youtube className="h-5 w-5" />
          </a>
        </div>

        {/* Bottom Bar */}
        <div className="flex justify-between items-center pt-8 border-t border-white/10 text-sm">
          <div className="text-white/60">
            ©LEO NEVES SURFBOARDS 2025 | RUA DOS SURFISTAS, 484. CEP 28991269 SQUAREMA, RJ. BRASIL
          </div>
          <div className="flex items-center gap-4">
            <button className="text-white/60 flex items-center gap-2">
              <span>ENVIAMOS PARA TODO O BRASIL</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}