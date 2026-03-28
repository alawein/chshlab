export function renderKatexDisplays(root = document) {
  if (typeof katex === 'undefined') return;

  root.querySelectorAll('.math-display').forEach((element) => {
    const latex = element.dataset.latex;
    if (!latex) return;

    katex.render(latex, element, {
      displayMode: true,
      throwOnError: false,
    });
  });
}
