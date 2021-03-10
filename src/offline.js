const retryButton = document.getElementById('retry-button');

retryButton.addEventListener('click', window.WALC.load);
window.addEventListener('online', () => setTimeout(window.WALC.load, 5000));
