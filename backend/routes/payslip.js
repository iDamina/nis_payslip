import express from 'express';
import Payslip from '../models/Payslip.js';

const router = express.Router();

router.get('/payslip', async (req, res) => {
  const { id, year, month } = req.query;

  console.log("✅ Query received (cleaned):", { id, year, month });

  if (!id || !year || !month) {
    return res.status(400).json({ message: 'Missing required query parameters: id, year, month' });
  }

  try {
    const officer = await Payslip.findOne({
      $or: [
        { ippis_no: { $regex: `^${id}$`, $options: 'i' } },
        { service_no: id }
      ]
    }).lean();

    if (!officer) {
      console.log("Officer not found for id:", id);
      return res.status(404).json({ message: 'Officer not found' });
    }

    console.log("All Records:", officer.records);
    console.log("Query Year Type:", typeof year, "Value:", year);
    console.log("Query Month Type:", typeof month, "Value:", month);
    officer.records.forEach(r => {
      console.log("Record Year Type:", typeof r.year, "Value:", r.year);
      console.log("Record Month Type:", typeof r.month, "Value:", r.month);
    });

    const record = officer.records.find(
      r =>
        String(r.year) === String(year).trim() &&
        String(r.month).toLowerCase() === String(month).toLowerCase().trim()
    );

    console.log("Matched Record:", record);

    if (!record) {
      console.log("No record found for year:", year, "month:", month);
      return res.status(404).json({ message: 'Payslip not found for given month/year' });
    }

    const normalized = {
      name: officer.name || officer.employee_name || record.employee_name || 'N/A',
      ippis_no: officer.ippis_no || record.ippis_no || 'N/A',
      service_no: officer.service_no || record.service_no || 'N/A',
      gender: officer.gender || record.gender || 'N/A',
      tax_state: officer.tax_state || record.tax_state || 'N/A',
      date_of_first_appointment: officer.date_of_first_appointment || record.date_of_first_appointment || 'N/A',
      date_of_birth: officer.date_of_birth || record.birthdate || 'N/A',
      retirement_date: officer.retirement_date || record.retirement_date || null,
      paygrade: record.grade_name || record.paygrade || 'N/A',
      grade: record.grade_level || record.grade || 'N/A',
      step: record.step || 'N/A',
      designation: record.designation || 'N/A',
      bank_name: record.bank_name || 'N/A',
      account_number: record.account_number || 'N/A',
      pfa_name: record.pfa_name || 'N/A',
      pension_pin: record.com_id || record.pension_pin || 'N/A',
      basic: record.basic || 0,
      rent: record.rent || 0,
      employer_pension: record.employer_pencon || record.employer_pencon_2 || 0,
      peculiar_allowance: record.hazard_allowance || 0,
      shift_duty_allowance: record.shift_duty_allowance || 0,
      nhis: record.nhis || record.nhis_additional || 0,
      professional_allowance: record.professional_allowance || 0,
      employee_pension: record.employee_pencon || 0,
      nhf: record.nhf || 0,
      paye_tax: record.paye_tax || 0,
      '01_oagf_overpayment': record.overpayment || 0,
      d01_overpayment: record.overpayment || 0,
      d32_oagf_conpass_union_dues: record.union_dues || 0,
      d35_rock_consumer_credit: record.rock_consumer_credit_1 || 0,
      d36_rock_consumer_credit_2: record.rock_consumer_credit_2 || 0,
      d45_rock_consumer_credit_3: record.rock_consumer_credit_3 || 0,
      d47_salary_refund: record.salary_refund || 0,
      l53_oagf_fed_mortgage_renovation: record.federal_mortgage_renovation_1 || 0,
      l53_fed_mortgage_renovation: record.federal_mortgage_renovation_2 || 0,
      l49_fed_housing_renovation: record.federal_housing_renovation || 0,
      l47_fed_gov_housing_loan_scheme: record.fed_gov_housing_loan_scheme || 0,
      l06_ashs: record.ashs || 0,
      l05_finance_car_scheme: record.finance_car_scheme || 0,
      l10_fghs: record.fghs || 0,
      l52_coop_electronic_commodities: record.coop_electronic_commodities || 0,
      d68_cooperative_soft_loan_deduction: record.coop_soft_loan_deduction || 0,
      d57_nis_cooperative_target_deduction: record.coop_target_deduction || 0,
      d56_cooperative_loan_deduction: record.coop_loan_deduction || 0,
      d52_nis_cooperative_commodities: record.coop_commodities || 0,
      d49_nis_coop_share_deduction: record.coop_share_deduction || 0,
      d48_nis_multipurpose_coop_savings: record.multipurpose_coop_savings || 0,
      other_deductions: record.other_deductions || 0,
      total_earnings: record.total_gross_earnings || 0,
      total_deductions: record.total_deductions || 0,
      net_pay: record.net_payment || 0,
      year: record.year || year,
      month: record.month || month
    };

    console.log("📦 Final normalized response:", normalized);
    res.json(normalized);
  } catch (err) {
    console.error('❌ Server Error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;