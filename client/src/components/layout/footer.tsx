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
                <a href="#" className="hover:text-white">Fale conosco pelo telefone 00 800 800 77232</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">Fale conosco pelo WhatsApp</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">Contatos</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">FAQ</a>
              </li>
            </ul>
          </div>

          {/* Services Section */}
          <div>
            <h4 className="uppercase text-sm mb-4">SERVIÇOS EXCLUSIVOS</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a href="#" className="hover:text-white">Serviços DELACREAM</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">Acompanhe seu pedido</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">Devoluções</a>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h4 className="uppercase text-sm mb-4">EMPRESA</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a href="#" className="hover:text-white">DELACREAM Group</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">Trabalhe conosco</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">Sustentabilidade</a>
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
                <a href="#" className="hover:text-white">Aviso legal</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">Política de Privacidade</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">Política de cookies</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">Termos de venda</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media */}
        <div className="flex gap-6 mb-12">
          <a href="#" className="text-white/60 hover:text-white">
            <Facebook className="h-5 w-5" />
          </a>
          <a href="#" className="text-white/60 hover:text-white">
            <Twitter className="h-5 w-5" />
          </a>
          <a href="#" className="text-white/60 hover:text-white">
            <Instagram className="h-5 w-5" />
          </a>
          <a href="#" className="text-white/60 hover:text-white">
            <Youtube className="h-5 w-5" />
          </a>
          <a href="#" className="text-white/60 hover:text-white">
            <MessageSquare className="h-5 w-5" />
          </a>
        </div>

        {/* Bottom Bar */}
        <div className="flex justify-between items-center pt-8 border-t border-white/10 text-sm">
          <div className="text-white/60">
            ©DELACREAM 2025 | RUA LEOPOLDO COUTO DE MAGALHÃES, 700. CEP 04542-000 SÃO PAULO, SP. BRASIL
          </div>
          <div className="flex items-center gap-4">
            <button className="text-white/60 hover:text-white flex items-center gap-2">
              <span>LOCALIZADOR DE LOJAS</span>
            </button>
            <button className="text-white/60 hover:text-white flex items-center gap-2">
              <span>ENVIANDO PARA: BRASIL/PORTUGUÊS</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}