import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { TakeEntry, ProductionMeta } from '../types';

export async function generateAndShareCameraReport(meta: ProductionMeta, takes: TakeEntry[]): Promise<void> {
  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const totalTakes = takes.length;
  const goodTakes = takes.filter((t) => t.isGood).length;

  const rowsHtml = takes
    .map((t) => {
      const isMulti = t.cameras && t.cameras.length > 1;
      const camText = isMulti
        ? t.cameras!.map((c) => c.camera.split(' ')[0]).join('<br/>')
        : t.camera || '-';
      const rollText = isMulti
        ? t.cameras!.map((c) => c.card).join('<br/>')
        : t.card || '-';
      const clipText = isMulti
        ? t.cameras!.map((c) => c.clipName || '-').join('<br/>')
        : t.clipName || '-';
      const lensText = isMulti
        ? t.cameras!.map((c) => (c.lens ? c.lens + 'mm' : '-')).join('<br/>')
        : t.lens
        ? t.lens + 'mm'
        : '-';
      const fstopText = isMulti
        ? t.cameras!.map((c) => (c.tstop ? 'T' + c.tstop : '-')).join('<br/>')
        : t.tstop
        ? 'T' + t.tstop
        : '-';
      const shutterText = isMulti
        ? t.cameras!.map((c) => c.shutter || '-').join('<br/>')
        : t.shutter || '-';
      const isoText = isMulti
        ? t.cameras!.map((c) => c.iso || '-').join('<br/>')
        : t.iso || '-';
      const filterText = isMulti
        ? t.cameras!.map((c) => c.filter || '-').join('<br/>')
        : t.filter || '-';

      return `
    <tr class="${t.isGood ? 'good-row' : ''}">
      <td style="text-align:center;font-weight:bold;">${t.slate}</td>
      <td style="text-align:center;font-weight:bold;">${t.scene}</td>
      <td style="text-align:center;">${t.shot}</td>
      <td style="text-align:center;font-weight:bold;">${t.take}</td>
      <td style="text-align:center;color:${t.isGood ? '#166534' : '#9ca3af'};font-weight:bold;">${t.isGood ? '★ GOOD' : '—'}</td>
      <td style="font-family:monospace;font-weight:600;">${clipText}</td>
      <td style="text-align:center;font-weight:bold;">${camText}</td>
      <td style="text-align:center;font-weight:600;">${rollText}</td>
      <td style="text-align:center;">${lensText}</td>
      <td style="text-align:center;">${shutterText}</td>
      <td style="text-align:center;">${isoText}</td>
      <td style="text-align:center;">${fstopText}</td>
      <td style="text-align:center;">${filterText}</td>
      <td style="text-align:center;">${t.fps || '-'}</td>
      <td style="font-size:10px;">${t.notes || ''}</td>
    </tr>
  `;
    })
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Camera Report - ${meta.production || 'Hong Films'}</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: #111827;
      margin: 0;
      padding: 0;
    }
    .header-box {
      border: 2px solid #111827;
      margin-bottom: 12px;
      padding: 8px 12px;
    }
    .top-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid #111827;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .top-title h1 {
      margin: 0;
      font-size: 18px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .cam-rep-badge {
      font-size: 14px;
      font-weight: bold;
      background: #111827;
      color: #fff;
      padding: 3px 10px;
      border-radius: 3px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 8px;
      font-size: 10px;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      font-size: 8.5px;
      text-transform: uppercase;
      color: #6b7280;
      font-weight: 700;
    }
    .meta-val {
      font-weight: 600;
      font-size: 11px;
      color: #000;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
    }
    th {
      background: #f3f4f6;
      border: 1px solid #374151;
      padding: 6px 4px;
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      border: 1px solid #d1d5db;
      padding: 5px 4px;
      vertical-align: middle;
      line-height: 1.4;
    }
    tr.good-row {
      background-color: #f0fdf4;
    }
    .footer-summary {
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #4b5563;
      border-top: 1px solid #e5e7eb;
      padding-top: 6px;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div class="top-title">
      <h1>🎬 HONGLOG &bull; ${meta.production || 'CAMERA REPORT'}</h1>
      <span class="cam-rep-badge">CAMERA REPORT SHEET</span>
    </div>
    <div class="meta-grid">
      <div class="meta-item"><span class="meta-label">Production Title</span><span class="meta-val">${meta.production || '-'}</span></div>
      <div class="meta-item"><span class="meta-label">Prod #</span><span class="meta-val">${meta.prodNumber || '-'}</span></div>
      <div class="meta-item"><span class="meta-label">Date</span><span class="meta-val">${dateStr}</span></div>
      <div class="meta-item"><span class="meta-label">FPS</span><span class="meta-val">${meta.projectFps || '24'} fps</span></div>

      <div class="meta-item"><span class="meta-label">Director</span><span class="meta-val">${meta.director || '-'}</span></div>
      <div class="meta-item"><span class="meta-label">D.O.P</span><span class="meta-val">${meta.dop || '-'}</span></div>
      <div class="meta-item"><span class="meta-label">1st AC</span><span class="meta-val">${meta.firstAc || '-'}</span></div>
      <div class="meta-item"><span class="meta-label">2nd AC</span><span class="meta-val">${meta.secondAc || '-'}</span></div>

      <div class="meta-item"><span class="meta-label">Format / Codec</span><span class="meta-val">${meta.fileFormat || '-'}</span></div>
      <div class="meta-item"><span class="meta-label">Aspect Ratio</span><span class="meta-val">${meta.aspectRatio || '-'}</span></div>
      <div class="meta-item"><span class="meta-label">LUT</span><span class="meta-val">${meta.lut || '-'}</span></div>
      <div class="meta-item"><span class="meta-label">Camera / Media</span><span class="meta-val">${meta.cameraId || '-'} &bull; ${meta.mediaId || '-'}</span></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:4%;">Slate</th>
        <th style="width:5%;">Scene</th>
        <th style="width:4%;">Shot</th>
        <th style="width:4%;">Take</th>
        <th style="width:7%;">Status</th>
        <th style="width:13%;">Clip Name</th>
        <th style="width:6%;">Cam</th>
        <th style="width:6%;">Roll</th>
        <th style="width:6%;">Lens</th>
        <th style="width:6%;">Shutter</th>
        <th style="width:5%;">ISO</th>
        <th style="width:5%;">T-Stop</th>
        <th style="width:7%;">Filter</th>
        <th style="width:4%;">FPS</th>
        <th style="width:18%;">Remarks / Notes</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="15" style="text-align:center;padding:20px;color:#9ca3af;">Belum ada take yang tercatat</td></tr>'}
    </tbody>
  </table>

  <div class="footer-summary">
    <div>Total Take: <strong>${totalTakes}</strong> | Good Takes: <strong style="color:#166534;">${goodTakes}</strong></div>
    <div>Generated by <strong>Honglog</strong> &bull; Hong Films App Platform</div>
  </div>
</body>
</html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  }
}
