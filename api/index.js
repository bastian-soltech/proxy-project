export const config = {
    runtime: 'edge', // Menggunakan Vercel Edge agar tidak ada limit 10 detik
};

export default async function handler(request) {
    // 1. Handle CORS Pre-flight request dari frontend React
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Range',
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    try {
        const { searchParams } = new URL(request.url);
        const videoUrl = searchParams.get('url');

        // Jika user iseng buka domain utama tanpa parameter url
        if (!videoUrl) {
            return new Response('NontonYuk21 Edge Streaming Proxy is Running.', { status: 200 });
        }

        // 2. Ambil header Range untuk fitur skip / seeking video di player React
        const rangeHeader = request.headers.get('range');
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Referer': 'https://www.4khotvideo.com/',
        };

        if (rangeHeader) {
            headers['Range'] = rangeHeader;
        }

        // 3. Tembak dan alirkan data langsung dari Terabox
        const response = await fetch(videoUrl, { headers });
        const videoStream = response.body;

        // 4. Kembalikan respons berupa Stream (Chunks biner)
        return new Response(videoStream, {
            status: response.status,
            headers: {
                'Content-Type': response.headers.get('content-type') || 'video/mp4',
                'Content-Range': response.headers.get('content-range') || '',
                'Accept-Ranges': 'bytes',
                'Content-Length': response.headers.get('content-length') || '',
                'Access-Control-Allow-Origin': '*', // CORS open untuk React frontend
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });

    } catch (error) {
        return new Response(`Proxy Error: ${error.message}`, { status: 500 });
    }
}