(function () {
  const seeds = document.querySelectorAll('.seed');
  seeds.forEach((seed) => {
    const r = Math.round(Math.random() * 360);
    const x = Math.round(Math.random() * 40) - 20;
    const y = Math.round(Math.random() * 40) - 20;
    seed.style.transform = `rotate(${r}deg) translate(${x}px, ${y}px)`;
  });
})();
