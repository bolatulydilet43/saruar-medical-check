import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { fmtDateShort, CARD_STYLE, MODAL_OVERLAY_STYLE, PRIMARY_BUTTON_STYLE, SECONDARY_BUTTON_STYLE } from '../theme.js';
import ErrorBanner from '../components/ErrorBanner.jsx';

function mondayOf(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  return d;
}
function toIso(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export default function Appointments() {
  const { t } = useTranslation();
  const weekdayLabels = t('appointments.weekdays', { returnObjects: true });
  const [staff, setStaff] = useState([]);
  const [appts, setAppts] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [bookingDay, setBookingDay] = useState(null);
  const [bookingPatient, setBookingPatient] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const [bookingError, setBookingError] = useState('');

  function load() {
    setError('');
    Promise.all([
      api.getStaff().then(setStaff),
      api.getPatients().then(setPatients),
      api.getAppointments().then(setAppts),
    ]).catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, []);

  const today = toIso(new Date());
  const base = useMemo(() => {
    const b = mondayOf(new Date());
    b.setDate(b.getDate() + weekOffset * 7);
    return b;
  }, [weekOffset]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = toIso(d);
      return { iso, weekday: weekdayLabels[i], dateLabel: fmtDateShort(iso), isToday: iso === today };
    });
  }, [base, today, weekdayLabels]);

  const doctorLegend = staff.filter((s) => s.role === 'doctor');

  async function saveBooking() {
    if (!bookingDay || !bookingPatient || !bookingDoctor || !bookingTime) return;
    setBookingError('');
    try {
      const appt = await api.addAppointment({ date: bookingDay, time: bookingTime, patient: bookingPatient, doctorId: bookingDoctor });
      setAppts((a) => [...a, appt]);
      setBookingDay(null);
    } catch (err) {
      setBookingError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{t('appointments.title')}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setWeekOffset((w) => w - 1)} aria-label={t('appointments.prevWeek')} style={{ width: 32, height: 32, border: '1px solid #E5E7EB', background: 'white', borderRadius: 8, cursor: 'pointer' }}>‹</button>
          <div style={{ fontSize: 13.5, color: '#374151', minWidth: 150, textAlign: 'center' }}>{fmtDateShort(weekDays[0]?.iso)} – {fmtDateShort(weekDays[6]?.iso)}</div>
          <button onClick={() => setWeekOffset((w) => w + 1)} aria-label={t('appointments.nextWeek')} style={{ width: 32, height: 32, border: '1px solid #E5E7EB', background: 'white', borderRadius: 8, cursor: 'pointer' }}>›</button>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      <div style={{ display: 'flex', gap: 14, margin: '14px 0 20px', flexWrap: 'wrap' }}>
        {doctorLegend.map((dl) => (
          <div key={dl.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#6B7280' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: dl.color }} />{dl.name}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 12 }}>
        {weekDays.map((day) => {
          const dayAppts = appts.filter((a) => a.date === day.iso).sort((a, b) => a.time.localeCompare(b.time));
          return (
            <div key={day.iso} style={{ ...CARD_STYLE, border: day.isToday ? '1.5px solid #1D9E75' : CARD_STYLE.border, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #EDF0EF' }}>
                <div style={{ fontSize: 11.5, color: '#9CA3AF', textTransform: 'uppercase' }}>{day.weekday}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{day.dateLabel}</div>
              </div>
              <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 160 }}>
                {dayAppts.map((ap) => (
                  <div key={ap.id} style={{ background: '#F5F8F7', borderLeft: `3px solid ${ap.color}`, borderRadius: 6, padding: '6px 8px' }}>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{ap.time}</div>
                    <div style={{ fontSize: 12 }}>{ap.patient}</div>
                  </div>
                ))}
                <button
                  onClick={() => { setBookingDay(day.iso); setBookingPatient(''); setBookingDoctor(''); setBookingTime(''); setBookingError(''); }}
                  style={{ marginTop: 'auto', padding: 6, background: '#FAFBFB', border: '1px dashed #D8DEDC', borderRadius: 8, fontSize: 11.5, color: '#6B7280', cursor: 'pointer' }}
                >
                  {t('appointments.addBooking')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {bookingDay && (
        <div style={MODAL_OVERLAY_STYLE}>
          <div style={{ background: 'white', borderRadius: 16, padding: '26px 28px', width: 360, boxShadow: '0 24px 48px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>{t('appointments.newBookingTitle', { date: fmtDateShort(bookingDay) })}</div>

            <ErrorBanner message={bookingError} />

            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{t('appointments.fieldPatient')}</label>
            <select value={bookingPatient} onChange={(e) => setBookingPatient(e.target.value)} style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13.5, marginBottom: 12 }}>
              <option value="">{t('appointments.choosePatient')}</option>
              {patients.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>

            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{t('appointments.fieldDoctor')}</label>
            <select value={bookingDoctor} onChange={(e) => setBookingDoctor(e.target.value)} style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13.5, marginBottom: 12 }}>
              <option value="">{t('appointments.chooseDoctor')}</option>
              {doctorLegend.map((dl) => <option key={dl.id} value={dl.id}>{dl.name}</option>)}
            </select>

            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{t('appointments.fieldTime')}</label>
            <input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13.5, marginBottom: 18 }} />

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setBookingDay(null)} style={{ ...SECONDARY_BUTTON_STYLE, flex: 1, padding: 10, borderRadius: 8, fontSize: 13.5 }}>{t('common.cancel')}</button>
              <button onClick={saveBooking} style={{ ...PRIMARY_BUTTON_STYLE, flex: 1, padding: 10, borderRadius: 8, fontSize: 13.5 }}>{t('appointments.book')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
