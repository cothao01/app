import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function exportToCsv(events, babyName) {
  if (!events || events.length === 0) return;

  const headers = ['Date', 'Time', 'Type', 'Details', 'Duration', 'Notes'];
  const rows = events.map(e => {
    const d = new Date(e.timestamp);
    const date = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    const time = d.toLocaleTimeString();
    let details = '';
    let duration = '';

    if (e.type === 'feed') {
      details = e.details?.feedType || '';
      if (e.details?.amount) details += ` ${e.details.amount}${e.details.unit || 'oz'}`;
      if (e.details?.side) details += ` (${e.details.side})`;
      if (e.details?.food) details += ` - ${e.details.food}`;
    } else if (e.type === 'diaper') {
      details = e.details?.diaperType || '';
      if (e.details?.color) details += ` - ${e.details.color}`;
    } else if (e.type === 'sleep') {
      if (e.endTimestamp) {
        const dur = new Date(e.endTimestamp) - new Date(e.timestamp);
        const mins = Math.floor(dur / 60000);
        duration = `${Math.floor(mins / 60)}h ${mins % 60}m`;
      }
    } else if (e.type === 'growth') {
      if (e.details?.weight) details += `Weight: ${e.details.weight}${e.details.weightUnit || 'lbs'}`;
      if (e.details?.height) details += ` Height: ${e.details.height}${e.details.heightUnit || 'in'}`;
    }

    return [date, time, e.type, details, duration, e.notes || ''].map(v =>
      `"${String(v).replace(/"/g, '""')}"`
    ).join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const fileName = `${babyName || 'baby'}_tracker_${new Date().toISOString().split('T')[0]}.csv`;
  const filePath = FileSystem.documentDirectory + fileName;

  await FileSystem.writeAsStringAsync(filePath, csv);
  await Sharing.shareAsync(filePath, { mimeType: 'text/csv', dialogTitle: 'Export Baby Data' });
}
