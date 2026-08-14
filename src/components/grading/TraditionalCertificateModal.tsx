import React, { useRef, useState } from 'react';
import {
  Award,
  Building2,
  Camera,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  Image as ImageIcon,
  Printer,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react';
import { GradingCandidate, GradingTest } from '../../types';
import { useApp } from '../../context/AppContext';
import { exportToPDF } from '../../utils/exportUtils';

interface TraditionalCertificateModalProps {
  candidate: GradingCandidate;
  test?: GradingTest;
  onClose: () => void;
}

export const isDanRank = (rank?: string): boolean => {
  if (!rank) return false;
  const normalized = rank.toLowerCase().trim();
  return normalized.includes('dan') || /^\d+(st|nd|rd|th)?\s*dan$/i.test(normalized);
};

export const TraditionalCertificateModal: React.FC<TraditionalCertificateModalProps> = ({
  candidate,
  test,
  onClose,
}) => {
  const { currentTenant, branches, students, updateCandidateFederationCertificate, updateStudentPhoto } = useApp();
  const certRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const federationFileInputRef = useRef<HTMLInputElement>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Find student record & branch
  const student = students.find((s) => s.id === candidate.studentId);
  const studentBranch = branches.find((b) => b.id === (test?.branchId || student?.branchId));

  const dojangName = currentTenant?.name || 'World Taekwondo Dojang';
  const branchName = studentBranch?.name ? `${studentBranch.name} Branch` : 'Central Main Dojang';
  const dojangLogo = currentTenant?.logo || studentBranch?.logo || 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=200&auto=format&fit=crop&q=80';
  const certificateNo = candidate.certificateNo || `TKD-CERT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const issueDate = candidate.promotedDate || new Date().toISOString().slice(0, 10);

  // Check if target rank is 1st Dan or higher
  const isDanCandidate = isDanRank(candidate.targetBelt);

  // Handlers
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (certRef.current) {
      exportToPDF(
        certRef.current,
        `${candidate.studentName.replace(/\s+/g, '_')}_${candidate.targetBelt.replace(/\s+/g, '_')}_Certificate.pdf`
      );
    }
  };

  // Student Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateStudentPhoto(candidate.studentId, reader.result);
        showToast('Student profile photo updated successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Federation Certificate Upload Handler (1st Dan & Above)
  const handleFederationFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateCandidateFederationCertificate(candidate.id, reader.result);
        showToast('Official Federation Certificate uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFederationCert = () => {
    updateCandidateFederationCertificate(candidate.id, '');
    showToast('Federation certificate removed.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Page Media Style for Crisp Landscape Printing */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 6mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-5xl bg-stone-50 dark:bg-slate-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden my-4 print:my-0 print:shadow-none print:border-none print:w-full print:max-w-none">
        {/* Top Header Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-slate-100 border-b border-slate-800 print-hidden">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">
                {isDanCandidate ? 'Federation Dan Certification Portal' : 'Official Dojang Belt Certificate (Landscape)'}
              </h3>
              <p className="text-xs text-slate-400">
                Candidate: <span className="font-semibold text-slate-200">{candidate.studentName}</span> ({candidate.targetBelt})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isDanCandidate && (
              <>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  Print (Landscape)
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export PDF
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST BANNER */}
        {toastMessage && (
          <div className="px-6 py-2.5 bg-amber-500 text-slate-950 text-xs font-bold flex items-center justify-between print-hidden">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-900 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* CASE 1: 1ST DAN AND ABOVE - FEDERATION CERTIFICATE UPLOAD PORTAL */}
        {/* ============================================================== */}
        {isDanCandidate ? (
          <div className="p-6 sm:p-10 bg-slate-900 text-slate-100 space-y-6">
            {/* Notice Banner */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
              <Shield className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm">
                <h4 className="font-bold text-amber-300">Federation Issued Dan Rank Certificate</h4>
                <p className="text-slate-300 leading-relaxed">
                  Candidates of <strong className="text-white">1st Dan and above</strong> receive their official Dan rank certificates directly from the Taekwondo Federation (e.g. Kukkiwon / World Taekwondo / National Federation). Upload and archive the official federation-issued certificate here for record keeping and candidate access.
                </p>
              </div>
            </div>

            {/* Candidate Summary Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={dojangLogo}
                  alt={dojangName}
                  className="w-12 h-12 rounded-lg object-contain bg-slate-900 border border-slate-700 p-1"
                />
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Candidate Name</span>
                  <span className="text-base font-bold text-white">{candidate.studentName}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold mb-0.5">Target Belt / Dan Rank</span>
                <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 font-bold rounded-lg border border-amber-500/30 text-xs">
                  {candidate.targetBelt}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold mb-0.5">Dojang & Branch</span>
                <span className="text-white font-semibold block">{dojangName}</span>
                <span className="text-slate-400 font-mono text-[11px]">{branchName}</span>
              </div>
            </div>

            {/* Federation Certificate File Upload & Preview Section */}
            <div className="p-6 bg-slate-950/60 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Uploaded Federation Certificate Document
                </h4>
                {candidate.federationCertificateUrl && (
                  <button
                    onClick={handleRemoveFederationCert}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove Certificate
                  </button>
                )}
              </div>

              {candidate.federationCertificateUrl ? (
                <div className="space-y-4">
                  <div className="relative group max-h-[480px] overflow-hidden rounded-xl border border-slate-700 bg-slate-900 flex items-center justify-center p-2">
                    <img
                      src={candidate.federationCertificateUrl}
                      alt="Official Federation Certificate"
                      className="max-h-[440px] w-auto object-contain rounded-lg shadow-lg"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <a
                      href={candidate.federationCertificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Full Size
                    </a>
                    <a
                      href={candidate.federationCertificateUrl}
                      download={`${candidate.studentName.replace(/\s+/g, '_')}_Federation_Certificate`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download Official File
                    </a>
                    <button
                      onClick={() => federationFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-amber-400" />
                      Replace Certificate File
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => federationFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-900/50 hover:bg-slate-900 rounded-xl p-10 text-center cursor-pointer transition-all space-y-3 group"
                >
                  <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-200">
                      Click or drag to upload the Federation Issued Certificate
                    </h5>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports high-resolution PNG, JPG, WEBP, or scanned certificate document images.
                    </p>
                  </div>
                  <button className="px-4 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-xl inline-block shadow-sm">
                    Select Certificate File
                  </button>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={federationFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFederationFileUpload}
                className="hidden"
              />
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* CASE 2: UNDER 1ST DAN - LANDSCAPE TRADITIONAL DOJAN CERTIFICATE */
          /* ============================================================== */
          <div
            ref={certRef}
            className="relative w-full p-8 sm:p-12 bg-[#faf8f2] dark:bg-[#181612] text-stone-900 dark:text-stone-100 font-serif select-none print:p-6 print:bg-white print:text-black"
            style={{
              backgroundImage: 'radial-gradient(#e2dac8 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* Outer Traditional Dual Gold Border Frame */}
            <div className="relative border-4 border-amber-800/80 dark:border-amber-600/70 p-2.5 rounded-sm">
              <div className="border-2 border-dashed border-amber-900/40 dark:border-amber-500/40 p-6 sm:p-10 text-center relative bg-stone-50/95 dark:bg-slate-900/95 shadow-inner min-h-[580px] flex flex-col justify-between">
                
                {/* Traditional Decorative Corner Flourishes */}
                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-800 dark:border-amber-500" />
                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-800 dark:border-amber-500" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-800 dark:border-amber-500" />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-800 dark:border-amber-500" />

                {/* BACKGROUND WATERMARK DOJANG LOGO */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none p-12">
                  <img
                    src={dojangLogo}
                    alt="Dojang Logo Watermark"
                    className="max-h-[360px] w-auto object-contain grayscale"
                  />
                </div>

                {/* TOP CERTIFICATE HEADER */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between border-b border-amber-900/20 dark:border-amber-500/20 pb-3 mb-4">
                    <div className="flex items-center gap-3 text-left font-sans">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-amber-800/60 dark:border-amber-500/60 bg-white p-1 shadow-sm shrink-0 flex items-center justify-center">
                        <img
                          src={dojangLogo}
                          alt={dojangName}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-900 dark:text-amber-300">
                          {dojangName}
                        </div>
                        <div className="text-[11px] text-stone-600 dark:text-stone-400 flex items-center gap-1 font-semibold">
                          <Building2 className="w-3.5 h-3.5 text-amber-700" />
                          <span>{branchName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="tracking-widest text-amber-800 dark:text-amber-400 font-sans text-xs font-bold uppercase">
                        대한태권도협회 公認 昇級證書
                      </div>
                    </div>

                    <div className="text-right font-sans">
                      <div className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">
                        Certificate Serial No.
                      </div>
                      <div className="text-xs font-mono font-bold text-amber-900 dark:text-amber-400">
                        {certificateNo}
                      </div>
                    </div>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black text-amber-950 dark:text-amber-200 tracking-wider uppercase drop-shadow-sm my-1">
                    Certificate of Promotion
                  </h1>
                  <p className="text-[11px] sm:text-xs font-sans tracking-widest text-stone-600 dark:text-stone-400 uppercase font-bold mb-6">
                    Taekwondo Official Belt Rank Distinction
                  </p>
                </div>

                {/* MAIN CONTENT BODY (LANDSCAPE TWO-COLUMN / CENTERED GRID) */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-4">
                  {/* LEFT: STUDENT PROFILE PHOTO FRAME */}
                  <div className="md:col-span-3 flex flex-col items-center justify-center">
                    <div className="relative group">
                      <div className="w-28 h-36 sm:w-32 sm:h-40 rounded-xl overflow-hidden border-4 border-amber-800/80 dark:border-amber-500/80 shadow-md bg-stone-200 dark:bg-slate-800 flex items-center justify-center relative">
                        {student?.photoUrl ? (
                          <img
                            src={student.photoUrl}
                            alt={candidate.studentName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-stone-400 p-2 text-center">
                            <User className="w-12 h-12 stroke-[1.5] text-amber-800/40" />
                            <span className="text-[10px] font-sans font-bold uppercase mt-1 text-stone-500">
                              Student Photo
                            </span>
                          </div>
                        )}

                        {/* Interactive Photo Upload Overlay (Hidden on Print) */}
                        <button
                          onClick={() => photoInputRef.current?.click()}
                          className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-amber-300 font-sans text-[10px] font-bold gap-1 print-hidden cursor-pointer"
                        >
                          <Camera className="w-5 h-5 text-amber-400" />
                          <span>Change Photo</span>
                        </button>
                      </div>

                      {/* Hidden File Input for Student Photo */}
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                    <span className="text-[10px] font-sans text-stone-500 mt-2 font-semibold">
                      Official Candidate Record
                    </span>
                  </div>

                  {/* RIGHT: CONFERMENT STATEMENT & PROMOTED RANK */}
                  <div className="md:col-span-9 space-y-4 text-stone-800 dark:text-stone-200 text-center md:text-left leading-relaxed">
                    <p className="italic text-stone-600 dark:text-stone-400 text-xs sm:text-sm">
                      This officially certifies that martial artist
                    </p>

                    <div className="py-1 border-b-2 border-amber-900/30 dark:border-amber-500/30 inline-block pr-6">
                      <span className="text-2xl sm:text-3xl font-bold font-sans text-stone-900 dark:text-stone-50 tracking-wide uppercase">
                        {candidate.studentName}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-serif leading-relaxed">
                      having demonstrated physical discipline, technical mastery of Poomsae forms, sparring courage, board breaking power, and exemplary Taekwondo etiquette, is hereby officially promoted to the rank of:
                    </p>

                    {/* Promoted Belt Rank Badge */}
                    <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-amber-950 text-amber-100 dark:bg-amber-900/90 rounded-xl shadow-md border border-amber-600/50">
                      <Shield className="w-6 h-6 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-[9px] uppercase font-sans tracking-widest text-amber-300 font-bold">
                          PROMOTED RANK
                        </div>
                        <div className="text-lg sm:text-xl font-black font-sans tracking-wide">
                          {candidate.targetBelt}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] sm:text-xs font-sans text-stone-600 dark:text-stone-400 leading-snug">
                      Conferred under authority of <strong className="text-stone-900 dark:text-stone-200">{dojangName}</strong> (<span className="font-semibold">{branchName}</span>) in full compliance with World Taekwondo technical grading standards.
                    </p>
                  </div>
                </div>

                {/* BOTTOM SIGNATURES, DATE & RED DOJAN SEAL */}
                <div className="relative z-10 pt-4 border-t border-amber-900/20 dark:border-amber-500/20 grid grid-cols-2 gap-6 items-end mt-2">
                  {/* Date & Verification Block */}
                  <div className="text-left font-sans space-y-1">
                    <div className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">
                      Date of Issue
                    </div>
                    <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 font-mono">
                      {issueDate}
                    </div>
                    <div className="pt-1 flex items-center gap-1.5 text-[10px] text-stone-600 dark:text-stone-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Verified Official Dojang Registrar</span>
                    </div>
                  </div>

                  {/* Grandmaster Signature & Seal Stamp Block */}
                  <div className="text-right font-sans relative">
                    {/* Traditional Red Dojang Seal Stamp Graphic */}
                    <div className="absolute -top-6 right-6 w-16 h-16 border-2 border-red-700 text-red-700 rounded-sm p-1 flex items-center justify-center font-black text-[10px] rotate-12 opacity-85 pointer-events-none uppercase tracking-tighter shadow-sm">
                      도장인<br />認印
                    </div>

                    <div className="italic font-serif text-base text-amber-950 dark:text-amber-200 border-b border-stone-400 dark:border-stone-600 pb-0.5 inline-block min-w-[170px]">
                      {test?.examinerName || 'Grandmaster Sung-Min Kim'}
                    </div>
                    <div className="text-[11px] font-bold text-stone-800 dark:text-stone-300 uppercase tracking-wider mt-1">
                      Chief Technical Examiner
                    </div>
                    <div className="text-[9px] text-stone-500 font-sans">
                      {dojangName} Board of Examiners
                    </div>
                  </div>
                </div>

                {/* FOOTER MOTTO */}
                <div className="mt-4 pt-2 text-[10px] font-sans text-stone-500 tracking-widest uppercase font-bold border-t border-amber-900/10 dark:border-amber-500/10">
                  COURTESY • INTEGRITY • PERSEVERANCE • SELF-CONTROL • INDOMITABLE SPIRIT
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
