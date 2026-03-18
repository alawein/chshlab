// chshlab/js/references.js
// Reference data with DOI links, populates reference list and provides inline linking

export const REFS = [
  { key: 'bell1964', authors: 'Bell, J.S.', year: 1964, title: 'On the Einstein-Podolsky-Rosen paradox', journal: 'Physics', volume: '1(3)', pages: '195\u2013200', doi: 'https://doi.org/10.1103/PhysicsPhysique.1.195' },
  { key: 'chsh1969', authors: 'Clauser, J.F., Horne, M.A., Shimony, A., & Holt, R.A.', year: 1969, title: 'Proposed experiment to test local hidden-variable theories', journal: 'Physical Review Letters', volume: '23(15)', pages: '880\u2013884', doi: 'https://doi.org/10.1103/PhysRevLett.23.880' },
  { key: 'pearle1970', authors: 'Pearle, P.M.', year: 1970, title: 'Hidden-variable example based upon data rejection', journal: 'Physical Review D', volume: '2(8)', pages: '1418\u20131425', doi: 'https://doi.org/10.1103/PhysRevD.2.1418' },
  { key: 'freedman1972', authors: 'Freedman, S.J. & Clauser, J.F.', year: 1972, title: 'Experimental test of local hidden-variable theories', journal: 'Physical Review Letters', volume: '28(14)', pages: '938\u2013941', doi: 'https://doi.org/10.1103/PhysRevLett.28.938' },
  { key: 'tsirelson1980', authors: 'Tsirelson, B.S.', year: 1980, title: 'Quantum generalizations of Bell\u2019s inequality', journal: 'Letters in Mathematical Physics', volume: '4', pages: '93\u201398', doi: 'https://doi.org/10.1007/BF00417500' },
  { key: 'aspect1982', authors: 'Aspect, A., Grangier, P., & Roger, G.', year: 1982, title: 'Experimental realization of EPR-Bohm Gedankenexperiment', journal: 'Physical Review Letters', volume: '49(2)', pages: '91\u201394', doi: 'https://doi.org/10.1103/PhysRevLett.49.91' },
  { key: 'eberhard1993', authors: 'Eberhard, P.H.', year: 1993, title: 'Background level and counter efficiencies required for a loophole-free EPR experiment', journal: 'Physical Review A', volume: '47(2)', pages: 'R747', doi: 'https://doi.org/10.1103/PhysRevA.47.R747' },
  { key: 'weihs1998', authors: 'Weihs, G. et al.', year: 1998, title: 'Violation of Bell\u2019s inequality under strict Einstein locality conditions', journal: 'Physical Review Letters', volume: '81(23)', pages: '5039\u20135043', doi: 'https://doi.org/10.1103/PhysRevLett.81.5039' },
  { key: 'hensen2015', authors: 'Hensen, B. et al.', year: 2015, title: 'Loophole-free Bell inequality violation using electron spins separated by 1.3 kilometres', journal: 'Nature', volume: '526', pages: '682\u2013686', doi: 'https://doi.org/10.1038/nature15759' },
  { key: 'giustina2015', authors: 'Giustina, M. et al.', year: 2015, title: 'Significant-loophole-free test of Bell\u2019s theorem with entangled photons', journal: 'Physical Review Letters', volume: '115', pages: '250401', doi: 'https://doi.org/10.1103/PhysRevLett.115.250401' },
  { key: 'shalm2015', authors: 'Shalm, L.K. et al.', year: 2015, title: 'Strong loophole-free test of local realism', journal: 'Physical Review Letters', volume: '115', pages: '250402', doi: 'https://doi.org/10.1103/PhysRevLett.115.250402' },
  { key: 'wang2025', authors: 'Wang, M. et al.', year: 2025, title: 'Bell inequality violation without entanglement', journal: 'Science Advances', volume: '11', pages: 'eads0058', doi: 'https://doi.org/10.1126/sciadv.ads0058' },
];

export function initReferences() {
  const list = document.getElementById('referencesList');
  if (!list) return;

  REFS.forEach(ref => {
    const li = document.createElement('li');
    li.className = 'reference-item';
    li.id = 'ref-' + ref.key;

    const text = document.createTextNode(
      ref.authors + ' (' + ref.year + '). ' + ref.title + '. '
    );
    li.appendChild(text);

    const em = document.createElement('em');
    em.textContent = ref.journal;
    li.appendChild(em);

    const rest = document.createTextNode(
      ', ' + ref.volume + ', ' + ref.pages + '. '
    );
    li.appendChild(rest);

    const link = document.createElement('a');
    link.href = ref.doi;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'DOI';
    li.appendChild(link);

    list.appendChild(li);
  });
}
