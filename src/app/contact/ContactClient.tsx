"use client";

import { MapPin, Phone, Mail, Clock, Send, Check, ExternalLink, Navigation } from "lucide-react";
import { useState } from "react";

export default function ContactClient() {
  const [loading, setLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending email
    setTimeout(() => {
      setLoading(false);
      setMessageSent(true);
    }, 1500);
  };

  const fullAddress = "Plot # 3 Street 64, F-8/4 F 8/4 F-8, Islamabad, 44220";
  const phoneNumber = "03331942884";
  const displayPhone = "0333 1942884";
  const googleMapsShareUrl = "https://share.google/lhnGJVyAvI3DnKIFZ";
  const googleMapsEmbedUrl =
    "https://maps.google.com/maps?q=Signature+Art+Hotel,+Plot+3+Street+64,+F-8/4,+Islamabad&t=&z=16&ie=UTF8&iwloc=&output=embed";

  return (
    <main className="pt-[140px] pb-24 min-h-screen bg-[#FFFFFF]">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 text-center mb-16">
        <h1 className="font-marcellus text-4xl md:text-5xl text-[#000000] mb-4">Get in Touch</h1>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="w-12 h-[1px] bg-[#d7b56d]"></div>
          <p className="font-jost text-[#000000] uppercase tracking-widest text-sm">We&apos;d love to hear from you</p>
          <div className="w-12 h-[1px] bg-[#d7b56d]"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-20">
          
          {/* Left Column: Contact Information */}
          <div className="flex flex-col justify-center">
            <h2 className="font-marcellus text-3xl text-[#000000] mb-6">Contact Information</h2>
            <p className="font-jost text-[#000000] mb-10 text-[16px] leading-relaxed max-w-md">
              Whether you have a question about your reservation, need assistance planning your itinerary, or simply want to learn more about our amenities, our dedicated concierge team is at your service round the clock.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#d7b56d]/30 flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin size={22} className="text-[#d7b56d]" />
                </div>
                <div>
                  <h3 className="font-jost font-semibold text-[#000000] uppercase tracking-widest text-[13px] mb-1">Our Location</h3>
                  <p className="font-jost text-[#000000] text-[16px] leading-relaxed">{fullAddress}</p>
                  <a
                    href={googleMapsShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-jost text-[13px] text-[#d7b56d] hover:text-[#000000] font-semibold mt-1 transition-colors"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#d7b56d]/30 flex items-center justify-center shrink-0 shadow-sm">
                  <Phone size={22} className="text-[#d7b56d]" />
                </div>
                <div>
                  <h3 className="font-jost font-semibold text-[#000000] uppercase tracking-widest text-[13px] mb-1">Phone Number</h3>
                  <a
                    href={`tel:${phoneNumber}`}
                    className="font-jost text-[#000000] hover:text-[#d7b56d] text-[17px] font-medium transition-colors block"
                  >
                    {displayPhone}
                  </a>
                  <p className="font-jost text-[#000000]/70 text-[13px] mt-0.5">Available 24/7 for Reservations & Support</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#d7b56d]/30 flex items-center justify-center shrink-0 shadow-sm">
                  <Mail size={22} className="text-[#d7b56d]" />
                </div>
                <div>
                  <h3 className="font-jost font-semibold text-[#000000] uppercase tracking-widest text-[13px] mb-1">Email Address</h3>
                  <a href="mailto:signaturearthotel@gmail.com" className="font-jost text-[#000000] hover:text-[#d7b56d] transition-colors text-[16px] block">
                    signaturearthotel@gmail.com
                  </a>
                  <p className="font-jost text-[#000000]/70 text-[13px] mt-0.5">We reply within 24 hours</p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[#d7b56d]/30">
              <h3 className="font-jost font-semibold text-[#000000] uppercase tracking-widest text-[13px] mb-4">Follow Us</h3>
              <div className="flex items-center gap-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="font-jost text-[14px] text-[#000000] hover:text-[#d7b56d] uppercase tracking-widest transition-colors duration-300">
                  Facebook
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="font-jost text-[14px] text-[#000000] hover:text-[#d7b56d] uppercase tracking-widest transition-colors duration-300">
                  Instagram
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="font-jost text-[14px] text-[#000000] hover:text-[#d7b56d] uppercase tracking-widest transition-colors duration-300">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-[#000000] p-8 md:p-12 shadow-[0_10px_40px_-15px_rgba(54,38,24,0.3)] relative">
            
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[#d7b56d]"></div>

            <h2 className="font-marcellus text-2xl text-[#FFFFFF] mb-8">Send a Message</h2>

            {messageSent ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-6">
                  <Check size={32} className="text-[#22C55E]" strokeWidth={3} />
                </div>
                <h3 className="font-marcellus text-2xl text-[#FFFFFF] mb-2">Message Received</h3>
                <p className="font-jost text-[#d7b56d] mb-8 max-w-[280px]">
                  Thank you for reaching out. One of our concierges will get back to you shortly.
                </p>
                <button 
                  onClick={() => setMessageSent(false)}
                  className="bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white px-8 py-3 uppercase tracking-widest text-[12px] font-jost font-semibold transition-all duration-300 cursor-pointer border border-[#d7b56d]"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-jost uppercase tracking-widest text-[#d7b56d] mb-2 block">First Name *</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-[#000000] border-b-2 border-[#5A4332] focus:border-[#d7b56d] px-4 py-3 text-[15px] font-jost text-[#FFFFFF] placeholder:text-neutral-500 outline-none transition-colors"
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-jost uppercase tracking-widest text-[#d7b56d] mb-2 block">Last Name *</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-[#000000] border-b-2 border-[#5A4332] focus:border-[#d7b56d] px-4 py-3 text-[15px] font-jost text-[#FFFFFF] placeholder:text-neutral-500 outline-none transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-jost uppercase tracking-widest text-[#d7b56d] mb-2 block">Email Address *</label>
                  <input 
                    type="email" 
                    required
                    className="w-full bg-[#000000] border-b-2 border-[#5A4332] focus:border-[#d7b56d] px-4 py-3 text-[15px] font-jost text-[#FFFFFF] placeholder:text-neutral-500 outline-none transition-colors"
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-jost uppercase tracking-widest text-[#d7b56d] mb-2 block">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full bg-[#000000] border-b-2 border-[#5A4332] focus:border-[#d7b56d] px-4 py-3 text-[15px] font-jost text-[#FFFFFF] placeholder:text-neutral-500 outline-none transition-colors"
                    placeholder={phoneNumber}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-jost uppercase tracking-widest text-[#d7b56d] mb-2 block">Your Message *</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-[#000000] border-2 border-[#5A4332] focus:border-[#d7b56d] p-4 text-[15px] font-jost text-[#FFFFFF] placeholder:text-neutral-500 outline-none transition-colors resize-none"
                    placeholder="How can we assist you today?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white font-jost font-semibold uppercase tracking-[0.18em] text-[13px] py-4 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer border border-[#d7b56d]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Clock size={16} className="animate-spin" /> Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send size={15} fill="currentColor" /> Send Message
                    </span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Full-Width Interactive Google Map Section */}
        <div className="w-full border border-[#d7b56d]/30 shadow-xl overflow-hidden bg-neutral-900">
          <div className="bg-[#000000] px-6 sm:px-8 py-5 border-b border-[#d7b56d]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-vogue text-[#d7b56d] text-[11px] uppercase tracking-[0.24em] font-bold block mb-1">
                Prime Location
              </span>
              <h3 className="font-marcellus text-2xl text-white">Find Us on Google Maps</h3>
              <p className="font-jost text-white/70 text-[14px] mt-0.5">{fullAddress}</p>
            </div>
            <a
              href={googleMapsShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#d7b56d] hover:bg-white text-[#000000] font-jost font-semibold text-[12px] uppercase tracking-[0.16em] px-5 py-2.5 rounded-full transition-all duration-300 shadow-sm shrink-0 self-start sm:self-auto"
            >
              <Navigation size={14} />
              <span>Get Directions</span>
            </a>
          </div>
          <div className="relative w-full h-[380px] sm:h-[460px] md:h-[520px]">
            <iframe
              title="Signature Art Hotel Location Map"
              src={googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full grayscale-[15%] contrast-[1.05]"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
