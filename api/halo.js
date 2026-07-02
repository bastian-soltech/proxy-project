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
        return new Response({
            data:'helo'
        });

    } catch (error) {
        return new Response(`Proxy Error: ${error.message}`, { status: 500 });
    }
}