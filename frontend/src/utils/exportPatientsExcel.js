import { fmtDate } from '../theme.js';
import i18n from '../i18n.js';

// Builds an .xlsx from the full patient roster and triggers a browser download.
// Runs entirely client-side (no backend endpoint) — the data is already fetched via the API.
// exceljs is dynamically imported so its ~900KB doesn't bloat the main app bundle — it's
// only fetched the moment someone actually clicks "Экспорт в Excel". Column headers and the
// status label are read from i18n at call time (not module load) so they follow whichever
// language is active when the export is triggered.
export async function exportPatientsExcel(patients, filenamePrefix = 'patients') {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(i18n.t('export.sheetName'));
  sheet.columns = [
    { header: i18n.t('export.colName'), key: 'name', width: 32 },
    { header: i18n.t('export.colAge'), key: 'age', width: 10 },
    { header: i18n.t('export.colGender'), key: 'gender', width: 8 },
    { header: i18n.t('export.colPhone'), key: 'phone', width: 18 },
    { header: i18n.t('export.colCheckIn'), key: 'checkIn', width: 12 },
    { header: i18n.t('export.colCheckOut'), key: 'checkOut', width: 12 },
    { header: i18n.t('export.colAllergies'), key: 'allergies', width: 22 },
    { header: i18n.t('export.colStatus'), key: 'status', width: 20 },
    { header: i18n.t('export.colLastAnalysis'), key: 'lastAnalysis', width: 16 },
  ];
  sheet.getRow(1).font = { bold: true };

  patients.forEach((p) => {
    sheet.addRow({
      name: p.name,
      age: p.age ?? '',
      gender: p.gender ?? '',
      phone: p.phone ?? '',
      checkIn: fmtDate(p.checkIn),
      checkOut: fmtDate(p.checkOut),
      allergies: p.allergies ?? '',
      status: p.status ? i18n.t(`status.${p.status}`) : '',
      lastAnalysis: fmtDate(p.lastAnalysis),
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
