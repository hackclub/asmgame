const registerWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('asmgame.sw.js');
        console.log('Service worker registration succeeded:', registration);
      } catch (error) {
        alert(`Service Worker Registration failed with ${error}`);
      }
    }
};

registerWorker();