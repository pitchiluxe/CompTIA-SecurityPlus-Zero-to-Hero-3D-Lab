import { useState } from 'react';
import { Award, Printer, ShieldCheck } from 'lucide-react';
import { Button } from './ui';

export function CertificateView() {
  const [name, setName] = useState('');
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-bg p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 rounded-lg border border-amber-400/20 bg-amber-500/10 p-4 text-center text-sm text-amber-200">
          <p className="font-semibold">Not an official certification</p>
          <p className="text-amber-200/80">
            This certificate recognizes completion of a self-paced training lab. It is not an
            official CompTIA credential and must not be used for job applications or official
            purposes.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border-8 border-double border-amber-400/50 bg-gradient-to-br from-amber-50 via-white to-amber-50 p-8 text-slate-900 shadow-2xl sm:p-12">
          <div className="mb-8 text-center">
            <Award className="mx-auto h-16 w-16 text-amber-500" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-extrabold uppercase tracking-[0.2em] text-amber-800 sm:text-3xl">
              Certificate of Completion
            </h1>
            <p className="mt-2 text-sm font-medium uppercase tracking-widest text-amber-700/80">
              NetSec Lab — Erick OMARI
            </p>
          </div>

          <p className="text-center text-lg text-slate-700">This certifies that</p>

          <div className="my-4 flex flex-col items-center gap-2 sm:my-6">
            <label htmlFor="cert-name" className="text-xs text-slate-500 print:hidden">
              Enter your name
            </label>
            <input
              id="cert-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full max-w-md border-b-2 border-amber-400 bg-transparent px-4 py-2 text-center text-2xl font-serif font-semibold text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:outline-none sm:text-3xl"
            />
          </div>

          <p className="text-center text-lg text-slate-700">has successfully completed</p>

          <h2 className="my-4 text-center text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
            CompTIA Security+ / Network+ Zero-to-Hero 3D Lab
          </h2>

          <p className="mx-auto max-w-2xl text-center text-sm text-slate-600">
            A hands-on, browser-based 3D cybersecurity training program covering networking
            fundamentals, Security+ (SY0-701) domains, SOC operations, and IAM career skills
            through safe simulations.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-8 border-t border-amber-300 pt-8 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-widest text-slate-500">Date</p>
              <p className="font-semibold text-slate-800">{date}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-4 py-2 text-amber-800">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Verified Lab</span>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-xs uppercase tracking-widest text-slate-500">Course Creator</p>
              <p className="font-semibold text-slate-800">Erick OMARI</p>
            </div>
          </div>

          <div className="mt-8 rounded border-l-4 border-amber-500 bg-amber-100 p-4 text-xs leading-relaxed text-slate-700">
            <strong>Disclaimer:</strong> This certificate is issued by the NetSec Lab training
            platform. It is <em>not</em> an official CompTIA Security+ or Network+ certification and
            is not recognized by CompTIA or employers as a professional credential. The official
            CompTIA Security+ (SY0-701) and Network+ certifications are awarded only through
            CompTIA&lsquo;s authorized testing process.
          </div>

          <div className="mt-6 text-center print:hidden">
            <Button onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print / Save as PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
