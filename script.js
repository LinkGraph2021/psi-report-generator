const pastedImagesMap = {};

document.querySelectorAll('.pasteZone').forEach(zone => {
  zone.setAttribute('contenteditable', 'true');

  zone.addEventListener('paste', (e) => {
    e.preventDefault();
    const fieldName = zone.dataset.name;
    pastedImagesMap[fieldName] = pastedImagesMap[fieldName] || [];

    const items = (e.clipboardData || window.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") === 0) {
        const blob = items[i].getAsFile();
        pastedImagesMap[fieldName].push(blob);

        const p = document.createElement('p');
        p.textContent = `📷 Pasted image ${pastedImagesMap[fieldName].length}`;
        zone.appendChild(p);
      }
    }
  });
});

document.getElementById('reportForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const statusDiv = document.getElementById('status');
  const downloadDiv = document.getElementById('download');

  statusDiv.innerText = 'Generating report... Please wait.';
  downloadDiv.innerHTML = '';

  // Add pasted images to form data
  for (const [fieldName, images] of Object.entries(pastedImagesMap)) {
    images.forEach((imgBlob, i) => {
      formData.append(fieldName, imgBlob, `${fieldName}_pasted_${i}.png`);
    });
  }

  try {
    const res = await fetch('https://psi-report-backend.onrender.com/generate-report', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Failed to generate report');

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'performance-report.docx';
    a.innerText = '📄 Click here to download the report';
    downloadDiv.appendChild(a);
    statusDiv.innerText = '✅ Report ready!';

  } catch (err) {
    statusDiv.innerText = '❌ Error generating report.';
    console.error(err);
  }
});
