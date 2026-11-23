// Sirve la tienda Petrato en su URL de Cloudflare (workers.dev).
// Pide cada archivo al Worker "petrato" y quita la redirección a petrato.net.
const REDIRECT = /<script>if\(\/\\\.workers\\\.dev\$\/\.test\(location\.hostname\)\)location\.replace\([^<]*?\);<\/script>/g;
const TEXT = /text\/html|xml|text\/plain|javascript|json|manifest/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const upstream = new URL(url.pathname + url.search, "https://petrato.retratos.workers.dev");
    const res = await env.PETRATO.fetch(new Request(upstream, request));

    const type = res.headers.get("content-type") || "";
    if (!TEXT.test(type)) return res;

    let body = await res.text();
    body = body.replace(REDIRECT, "").replaceAll("https://petrato.net", url.origin);

    const headers = new Headers(res.headers);
    headers.delete("content-length");
    headers.delete("etag");
    return new Response(body, { status: res.status, statusText: res.statusText, headers });
  },
};
