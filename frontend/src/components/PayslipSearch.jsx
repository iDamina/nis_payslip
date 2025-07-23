import { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import { Search, Download, User, Calendar, DollarSign, FileText, LogOut, Building, CreditCard } from 'lucide-react';
import logo from '/immigrationLogo.png';
import { logout } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Footer from './Footer';

const forceString = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return typeof value === 'string' ? value : String(value);
};


const formatCurrency = (val) => {
  const num = isNaN(Number(val)) ? 0 : Number(val);
  return num.toLocaleString('en-NG', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  });
};

const PayslipSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [payslip, setPayslip] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const token = localStorage.getItem('token');

    const response = await axios.get('http://localhost:5000/api/payslip', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { id: searchTerm, year, month },
    });

    const result = response.data;

    // Check if we got a valid payslip (whether via IPPIS or service number)
    if (result && (result.ippis_no || result.service_no)) {
      setPayslip(result);
      toast.success('Payslip retrieved successfully');
    } else {
      setPayslip(null);
      setError('No payslip found for the specified criteria. Please check your details and try again.');
      toast.error('No matching record found.');
    }
  } catch (err) {
    console.error('❌ Error fetching payslip:', err);
    setPayslip(null);
    setError('No payslip found for the specified criteria. Please check your details and try again.');
    toast.error('Failed to fetch payslip.');
  } finally {
    setLoading(false);
  }
};

  const handleDownload = async () => {
  if (!payslip) return;

  setDownloading(true);

  try {
    await new Promise(resolve => setTimeout(resolve, 500));

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    let y = 15;

    // Watermark
    const addWatermark = () => {
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.1 }));
      doc.setTextColor(128, 128, 128);
      doc.setFontSize(50);
      doc.setFont(undefined, 'bold');
      doc.text('CONFIDENTIAL - NIS', pageWidth / 2, pageHeight / 2, {
        angle: 45,
        align: 'center',
        baseline: 'middle'
      });
      doc.restoreGraphicsState();
      doc.setTextColor(0, 0, 0);
    };

    addWatermark();

    // Logo (optional)
    try {
      const logoImg = '/logo1.jpg';
      doc.addImage(logoImg, 'PNG', pageWidth / 2 - 15, y, 20, 20);
      y += 30;
    } catch {
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('[LOGO]', pageWidth / 2, y, { align: 'center' });
      y += 10;
    }

    // Header
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('FEDERAL GOVERNMENT OF NIGERIA', pageWidth / 2, y, { align: 'center' });
    y += 6;

    doc.setFontSize(12);
    doc.text('NIGERIA IMMIGRATION SERVICE', pageWidth / 2, y, { align: 'center' });
    y += 6;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('EMPLOYEE PAYSLIP', pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFont(undefined, 'bold');
    doc.text(`${forceString(payslip.month).toUpperCase()} ${forceString(payslip.year)}`, pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // PERSONAL INFO
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('PERSONAL INFORMATION', margin, y);
    y += 8;

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');

    const personalInfo = [
      ['Full Name:', payslip.name],
      ['IPPIS Number:', payslip.ippis_no],
      ['Service Number:', payslip.service_no],
      ['Pay Grade:', payslip.paygrade],
      ['Grade Level:', payslip.grade],
      ['Step:', payslip.step],
      ['Designation:', payslip.designation],
      ['Gender:', payslip.gender],
      ['Tax State:', payslip.tax_state],
      ['First Appointment:', payslip.date_of_first_appointment],
      ['Date of Birth:', payslip.date_of_birth],
      ['Retirement Date:', payslip.retirement_date]
    ];

    const startPersonalY = y;
    const columnWidth = (pageWidth - margin * 2 - 10) / 2;
    let rowHeights = [];

    personalInfo.forEach(([label, val], i) => {
      const isLeft = i % 2 === 0;
      const colX = isLeft ? margin : margin + columnWidth + 10;
      const rowIndex = Math.floor(i / 2);

      const valStr = forceString(val);
      const maxWidth = columnWidth - 40;
      const lines = doc.splitTextToSize(valStr, maxWidth);
      
      // Calculate height needed for this item
      const itemHeight = Math.max(4, lines.length * 3.5); // Reduced from 4 to 3.5
      if (!rowHeights[rowIndex]) rowHeights[rowIndex] = 0;
      rowHeights[rowIndex] = Math.max(rowHeights[rowIndex], itemHeight);
    });

    // Now render with proper spacing
    let currentY = startPersonalY;
    personalInfo.forEach(([label, val], i) => {
      const isLeft = i % 2 === 0;
      const colX = isLeft ? margin : margin + columnWidth + 10;
      const rowIndex = Math.floor(i / 2);
      
      // Calculate Y position based on accumulated row heights
      const rowY = startPersonalY + rowHeights.slice(0, rowIndex).reduce((sum, h) => sum + h + 2, 0);

      const valStr = forceString(val);
      const maxWidth = columnWidth - 40;
      const lines = doc.splitTextToSize(valStr, maxWidth);
      
      doc.setFont(undefined, 'bold');
      doc.text(label, colX, rowY);
      doc.setFont(undefined, 'normal');
      
      lines.forEach((line, lineIndex) => {
        doc.text(line, colX + 35, rowY + (lineIndex * 3.5));
      });
    });

    // Update Y position
    y = startPersonalY + rowHeights.reduce((sum, h) => sum + h + 2, 0) + 6;

    // BANK INFO
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('BANK INFORMATION', margin, y);
    y += 8;

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');

    const bankInfo = [
      ['Bank Name:', payslip.bank_name],
      ['Account Number:', payslip.account_number],
      ['PFA Name:', payslip.pfa_name],
      ['Pension PIN:', payslip.pension_pin]
    ];

    const startBankY = y;
    let bankRowHeights = [];

    // Calculate heights first
    bankInfo.forEach(([label, val], i) => {
      const rowIndex = Math.floor(i / 2);
      const valStr = forceString(val);
      const maxWidth = columnWidth - 40;
      const lines = doc.splitTextToSize(valStr, maxWidth);
      
      const itemHeight = Math.max(4, lines.length * 3.5);
      if (!bankRowHeights[rowIndex]) bankRowHeights[rowIndex] = 0;
      bankRowHeights[rowIndex] = Math.max(bankRowHeights[rowIndex], itemHeight);
    });

    // Now render
    bankInfo.forEach(([label, val], i) => {
      const isLeft = i % 2 === 0;
      const colX = isLeft ? margin : margin + columnWidth + 10;
      const rowIndex = Math.floor(i / 2);
      
      const rowY = startBankY + bankRowHeights.slice(0, rowIndex).reduce((sum, h) => sum + h + 2, 0);

      const valStr = forceString(val);
      const maxWidth = columnWidth - 40;
      const lines = doc.splitTextToSize(valStr, maxWidth);

      doc.setFont(undefined, 'bold');
      doc.text(label, colX, rowY);
      doc.setFont(undefined, 'normal');
      
      lines.forEach((line, lineIndex) => {
        doc.text(line, colX + 35, rowY + (lineIndex * 3.5));
      });
    });

    y = startBankY + bankRowHeights.reduce((sum, h) => sum + h + 2, 0) + 6;

    // Separator
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    const earningsX = margin;
    const deductionsX = margin + columnWidth + 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('EARNINGS', earningsX, y);
    doc.text('DEDUCTIONS', deductionsX, y);
    y += 6;

    doc.setFontSize(8);
    doc.text('Description', earningsX, y);
    doc.text('Amount (N)', earningsX + columnWidth - 30, y);
    doc.text('Description', deductionsX, y);
    doc.text('Amount (N)', deductionsX + columnWidth - 30, y);
    y += 4;

    doc.setLineWidth(0.3);
    doc.line(earningsX, y, earningsX + columnWidth, y);
    doc.line(deductionsX, y, deductionsX + columnWidth, y);
    y += 6;

    doc.setFont(undefined, 'normal');

    const earnings = [
      ['Basic Salary', payslip.basic],
      ['Rent Allowance', payslip.rent],
      ['Employer Pension', payslip.employer_pension],
      ['Peculiar Allowance', payslip.peculiar_allowance],
      ['Shift Duty Allowance', payslip.shift_duty_allowance],
      ['NHIS', payslip.nhis],
      ['Professional Allowance', payslip.professional_allowance],
      ['Arrears', payslip.arrears],
      ['Non Clinical Allowance', payslip.non_clinical_allowance],
      ['Arrears 18 Apr to 30 Nov', payslip.arrears_18_apr_to_30_nov],
    ];

      const deductions = [
        ['Employee Pension', payslip.employee_pension, (payslip.employee_pension || 0) > 0],
        ['Employer Pension', payslip.employer_pension || payslip.employer_pension_2, (payslip.employer_pension || payslip.employer_pension_2 || 0) > 0],
        ['NHF', payslip.nhf, (payslip.nhf || 0) > 0],
        ['NHIS', payslip.nhis || payslip.nhis_additional, (payslip.nhis || payslip.nhis_additional || 0) > 0],
        ['PAYE Tax', payslip.paye_tax, (payslip.paye_tax || 0) > 0],
        ['OAGF Overpayment', payslip['01_oagf_overpayment'] || payslip.oagf_overpayment, (payslip['01_oagf_overpayment'] || payslip.oagf_overpayment || 0) > 0],
        ['D01 Overpayment', payslip.d01_overpayment, (payslip.d01_overpayment || 0) > 0],
        ['Union Dues', payslip.d32_oagf_conpass_union_dues, (payslip.d32_oagf_conpass_union_dues || 0) > 0],
        ['Rock Consumer Credit', payslip.d35_rock_consumer_credit, (payslip.d35_rock_consumer_credit || 0) > 0],
        ['Rock Consumer Credit 2', payslip.d36_rock_consumer_credit_2, (payslip.d36_rock_consumer_credit_2 || 0) > 0],
        ['Rock Consumer Credit 3', payslip.d45_rock_consumer_credit_3, (payslip.d45_rock_consumer_credit_3 || 0) > 0],
        ['Salary Refund', payslip.d47_salary_refund, (payslip.d47_salary_refund || 0) > 0],
        ['OAGF Fed Mortgage', payslip.l53_oagf_fed_mortgage_renovation, (payslip.l53_oagf_fed_mortgage_renovation || 0) > 0],
        ['Fed Mortgage Renovation', payslip.l53_fed_mortgage_renovation, (payslip.l53_fed_mortgage_renovation || 0) > 0],
        ['Fed Housing Renovation', payslip.l49_fed_housing_renovation, (payslip.l49_fed_housing_renovation || 0) > 0],
        ['Fed Housing Loan', payslip.l47_fed_gov_housing_loan_scheme, (payslip.l47_fed_gov_housing_loan_scheme || 0) > 0],
        ['ASHS', payslip.l06_ashs, (payslip.l06_ashs || 0) > 0],
        ['Finance Car Scheme', payslip.l05_finance_car_scheme, (payslip.l05_finance_car_scheme || 0) > 0],
        ['FGHS', payslip.l10_fghs, (payslip.l10_fghs || 0) > 0],
        ['Coop Electronics', payslip.l52_coop_electronic_commodities, (payslip.l52_coop_electronic_commodities || 0) > 0],
        ['Coop Soft Loan', payslip.d68_cooperative_soft_loan_deduction, (payslip.d68_cooperative_soft_loan_deduction || 0) > 0],
        ['NIS Coop Target', payslip.d57_nis_cooperative_target_deduction, (payslip.d57_nis_cooperative_target_deduction || 0) > 0],
        ['Cooperative Loan', payslip.d56_cooperative_loan_deduction, (payslip.d56_cooperative_loan_deduction || 0) > 0],
        ['NIS Coop Commodities', payslip.d52_nis_cooperative_commodities, (payslip.d52_nis_cooperative_commodities || 0) > 0],
        ['NIS Coop Share', payslip.d49_nis_coop_share_deduction, (payslip.d49_nis_coop_share_deduction || 0) > 0],
        ['NIS Multipurpose Coop', payslip.d48_nis_multipurpose_coop_savings, (payslip.d48_nis_multipurpose_coop_savings || 0) > 0],
        ['Other Deductions', payslip.other_deduction, (payslip.other_deduction || 0) > 0],
        ['Employer Pencon AXA Mansard', payslip.employer_pencon_axa_mansard, (payslip.employer_pencon_axa_mansard || 0) > 0],
        ['Employer Pencon APT Pensions', payslip.employer_pencon_aptpensions, (payslip.employer_pencon_aptpensions || 0) > 0],
        ['Employer Pencon AIIC Open', payslip.employer_pencon_aiicopen, (payslip.employer_pencon_aiicopen || 0) > 0],
        ['Employer Pencon Lead Pensure', payslip.employer_pencon_leadpensure, (payslip.employer_pencon_leadpensure || 0) > 0],
        ['Employee Pencon AXA Mansard', payslip.employee_pencon_axa_mansard, (payslip.employee_pencon_axa_mansard || 0) > 0],
        ['Employee Pencon APT Pensions', payslip.employee_pencon_aptpensions, (payslip.employee_pencon_aptpensions || 0) > 0],
        ['Employee Pencon AIIC Open', payslip.employee_pencon_aiicopen, (payslip.employee_pencon_aiicopen || 0) > 0],
        ['Employee Pencon Anchor Pen', payslip.employee_pencon_anchorpen, (payslip.employee_pencon_anchorpen || 0) > 0],
        ['D77 Keke Loan', payslip.d77_keke_loan, (payslip.d77_keke_loan || 0) > 0],
        ['JTF Refund', payslip.jtf_refund, (payslip.jtf_refund || 0) > 0],
        ['D54 Coop Subscription', payslip.d54_coop_subscription, (payslip.d54_coop_subscription || 0) > 0],
        ['Total Gross Earnings', payslip.total_gross_earnings, true], // Always show
        ['Total Deductions', payslip.total_deductions, true], // Always show
      ];

    let earningsY = y;
    let earningsRowIndex = 0;
    earnings.forEach(([label, val]) => {
      if ((val || 0) > 0) {
        // Add alternating background
        if (earningsRowIndex % 2 === 0) {
          doc.setFillColor(220, 220, 220); // Light gray
          doc.rect(earningsX, earningsY - 2, columnWidth, 4, 'F');
        }
        
        doc.text(forceString(label), earningsX, earningsY);
        doc.text(forceString(formatCurrency(val)), earningsX + columnWidth - 30, earningsY, { align: 'right' });
        earningsY += 5;
        earningsRowIndex++;
      }
    });
    
    let deductionsY = y;
    let deductionsRowIndex = 0;
    deductions.forEach(([label, val]) => {
      if ((val || 0) > 0) {
        // Add alternating background
        if (deductionsRowIndex % 2 === 0) {
          doc.setFillColor(220, 220, 220); // Light gray
          doc.rect(deductionsX, deductionsY - 2, columnWidth, 4, 'F');
        }
        
        doc.text(forceString(label), deductionsX, deductionsY);
        doc.text(forceString(formatCurrency(val)), deductionsX + columnWidth - 30, deductionsY, { align: 'right' });
        deductionsY += 5;
        deductionsRowIndex++;
      }
    });
    
    y = Math.max(earningsY, deductionsY) + 3;

    doc.setLineWidth(0.3);
    doc.line(earningsX, y, earningsX + columnWidth, y);
    doc.line(deductionsX, y, deductionsX + columnWidth, y);
    y += 6;

    doc.setFont(undefined, 'bold');
    doc.text('TOTAL EARNINGS', earningsX, y);
    doc.text(forceString(formatCurrency(payslip.total_earnings)), earningsX + columnWidth - 30, y, { align: 'right' });
    doc.text('TOTAL DEDUCTIONS', deductionsX, y);
    doc.text(forceString(formatCurrency(payslip.total_deductions)), deductionsX + columnWidth - 30, y, { align: 'right' });
    y += 12;

    doc.setFillColor(240, 248, 255);
    doc.rect(margin, y - 3, pageWidth - margin * 2, 18, 'F');

    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.rect(margin, y - 3, pageWidth - margin * 2, 18, 'S');

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('NET PAY:', pageWidth / 2 - 30, y + 8);
    doc.setFontSize(16);
    doc.text(`N${forceString(formatCurrency(payslip.net_pay))}`, pageWidth / 2 + 10, y + 8);

    doc.setTextColor(0, 0, 0);
    y += 25;

    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text(`Generated by: Immigration Payslip Manager... @ 2025 `, pageWidth / 2, footerY, { align: 'center' });

    const fileName = `NIS_Payslip_${payslip.name?.replace(/\s+/g, '_')}_${payslip.month}_${payslip.year}.pdf`;
    doc.save(fileName);

    toast.success('Professional payslip downloaded successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to download payslip. Please try again.');
  } finally {
    setDownloading(false);
  }
};


  const getCurrentYear = () => new Date().getFullYear();
  const getYearOptions = () => {
    const years = [];
    for (let i = 2018; i <= 2024; i++) { // Fixed range 2018-2024
      years.push(i);
    }
    return years.reverse(); // Show most recent years first
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Modern Header */}
      <header className="bg-white shadow-lg border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src={logo} alt="NIS Logo" className="h-12 w-12 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-green-800">Nigeria Immigration Service</h1>
                <p className="text-sm text-gray-600">Payslip Management System</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-md"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {/* Search Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
              <Search className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Search Payslip</h2>
              <p className="text-gray-600">Enter employee details to retrieve payslip information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search Term Input */}
              <div className="md:col-span-1">
                <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="searchTerm"
                    placeholder="IPPIS or Service Number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Year Select */}
              <div className="md:col-span-1">
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                    required
                  >
                    <option value="">Select Year</option>
                    {getYearOptions().map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Month Select */}
              <div className="md:col-span-1">
                <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
                  Month
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    id="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                    required
                  >
                    <option value="">Select Month</option>
                    {[
                      'January', 'February', 'March', 'April',
                      'May', 'June', 'July', 'August',
                      'September', 'October', 'November', 'December'
                    ].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Search Payslip</span>
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm flex items-center space-x-2">
                <FileText size={16} />
                <span>{error}</span>
              </p>
            </div>
          )}
        </div>

        {/* Payslip Results */}
        {payslip && (
          <>
          {console.log("✅ Payslip keys received:", Object.keys(payslip))}
          {console.log("🧾 Payslip raw data:", payslip)}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Payslip Details</h3>
                    <p className="text-green-100">{payslip.month} {payslip.year}</p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="bg-white hover:bg-gray-50 disabled:bg-gray-200 text-green-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-md"
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Download Payslip</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Personal Information */}
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-5 h-5 text-green-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Personal Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Full Name', value: payslip.name },
                    { label: 'IPPIS Number', value: payslip.ippis_no },
                    { label: 'Service Number', value: payslip.service_no },
                    { label: 'Pay Grade', value: payslip.paygrade },
                    { label: 'Grade Level', value: payslip.grade },
                    { label: 'Step', value: payslip.step },
                    { label: 'Designation', value: payslip.designation },
                    { label: 'Gender', value: payslip.gender },
                    { label: 'Tax State', value: payslip.tax_state },
                    { label: 'First Appointment', value: payslip.date_of_first_appointment },
                    { label: 'Date of Birth', value: payslip.date_of_birth },
                    { label: 'Retirement Date', value: payslip.retirement_date }
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank Information */}
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                  <Building className="w-5 h-5 text-green-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Bank Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Bank Name', value: payslip.bank_name },
                    { label: 'Account Number', value: payslip.account_number },
                    { label: 'PFA Name', value: payslip.pfa_name },
                    { label: 'Pension PIN', value: payslip.pension_pin }
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Earnings */}
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h4 className="text-lg font-semibold text-green-800">Total Earnings</h4>
                  </div>
                  <p className="text-2xl font-bold text-green-700">N{formatCurrency(payslip.total_earnings)}</p>
                  <div className="mt-4 space-y-2 text-sm">
                    {(payslip.basic || 0) > 0 && <div className="flex justify-between"><span>Basic:</span><span>₦{formatCurrency(payslip.basic)}</span></div>}
                    {(payslip.rent || 0) > 0 && <div className="flex justify-between"><span>Rent:</span><span>₦{formatCurrency(payslip.rent)}</span></div>}
                    {(payslip.employer_pension || 0) > 0 && <div className="flex justify-between"><span>Employer Pension:</span><span>₦{formatCurrency(payslip.employer_pension)}</span></div>}
                    {(payslip.peculiar_allowance || 0) > 0 && <div className="flex justify-between"><span>Peculiar Allowance:</span><span>₦{formatCurrency(payslip.peculiar_allowance)}</span></div>}
                    {(payslip.shift_duty_allowance || 0) > 0 && <div className="flex justify-between"><span>Shift Duty:</span><span>₦{formatCurrency(payslip.shift_duty_allowance)}</span></div>}
                    {(payslip.nhis || 0) > 0 && <div className="flex justify-between"><span>NHIS:</span><span>₦{formatCurrency(payslip.nhis)}</span></div>}
                    {(payslip.professional_allowance || 0) > 0 && <div className="flex justify-between"><span>Professional Allowance:</span><span>₦{formatCurrency(payslip.professional_allowance)}</span></div>}
                  </div>
                </div>

                {/* Deductions */}
                <div className="bg-red-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <CreditCard className="w-5 h-5 text-red-600" />
                    <h4 className="text-lg font-semibold text-red-800">Total Deductions</h4>
                  </div>
                  <p className="text-2xl font-bold text-red-700">N{formatCurrency(payslip.total_deductions)}</p>
                  <div className="mt-4 space-y-2 text-sm">
                    {(payslip.employee_pencon || 0) > 0 && <div className="flex justify-between"><span>Employee Pension:</span><span>₦{formatCurrency(payslip.employee_pension)}</span></div>}
                    {(payslip.employer_pencon || 0) > 0 && <div className="flex justify-between"><span>Employer Pension:</span><span>₦{formatCurrency(payslip.employer_pension)}</span></div>}
                    {(payslip.nhf || 0) > 0 && <div className="flex justify-between"><span>NHF:</span><span>₦{formatCurrency(payslip.nhf)}</span></div>}
                    {(payslip.nhis || 0) > 0 && <div className="flex justify-between"><span>NHIS:</span><span>₦{formatCurrency(payslip.nhis)}</span></div>}
                    {(payslip.paye_tax || 0) > 0 && <div className="flex justify-between"><span>PAYE Tax:</span><span>₦{formatCurrency(payslip.paye_tax)}</span></div>}
                    {(payslip['01_oagf_overpayment'] || 0) > 0 && <div className="flex justify-between"><span>OAGF Overpayment:</span><span>₦{formatCurrency(payslip['01_oagf_overpayment'])}</span></div>}
                    {(payslip.d01_overpayment || 0) > 0 && <div className="flex justify-between"><span>D01 Overpayment:</span><span>₦{formatCurrency(payslip.d01_overpayment)}</span></div>}
                    {(payslip.d32_oagf_conpass_union_dues || 0) > 0 && <div className="flex justify-between"><span>Union Dues:</span><span>₦{formatCurrency(payslip.d32_oagf_conpass_union_dues)}</span></div>}
                    {(payslip.d35_rock_consumer_credit || 0) > 0 && <div className="flex justify-between"><span>Rock Consumer Credit:</span><span>₦{formatCurrency(payslip.d35_rock_consumer_credit)}</span></div>}
                    {(payslip.d36_rock_consumer_credit_2 || 0) > 0 && <div className="flex justify-between"><span>Rock Consumer Credit 2:</span><span>₦{formatCurrency(payslip.d36_rock_consumer_credit_2)}</span></div>}
                    {(payslip.d45_rock_consumer_credit_3 || 0) > 0 && <div className="flex justify-between"><span>Rock Consumer Credit 3:</span><span>₦{formatCurrency(payslip.d45_rock_consumer_credit_3)}</span></div>}
                    {(payslip.d47_salary_refund || 0) > 0 && <div className="flex justify-between"><span>Salary Refund:</span><span>₦{formatCurrency(payslip.d47_salary_refund)}</span></div>}
                    {(payslip.l53_oagf_fed_mortgage_renovation || 0) > 0 && <div className="flex justify-between"><span>OAGF Fed Mortgage:</span><span>₦{formatCurrency(payslip.l53_oagf_fed_mortgage_renovation)}</span></div>}
                    {(payslip.l53_fed_mortgage_renovation || 0) > 0 && <div className="flex justify-between"><span>Fed Mortgage Renovation:</span><span>₦{formatCurrency(payslip.l53_fed_mortgage_renovation)}</span></div>}
                    {(payslip.l49_fed_housing_renovation || 0) > 0 && <div className="flex justify-between"><span>Fed Housing Renovation:</span><span>₦{formatCurrency(payslip.l49_fed_housing_renovation)}</span></div>}
                    {(payslip.l47_fed_gov_housing_loan_scheme || 0) > 0 && <div className="flex justify-between"><span>Fed Housing Loan:</span><span>₦{formatCurrency(payslip.l47_fed_gov_housing_loan_scheme)}</span></div>}
                    {(payslip.l06_ashs || 0) > 0 && <div className="flex justify-between"><span>ASHS:</span><span>₦{formatCurrency(payslip.l06_ashs)}</span></div>}
                    {(payslip.l05_finance_car_scheme || 0) > 0 && <div className="flex justify-between"><span>Finance Car Scheme:</span><span>₦{formatCurrency(payslip.l05_finance_car_scheme)}</span></div>}
                    {(payslip.l10_fghs || 0) > 0 && <div className="flex justify-between"><span>FGHS:</span><span>₦{formatCurrency(payslip.l10_fghs)}</span></div>}
                    {(payslip.l52_coop_electronic_commodities || 0) > 0 && <div className="flex justify-between"><span>Coop Electronics:</span><span>₦{formatCurrency(payslip.l52_coop_electronic_commodities)}</span></div>}
                    {(payslip.d68_cooperative_soft_loan_deduction || 0) > 0 && <div className="flex justify-between"><span>Coop Soft Loan:</span><span>₦{formatCurrency(payslip.d68_cooperative_soft_loan_deduction)}</span></div>}
                    {(payslip.d57_nis_cooperative_target_deduction || 0) > 0 && <div className="flex justify-between"><span>NIS Coop Target:</span><span>₦{formatCurrency(payslip.d57_nis_cooperative_target_deduction)}</span></div>}
                    {(payslip.d56_cooperative_loan_deduction || 0) > 0 && <div className="flex justify-between"><span>Cooperative Loan:</span><span>₦{formatCurrency(payslip.d56_cooperative_loan_deduction)}</span></div>}
                    {(payslip.d52_nis_cooperative_commodities || 0) > 0 && <div className="flex justify-between"><span>NIS Coop Commodities:</span><span>₦{formatCurrency(payslip.d52_nis_cooperative_commodities)}</span></div>}
                    {(payslip.d49_nis_coop_share_deduction || 0) > 0 && <div className="flex justify-between"><span>NIS Coop Share:</span><span>₦{formatCurrency(payslip.d49_nis_coop_share_deduction)}</span></div>}
                    {(payslip.d48_nis_multipurpose_coop_savings || 0) > 0 && <div className="flex justify-between"><span>NIS Multipurpose Coop:</span><span>₦{formatCurrency(payslip.d48_nis_multipurpose_coop_savings)}</span></div>}
                  </div>
                </div>

                {/* Net Pay */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <h4 className="text-lg font-semibold text-blue-800">Net Pay</h4>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">₦{formatCurrency(payslip.net_pay)}</p>
                  <p className="text-sm text-blue-600 mt-2">Amount credited to account</p>
                </div>
              </div>
            </div>
          </div>
          </>
        )}
        
      </main>

      <Footer className="bg-white shadow-lg border-t border-green-200" />
    </div>
  );
};

export default PayslipSearch;