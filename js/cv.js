const printButton = document.getElementById('printCV');
if (printButton) {
    printButton.hidden = false;
    printButton.addEventListener('click', () => window.print());
}
