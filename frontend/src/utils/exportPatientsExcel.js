import { fmtDate } from '../theme.js';

const STATUS_LABEL = { green: 'Норма', amber: 'Небольшое отклонение', red: 'Требует внимания' };

const COLUMNS = [
  { header: 'ФИО', key: 'name', width: 32 },
  { header: 'Возраст', key: 'age', width: 10 },
  { header: 'Пол', key: 'gender', width: 8 },
  { header: 'Телефон', key: 'phone', width: 18 },
  { header: 'Заезд', key: 'checkIn', width: 12 },
  { header: 'Выезд', key: 'checkOut', width: 12 },
  { header: 'Аллергии', key: 'allergies', width: 22 },
  { header: 'Статус', key: 'status', width: 20 },
  { header: 'Последний анализ', key: 'lastAnalysis', width: 16 },
];

// Builds an .xlsx from the full patient roster and triggers a browser download.
// Runs entirely client-side (no backend endpoint) — the data is already fetched via the API.
// exceljs is dynamically imported so its ~900KB doesn't bloat the main app bundle — it's
// only fetched the moment someone actually clicks "Экспорт в Excel".
export async function exportPatientsExcel(patients, filenamePrefix = 'patients') {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Пациенты');
  sheet.columns = COLUMNS;
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
      status: STATUS_LABEL[p.status] || p.status || '',
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
