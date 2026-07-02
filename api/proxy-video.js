// api/proxy-video.js

// 1. WAJIB set runtime ke edge agar terhindar dari limit timeout 10 detik!
export const config = {
    runtime: 'edge', 
};

export default async function handler(request) {
    try {
        const { searchParams } = new URL(request.url);
        const videoUrl = searchParams.get('url');

        if (!videoUrl) {
            return new Response('URL parameter wajib ada!', { status: 400 });
        }

        // Ambil header Range dari frontend React (Penting untuk skip/seeking video)
        const rangeHeader = request.headers.get('range');

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Referer': 'https://www.4khotvideo.com/',
        };

        if (rangeHeader) {
            headers['Range'] = rangeHeader;
        }

        // Tembak langsung ke Terabox
        const response = await fetch(videoUrl, {
            headers: headers,
        });

        // Ambil data dalam bentuk ReadableStream (Web Streams API)
        const videoStream = response.body;

        // Alirkan langsung ke frontend React sepotong demi sepotong (Chunks)
        return new Response(videoStream, {
            status: response.status,
            headers: {
                'Content-Type': response.headers.get('content-type') || 'video/mp4',
                'Content-Range': response.headers.get('content-range') || '',
                'Accept-Ranges': 'bytes',
                'Content-Length': response.headers.get('content-length') || '',
                'Access-Control-Allow-Origin': '*', // Izinkan CORS agar frontend React bisa akses
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });

    } catch (error) {
        return new Response(`Proxy Error: ${error.message}`, { status: 500 });
    }
}