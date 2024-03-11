const version = 'v1';

self.addEventListener('install', (event) => {
  console.log(`${version} installed`);
});

const putInCache = async (request, response) => {
    const cache = await caches.open(version);
  
    if (request.method !== 'GET') {
      console.log('Cannot cache non-GET requests');
      return;
    }
  
    await cache.put(request, response);
};
  
const networkFirst = async (request) => {
    const responseFromNetwork = await fetch(request);

    putInCache(request, responseFromNetwork.clone());
  
    if (responseFromNetwork) {
      return responseFromNetwork;
    }
  
    const responseFromCache = await caches.match(request);
  
    return responseFromCache;
};
  
self.addEventListener('fetch', (event) => {
    event.respondWith(networkFirst(event.request));
});