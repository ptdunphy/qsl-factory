/**
 * Parses raw ADIF content into an array of QSO objects.
 * Handles standard ADIF tags: <TAG:LENGTH>DATA
 */
export function parseAdif(adifContent) {
  const qsos = [];
  
  // Normalize line endings and split by <EOR> (End of Record)
  const records = adifContent.toUpperCase().split(/<EOR>/gi);

  records.forEach((record) => {
    if (!record.trim()) return; // Skip empty records

    const qso = {};
    
    // Regex to match <TAG:LENGTH>VALUE or <TAG>VALUE
    // 1. Tag name, 2. Length (optional), 3. Value
    const tagRegex = /<(\w+)(?::(\d+))?>([^<]*)/g;
    
    let match;
    while ((match = tagRegex.exec(record)) !== null) {
      const tag = match[1];
      const length = match[2] ? parseInt(match[2], 10) : null;
      let value = match[3] ? match[3].trim() : "";

      // If length is specified in ADIF, strictly slice that amount
      // (Safety for multi-line comments or binary data)
      if (length !== null && value.length > length) {
        value = value.substring(0, length);
      }

      // Map standard ADIF fields to our internal schema
      switch (tag) {
        case 'CALL': qso.callsign = value; break;
        case 'QSO_DATE': qso.date = formatDate(value); break;
        case 'TIME_ON': qso.time = formatTime(value); break;
        case 'BAND': qso.band = value; break;
        case 'MODE': qso.mode = value; break;
        case 'RST_SENT': qso.rst = value; break;
      }
    }

    if (qso.callsign) {
      qsos.push(qso);
    }
  });

  return qsos;
}

// Helpers to format ADIF YYYYMMDD to human readable
function formatDate(dateStr) {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6)}`;
}

function formatTime(timeStr) {
  if (!timeStr || timeStr.length < 4) return timeStr;
  return `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}`;
}