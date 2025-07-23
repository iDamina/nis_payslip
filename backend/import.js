import mongoose from 'mongoose';
import csv from 'csvtojson';
import dotenv from 'dotenv';
import path from 'path';
import Payslip from './models/Payslip.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const CSV_FILE = path.join('./data/august_2019_nis.csv'); // change as needed

const importCSVBulk = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const rawData = await csv().fromFile(CSV_FILE);
    
    // Debug: Log first few rows to check data format
    console.log('📊 Sample data from CSV:');
    console.log('First row:', JSON.stringify(rawData[0], null, 2));
    if (rawData.length > 1) {
      console.log('Second row:', JSON.stringify(rawData[1], null, 2));
    }
    
    // Helper function to clean field values
    const cleanFieldValue = (value) => {
      if (!value || value === '' || value === 'N/A' || value === 'n/a' || value === 'NA' || value === 'null' || value === 'undefined') {
        return null;
      }
      return typeof value === 'string' ? value.trim() : value;
    };
    
    const operations = [];
    const processedKeys = new Set();

    for (const row of rawData) {
      const ippis_no = row.ippis_no?.trim() || null;
      const service_no = row.service_no?.trim() || null;
      const year = Number(row.year);
      const month = row.month?.trim();

      const key = ippis_no || service_no;
      if (!key || !year || !month || processedKeys.has(`${key}-${year}-${month}`)) continue;

      processedKeys.add(`${key}-${year}-${month}`);
      const filter = { $or: [{ ippis_no }, { service_no }] };

      // Extract officer root-level info (ONLY constant fields that never change)
      const officerInfo = {
        name: cleanFieldValue(row.employee_name),
        ippis_no,
        service_no,
        gender: cleanFieldValue(row.gender),
        tax_state: cleanFieldValue(row.tax_state),
        date_of_first_appointment: cleanFieldValue(row.date_of_first_appointment),
        date_of_birth: cleanFieldValue(row.birthdate),
        retirement_date: cleanFieldValue(row.retirement_date)
      };

      // Clean record for the 'records' array (includes all monthly changing data)
      // This will include: paygrade, grade, step, designation, bank_name, account_number, 
      // pfa_name, pension_pin, and all salary/deduction fields
      const cleanedRecord = {
        ...row,
        year,
        month,
      };

      // Clean and convert record values
      for (let recordKey in cleanedRecord) {
        let value = cleanedRecord[recordKey];
        
        // Handle N/A and empty values - but preserve actual "N/A" text for certain fields
        if (value === '' || value === 'null' || value === 'undefined' || value === null) {
          cleanedRecord[recordKey] = null;
        }
        // For specific fields, keep "N/A" as is (don't convert to null)
        else if ((value === 'N/A' || value === 'n/a' || value === 'NA') && 
                 ['paygrade', 'grade_name', 'grade_level', 'step', 'designation', 'bank_name', 'account_number', 'pfa_name', 'pension_pin', 'com_id'].includes(recordKey)) {
          cleanedRecord[recordKey] = value; // Keep as "N/A"
        }
        // Convert other N/A values to null for numeric/salary fields
        else if (value === 'N/A' || value === 'n/a' || value === 'NA') {
          cleanedRecord[recordKey] = null;
        }
        // Convert numeric strings to numbers (but not for specific text fields)
        else if (!isNaN(value) && value !== '' && value !== null && 
                 !['paygrade', 'grade_name', 'designation', 'bank_name', 'account_number', 'pfa_name', 'pension_pin', 'com_id', 'month', 'employee_name', 'gender', 'tax_state'].includes(recordKey)) {
          cleanedRecord[recordKey] = Number(value);
        }
        // Trim string values
        else if (typeof value === 'string') {
          cleanedRecord[recordKey] = value.trim();
        }
      }

      // IMPROVED APPROACH: Single operation with proper aggregation
      operations.push({
        updateOne: {
          filter,
          update: [
            {
              $set: {
                // Always update officer info
                ...officerInfo,
                // Handle records array with proper logic
                records: {
                  $cond: {
                    if: { $eq: [{ $type: "$records" }, "array"] },
                    then: {
                      $concatArrays: [
                        // Keep records that don't match current year/month
                        {
                          $filter: {
                            input: "$records",
                            as: "record",
                            cond: {
                              $not: {
                                $and: [
                                  { $eq: ["$record.year", year] },
                                  { $eq: ["$record.month", month] }
                                ]
                              }
                            }
                          }
                        },
                        // Add the new record
                        [cleanedRecord]
                      ]
                    },
                    else: [cleanedRecord] // If no records array exists, create with current record
                  }
                }
              }
            }
          ],
          upsert: true
        }
      });
    }

    if (operations.length > 0) {
      const result = await Payslip.bulkWrite(operations);
      console.log(`✅ Bulk import completed. Operations: ${operations.length}, Inserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`);
    } else {
      console.log('⚠️ No valid data found to import.');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error importing CSV:', err);
    process.exit(1);
  }
};

importCSVBulk();