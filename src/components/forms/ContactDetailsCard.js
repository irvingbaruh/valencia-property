"use client";

import { Phone, Mail, MessageCircle } from "lucide-react";
import { useContactSettings, telHref, waDigits } from "@/lib/siteSettings";

export default function ContactDetailsCard({ labels }) {
  const contact = useContactSettings();
  return (
    <div className="bg-dark rounded-2xl p-8 text-white h-full flex flex-col">
      <h2 className="text-2xl font-serif mb-6">{labels.title}</h2>

      <div className="space-y-5 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
            <Phone size={18} className="text-gold" />
          </div>
          <div>
            <p className="text-xs text-white/50">{labels.phone}</p>
            <a
              href={telHref(contact.phone)}
              className="text-white hover:text-gold transition-colors"
            >
              {contact.phone}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
            <Mail size={18} className="text-gold" />
          </div>
          <div>
            <p className="text-xs text-white/50">{labels.email}</p>
            <a
              href={`mailto:${contact.email}`}
              className="text-white hover:text-gold transition-colors"
            >
              {contact.email}
            </a>
          </div>
        </div>
      </div>

      <a
        href={`https://wa.me/${waDigits(contact.whatsapp)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] text-white font-semibold rounded-xl hover:brightness-110 transition-all duration-200 mt-auto"
      >
        <MessageCircle size={18} />
        {labels.whatsapp}
      </a>

      <p className="text-xs text-white/30 mt-6 leading-relaxed">
        {labels.office}
      </p>
    </div>
  );
}
