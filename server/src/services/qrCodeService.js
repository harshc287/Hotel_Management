import QRCode from 'qrcode';

export async function generateQrDataUrl({ baseUrl, token }) {
  const url = `${baseUrl}/qr/${token}`;
  const dataUrl = await QRCode.toDataURL(url, {
    width: 512,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });
  return { url, dataUrl };
}