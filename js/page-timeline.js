export function initTimeline() {
  const container = document.getElementById('timelineContainer');
  if (!container) return;

  const line = document.createElement('div');
  line.className = 'timeline-line';
  container.appendChild(line);

  const nodes = [
    { year: '1964', title: 'Bell', note: 'Inequality derived; all detectors assumed perfect.', status: 'established' },
    { year: '1969', title: 'CHSH', note: '\u03b7 issue becomes experimentally relevant.', status: 'established' },
    { year: '1982', title: 'Aspect', note: 'First convincing Bell test, but loopholes remain.', status: 'established' },
    { year: '1993', title: 'Eberhard', note: '\u03b7_c \u2248 82.8% proven necessary.', status: 'established' },
    { year: '2015', title: 'Loophole-free', note: 'Delft, NIST, and Vienna close the main Bell loopholes.', status: 'resolved' },
    { year: '2025', title: 'Wang et al.', note: 'S = 2.275 reported at \u03b7 \u2248 10^-18.', status: 'contested' },
    { year: '2025', title: 'This rebuttal', note: 'Post-selection artifact reproduced and bounded.', status: 'resolved' },
  ];

  nodes.forEach((nodeData) => {
    const node = document.createElement('div');
    node.className = 'timeline-node reveal';

    const year = document.createElement('span');
    year.className = 'timeline-node__year';
    year.textContent = nodeData.year;

    const title = document.createElement('span');
    title.className = 'timeline-node__title';
    title.textContent = nodeData.title;

    const note = document.createElement('p');
    note.className = 'timeline-node__note';
    note.textContent = nodeData.note;

    const badge = document.createElement('span');
    badge.className = `timeline-node__badge timeline-node__badge--${nodeData.status}`;
    badge.textContent = nodeData.status;

    node.appendChild(year);
    node.appendChild(title);
    node.appendChild(note);
    node.appendChild(badge);
    container.appendChild(node);
  });
}
