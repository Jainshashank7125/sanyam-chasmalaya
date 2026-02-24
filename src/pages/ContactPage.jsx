import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, ChevronDown, CheckCircle } from 'lucide-react'

const TIME_SLOTS = [
    '10:00 AM – 11:00 AM',
    '11:00 AM – 12:00 PM',
    '12:00 PM – 01:00 PM',
    '02:00 PM – 03:00 PM',
    '03:00 PM – 04:00 PM',
    '04:00 PM – 05:00 PM',
    '05:00 PM – 06:00 PM',
    '07:00 PM – 08:00 PM',
]

const FAQS = [
    { q: 'Do I need an appointment?', a: 'Walk-ins are welcome, but booking in advance ensures a dedicated time slot and reduces waiting time.' },
    { q: 'Is the eye test really free?', a: 'Yes, comprehensive computerized eye tests are absolutely free at Sanyam Chashmalaya for all customers — no purchase required.' },
    { q: 'How long does a full eye exam take?', a: 'A complete eye examination takes about 20–30 minutes including consultation and lens recommendation.' },
    { q: 'Can I bring my old glasses for adjustment?', a: 'Absolutely! We offer free adjustments and minor repairs on all eyewear, regardless of where you bought them.' },
]

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', phone: '', date: '', time: '' })
    const [errors, setErrors] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [openFaq, setOpenFaq] = useState(null)

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Name is required'
        if (!form.phone.match(/^[0-9]{10}$/)) e.phone = 'Enter a valid 10-digit phone number'
        if (!form.date) e.date = 'Please select a date'
        if (!form.time) e.time = 'Please select a time slot'
        return e
    }

    const handleSubmit = (ev) => {
        ev.preventDefault()
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        setErrors({})
        // Backend-ready: POST /api/bookings would go here
        console.log('Booking submitted:', form)
        setSubmitted(true)
    }

    const field = (key) => ({
        value: form[key],
        onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
    })

    const inputClass = (key) => `w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2 focus:ring-primary ${errors[key] ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300 focus:border-primary'
        }`

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white min-h-screen">
            <div className="container-padding py-12">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    {/* ── LEFT: Booking Form ── */}
                    <div>
                        <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-bold tracking-wide text-primary ring-1 ring-red-100 mb-4">
                            Free Consultation
                        </span>
                        <h1 className="text-3xl font-black text-slate-900 mb-2">
                            Book Your <span className="text-primary">Free Eye Test</span> Today
                        </h1>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            Schedule a comprehensive 15-point eye exam with our certified optometrists. Precision care for your vision health.
                        </p>

                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center"
                            >
                                <CheckCircle className="mx-auto text-emerald-500 mb-4" size={48} />
                                <h3 className="text-xl font-black text-slate-900 mb-2">Booking Confirmed!</h3>
                                <p className="text-slate-600 text-sm mb-1">
                                    Thank you, <strong>{form.name}</strong>! We'll call you on <strong>+91 {form.phone}</strong> to confirm.
                                </p>
                                <p className="text-slate-500 text-xs mt-4">Appointment: {form.date} at {form.time}</p>
                                <button onClick={() => setSubmitted(false)} className="mt-6 btn-outline text-sm py-2">Book Another</button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 shadow-sm">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                                    <input {...field('name')} placeholder="Enter your full name" className={inputClass('name')} />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                </div>
                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                                    <div className="flex gap-2">
                                        <span className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 font-medium">+91</span>
                                        <div className="flex-1">
                                            <input {...field('phone')} type="tel" placeholder="98765 43210" maxLength={10} className={inputClass('phone')} />
                                        </div>
                                    </div>
                                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                                </div>
                                {/* Date + Time */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Preferred Date</label>
                                        <input {...field('date')} type="date" min={new Date().toISOString().split('T')[0]} className={inputClass('date')} />
                                        {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Preferred Time</label>
                                        <select {...field('time')} className={inputClass('time')}>
                                            <option value="">Select slot</option>
                                            {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary py-4 text-base mt-1">
                                    Confirm Booking →
                                </button>
                                <p className="text-xs text-center text-slate-400">By booking, you agree to our Terms of Service. Your information is safe with us.</p>
                            </form>
                        )}

                        {/* Trust badges */}
                        <div className="grid grid-cols-3 gap-4 mt-8">
                            {[
                                { icon: 'verified_user', label: 'Certified Optometrists' },
                                { icon: 'precision_manufacturing', label: 'Advanced Equipment' },
                                { icon: 'star', label: '4.9/5 Rating' },
                            ].map(({ icon, label }) => (
                                <div key={label} className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 py-4 text-center">
                                    <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
                                    <span className="text-xs font-medium text-slate-600">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT: Map + Info + FAQ ── */}
                    <div className="flex flex-col gap-6">
                        {/* Map placeholder */}
                        <div className="relative h-52 overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
                            <img
                                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"
                                alt="Store location map"
                                className="h-full w-full object-cover opacity-60"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <a
                                    href="https://maps.google.com/?q=New+Delhi"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-800 shadow-lg hover:bg-primary hover:text-white transition-all"
                                >
                                    <MapPin size={15} className="text-primary" />
                                    Open in Google Maps
                                </a>
                            </div>
                        </div>

                        {/* Info cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                                    <span className="material-symbols-outlined text-primary text-xl">store</span>
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm">Visit Store</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">Shop No. 12, Sanyam Chashmalaya,<br />Main Market Road, New Delhi – 110054</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                                    <Phone size={18} className="text-primary" />
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm">Contact Us</h4>
                                <a href="tel:+919340016492" className="text-xs text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5">
                                    <Phone size={12} /> +91 93400 16492
                                </a>
                                <a href="mailto:info@sanyamchashmalaya.com" className="text-xs text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5">
                                    <Mail size={12} /> info@sanyamchashmalaya.com
                                </a>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Clock size={12} /> 10 AM – 9 PM (Daily)
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp CTA */}
                        <a
                            href="https://wa.me/919340016492?text=Hi%20Sanyam%20Chashmalaya!%20I%20need%20help"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-5 hover:bg-emerald-100 transition-colors"
                        >
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Need Quick Help?</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Chat with our support team directly on WhatsApp.</p>
                            </div>
                            <a
                                href="https://wa.me/919340016492"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 transition-colors flex-shrink-0"
                            >
                                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                Chat on WhatsApp
                            </a>
                        </a>

                        {/* FAQ Accordion */}
                        <div>
                            <h3 className="font-bold text-slate-900 mb-4">Common Questions</h3>
                            <div className="flex flex-col gap-2">
                                {FAQS.map(({ q, a }, i) => (
                                    <div key={q} className="rounded-xl border border-slate-200 overflow-hidden">
                                        <button
                                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                            className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                                        >
                                            {q}
                                            <ChevronDown
                                                size={16}
                                                className={`flex-shrink-0 ml-2 transition-transform text-slate-400 ${openFaq === i ? 'rotate-180 text-primary' : ''}`}
                                            />
                                        </button>
                                        <AnimatePresence>
                                            {openFaq === i && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">{a}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
