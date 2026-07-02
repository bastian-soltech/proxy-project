export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Range, Authorization',
                'Access-Control-Max-Age': '86400',
             
            },
        });
    }

    try {
        const { searchParams } = new URL(request.url);
        const videoUrl = searchParams.get('url');

        if (!videoUrl) {
            return new Response('Proxy Active', { status: 200 });
        }

        // Ambil range header dari player frontend (PENTING untuk kelancaran seeking/skip video)
        const rangeHeader = request.headers.get('range');
        
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Referer': 'https://www.4khotvideo.com/',
            'Connection': 'keep-alive', // Menjaga koneksi pipa antar-server tetap terbuka
        };

        if (rangeHeader) {
            headers['Range'] = rangeHeader;
        }

        // Tembak langsung ke server asal video
        const response = await fetch(videoUrl, { 
            headers,
            // Beritahu Vercel untuk langsung mengalirkan data tanpa melakukan enkripsi/pembacaan ulang
            redirect: 'follow' 
        });

        // Buat objek header baru untuk dikirim balik ke React Player
        const responseHeaders = new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Range',
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=1200, stale-while-revalidate=600', // Caching pendek untuk potongan video yang sama
            'Content-Type': response.headers.get('content-type') || 'video/mp4',
        });

        // Salir header penting jika server asal menyediakannya
        if (response.headers.get('content-range')) {
            responseHeaders.set('Content-Range', response.headers.get('content-range'));
        }
        if (response.headers.get('content-length')) {
            responseHeaders.set('Content-Length', response.headers.get('content-length'));
        }

        return new Response(response.body, {
            status: response.status,
            headers: responseHeaders,
        });

    } catch (error) {
        return new Response(`Proxy Error: ${error.message}`, { status: 500 });
    }
}