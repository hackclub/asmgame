const version = 'v1';

const addResourcesToCache = async (resources) => {
  const cache = await caches.open(version);
  await cache.addAll(resources);
};

self.addEventListener('install', (event) => {
  console.log(`${version} installing...`);

  event.waitUntil(
    addResourcesToCache([
      'index.html',
      'style.css',
      'main.js',
      'puzzles.json',
      'sw-register.js'
    ])
  );
});

const putInCache = async (request, response) => {
    const cache = await caches.open(version);
  
    if (request.method !== 'GET') {
      console.log('Cannot cache non-GET requests');
      return;
    }
  
    await cache.put(request, response);
};
  
const cacheFirst = async (request) => {
    const responseFromCache = await caches.match(request);
  
    if (responseFromCache) {
      return responseFromCache;
    }
  
    const responseFromNetwork = await fetch(request);
  
    putInCache(request, responseFromNetwork.clone());
  
    return responseFromNetwork;
};
  
self.addEventListener('fetch', (event) => {
    event.respondWith(cacheFirst(event.request));
});