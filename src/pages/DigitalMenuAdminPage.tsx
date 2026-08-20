import React, { useState } from 'react';
import { QrCode, ExternalLink, Printer, Link, FileText, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ModuleOnboardingBanner } from '../components/common/ModuleOnboardingBanner';
import { PrintableMenuModal } from '../components/menu/PrintableMenuModal';

export const DigitalMenuAdminPage: React.FC = () => {
  const { tables } = useApp();
  const [copied, setCopied] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const publicLink = `${window.location.origin}/menu`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printTableQR = (tableId: string, tableName: string) => {
    const qrLink = `${window.location.origin}/menu?table=${tableId}`;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Imprimir QR - ${tableName}</title>
            <style>
              body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .qr-container { border: 2px solid #4A352C; padding: 20px; border-radius: 12px; text-align: center; max-width: 300px; }
              h1 { color: #4A352C; margin-bottom: 5px; }
              p { color: #765747; margin-bottom: 20px; font-size: 14px; }
              .qr-placeholder { width: 200px; height: 200px; background: #fff; border: 1px solid #ccc; margin: 0 auto; display: flex; align-items: center; justify-content: center; }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h1>${tableName}</h1>
              <p>Escanea para ver el menú y hacer tu pedido</p>
              <div class="qr-placeholder">
                <!-- Replace with actual QR Code library render -->
                [ Código QR de ${qrLink} ]
              </div>
            </div>
            <script>
              window.onload = () => { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <ModuleOnboardingBanner
        title="Administración de Menú Digital"
        subtitle="Gestiona el acceso público a tu carta, imprime 'La Carta' en PDF y genera códigos QR por mesa."
        steps={[
          'Copia el link global para tus redes sociales.',
          'Descarga e imprime "La Carta" en PDF con diseño artesanal para tu salón.',
          'Genera e imprime el código QR específico para cada mesa de tu local.',
        ]}
      />

      {/* Tarjeta para Descargar / Imprimir La Carta en PDF */}
      <div className="bg-gradient-to-r from-[#1A2E1E] to-[#2F5233] text-white p-6 rounded-2xl border border-emerald-800 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-[#D8E4C3]">
            <FileText className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Documento Físico Impreso</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#FFFDF8]">
            Descargar e Imprimir "La Carta" (PDF)
          </h3>
          <p className="text-xs text-emerald-100/80 leading-relaxed max-w-2xl">
            Genera un documento PDF de alta calidad optimizado para hojas A4 con las categorías, productos, precios actualizados, estética institucional e imágenes fotográficas generadas por IA.
          </p>
        </div>

        <button
          onClick={() => setIsPrintModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-[#FFFDF8] text-[#1A2E1E] hover:bg-emerald-50 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 whitespace-nowrap transform active:scale-95"
        >
          <Download className="w-4 h-4 text-[#2F5233]" />
          Ver e Imprimir Carta PDF
        </button>
      </div>

      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft space-y-4">
        <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
          <Link className="w-5 h-5 text-brand-brown" /> Link Global del Menú
        </h3>
        <p className="text-sm text-brand-brown/80">
          Usa este link para tus redes sociales (Instagram, WhatsApp). Al ingresar por aquí, el sistema preguntará si es para retirar o comer en el salón (y pedirá la mesa).
        </p>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            readOnly
            value={publicLink}
            className="flex-1 bg-brand-bg border border-brand-secondary rounded-xl px-4 py-2.5 text-sm font-mono text-brand-dark focus:outline-none"
          />
          <button
            onClick={copyToClipboard}
            className="px-4 py-2.5 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors whitespace-nowrap"
          >
            {copied ? '¡Copiado!' : 'Copiar Link'}
          </button>
          <a
            href={publicLink}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl border border-brand-secondary text-brand-dark font-bold text-xs hover:bg-brand-secondary/30 transition-colors flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" /> Abrir
          </a>
        </div>
      </div>

      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft space-y-6">
        <div>
          <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
            <QrCode className="w-5 h-5 text-brand-brown" /> Códigos QR por Mesa
          </h3>
          <p className="text-sm text-brand-brown/80 mt-1">
            Imprime estos QR y colócalos en las mesas. Cuando los clientes escanean, el pedido quedará asociado automáticamente a esa mesa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map(table => (
            <div key={table.id} className="border border-brand-secondary rounded-xl p-4 flex flex-col items-center justify-center space-y-3 bg-brand-bg hover:border-brand-brown/40 transition-colors">
              <div className="text-center">
                <span className="block font-bold text-brand-dark text-base">{table.number}</span>
                <span className="text-[10px] text-brand-brown/80 capitalize">{table.sector}</span>
              </div>
              <button
                onClick={() => printTableQR(table.id, table.number)}
                className="w-full py-2 rounded-lg bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Imprimir QR
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Impresión / PDF */}
      <PrintableMenuModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
};

