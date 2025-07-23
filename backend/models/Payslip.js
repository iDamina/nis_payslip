import mongoose from 'mongoose';

// Sub-schema for monthly records
const recordSchema = new mongoose.Schema({
  year: Number,
  month: String,
  basic: Number,
  rent: Number,
  arrears: Number,
  non_clinical_allowance: Number,
  arrears_18_apr_to_30_nov: Number,
  employer_pencon: Number,
  hazard_allowance: Number,
  professional_allowance: Number,
  nhis: Number,
  shift_duty_allowance: Number,
  call_duty_allowance: Number,
  paye_tax: Number,
  employee_pencon: Number,
  employer_pencon_2: Number,
  nhf: Number,
  nhis_additional: Number,
  overpayment: Number,
  rock_consumer_credit_1: Number,
  rock_consumer_credit_2: Number,
  rock_consumer_credit_3: Number,
  salary_refund: Number,
  federal_mortgage_renovation_1: Number,
  federal_mortgage_renovation_2: Number,
  federal_housing_renovation: Number,
  fed_gov_housing_loan_scheme: Number,
  ashs: Number,
  finance_car_scheme: Number,
  fghs: Number,
  fgshlb: Number,
  paye_refund: Number,
  access_pay_day_loan: Number,
  fidelity_bank_loan: Number,
  paye_tax_ossg_ag: Number,
  paye_tax_imsbir: Number,
  paye_tax_bybir: Number,
  other_deduction: Number,
  employer_pencon_axa_mansard: Number,
  employer_pencon_aptpensions: Number,
  employer_pencon_aiicopen: Number,
  employer_pencon_leadpensure: Number,
  employee_pencon_axa_mansard: Number,
  employee_pencon_aptpensions: Number,
  employee_pencon_aiicopen: Number,
  employee_pencon_anchorpen: Number,
  d77_keke_loan: Number,
  jtf_refund: Number,
  d54_coop_subscription: Number,
  coop_electronic_commodities: Number,
  coop_soft_loan_deduction: Number,
  coop_target_deduction: Number,
  coop_loan_deduction: Number,
  coop_commodities: Number,
  coop_share_deduction: Number,
  total_gross_earnings: Number,
  total_deductions: Number,
  net_payment: Number
}, { _id: false });

// Main schema per officer
const payslipSchema = new mongoose.Schema({
  ippis_no: String,
  service_no: String,
  employee_name: String,
  designation: String,
  grade_name: String,
  grade_level: String,
  step: String,
  department: String,
  mda: String,
  gender: String,
  date_of_first_appointment: String,
  birthdate: String,
  tax_state: String,
  bank_name: String,
  account_number: String,
  pfa_name: String,
  pencom_id: String, // same as pension_pin if you wish
  records: [recordSchema]
}, {
  strict: false // Allows extra fields from CSV if present
});

// Export model using existing collection 'payrolls'
const Payslip = mongoose.model('Payslip', payslipSchema, 'payrolls');
export default Payslip;